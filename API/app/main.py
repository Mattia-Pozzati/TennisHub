from fastapi import FastAPI, HTTPException, Depends, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import random # Added for shuffling players
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.sql import func
from .models import (
    Base, SessionLocal, get_db,
    UserType, User, Team, Player, Referee, Tournament, Match, MatchPhase, Phase, TournamentRegistration
)

# Pydantic models
class UserBase(BaseModel):
    email: str
    password: str

class TeamCreate(BaseModel):
    name: str
    email: str
    password: str

class PlayerCreate(BaseModel):
    name: str
    level: int
    team_id: int

class TournamentCreate(BaseModel):
    name: str
    edition: str
    start_date: datetime
    end_date: datetime
    min_level: int
    min_referee_level: int
    court_type: str

class TournamentResponse(BaseModel):
    id: int
    name: str
    edition: str
    start_date: datetime
    end_date: datetime
    min_level: int
    min_referee_level: int
    status: str
    court_type: str
    spectator_count: int

    class Config:
        from_attributes = True

class MatchResponse(BaseModel):
    id: int
    tournament_id: int
    player1_id: int
    player2_id: int
    referee_id: int
    phase_id: int
    phase_name: str
    winner_id: Optional[int]
    match_date: datetime
    court_number: int
    score: Optional[str]
    status: str

    class Config:
        from_attributes = True

class TournamentMatchesResponse(BaseModel):
    tournament_id: int
    tournament_name: str
    matches: Dict[str, List[MatchResponse]]

class MatchCreate(BaseModel):
    player1_id: int
    player2_id: int
    referee_id: int
    phase_id: int
    match_date: datetime
    court_number: int
    status: str
    score: Optional[str] = None
    winner_id: Optional[int] = None

    class Config:
        from_attributes = True

class MatchUpdate(BaseModel):
    score: Optional[str] = None
    winner_id: Optional[int] = None
    status: Optional[str] = None

class PhaseResponse(BaseModel):
    id: int
    tournament_id: int
    name: str
    start_date: datetime
    end_date: datetime

    class Config:
        from_attributes = True

class TeamTournamentRegistration(BaseModel):
    team_id: int
    player_ids: List[int]

class PlayerRanking(BaseModel):
    id: int
    name: str
    level: int
    score: int
    team_id: int
    team_name: Optional[str] = None
    ranking: int

    class Config:
        from_attributes = True

class PlayerResponse(BaseModel):
    id: int
    name: str
    level: int
    score: int
    team_id: int
    team_name: Optional[str] = None

    class Config:
        from_attributes = True

class RefereeResponse(BaseModel):
    id: int
    name: str
    last_name: str
    level: int
    score: int
    fiscal_code: str

    class Config:
        from_attributes = True

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Allow both React and Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test endpoint
@app.get("/api/test")
def test_endpoint():
    return {"message": "API is working!"}

# Auth endpoints
@app.post("/api/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    user_type: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        print(f"Login attempt - Email: {email}, Type: {user_type}")  # Debug log
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Simple password comparison for school project
        if user.password != password:
            raise HTTPException(status_code=401, detail="Invalid password")
            
        if user.user_type.value != user_type:
            raise HTTPException(status_code=403, detail="Invalid user type")
        
        response_data = {
            "message": "Login successful",
            "user_type": user.user_type.value,
            "user_id": user.id
        }
        
        # If user is a team, include team information
        if user.user_type == UserType.TEAM:
            team = db.query(Team).filter(Team.user_id == user.id).first()
            if team:
                response_data["team_id"] = team.id
                response_data["team_name"] = team.name
                response_data["is_blocked"] = team.is_blocked
        
        return response_data
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

# Team endpoints
@app.post("/api/teams/register")
async def register_team(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        print(f"Registration attempt - Name: {name}, Email: {email}")  # Debug log
        
        # Check if email already exists
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        db_user = User(
            email=email,
            password=password,  # In a real app, this should be hashed
            user_type=UserType.TEAM
        )
        db.add(db_user)
        db.flush()  # Flush to get the user ID
        
        # Create team
        db_team = Team(
            name=name,
            user_id=db_user.id,
            is_blocked=False,
            disciplinary_actions_count=0
        )
        db.add(db_team)
        db.commit()
        
        return {
            "message": "Team registered successfully",
            "team_id": db_team.id,
            "user_id": db_user.id
        }
    except Exception as e:
        db.rollback()
        print(f"Registration error: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

# Player endpoints
@app.post("/api/players")
def register_player(player: PlayerCreate, db: Session = Depends(get_db)):
    # Verify team exists
    team = db.query(Team).filter(Team.id == player.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    db_player = Player(**player.dict())
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@app.get("/api/players/{player_id}", response_model=PlayerResponse)
def get_player_profile(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    team = db.query(Team).filter(Team.id == player.team_id).first()
    player_data = player.__dict__
    player_data["team_name"] = team.name if team else None

    return PlayerResponse(**player_data)

# Tournament endpoints
@app.get("/api/tournaments")
def get_tournaments(team_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Tournament)

    if team_id is not None:
        # Filter out tournaments with 16 or more registered players
        # Count players registered for each tournament
        player_counts = db.query(
            TournamentRegistration.tournament_id,
            func.count(TournamentRegistration.player_id).label('player_count')
        ).group_by(TournamentRegistration.tournament_id).subquery()

        # Join with player_counts and filter
        query = query.outerjoin(player_counts, Tournament.id == player_counts.c.tournament_id)
        query = query.filter(
            or_(
                player_counts.c.player_count < 16,
                player_counts.c.player_count == None # Include tournaments with no registered players yet
            )
        )

    tournaments = query.all()
    print(f"Fetched tournaments: {tournaments}") # Added for debugging
    return tournaments

@app.post("/api/tournaments")
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db)):
    try:
        # Validate dates
        if tournament.start_date >= tournament.end_date:
            raise HTTPException(status_code=400, detail="End date must be after start date")
        
        # Create tournament
        db_tournament = Tournament(
            name=tournament.name,
            edition=tournament.edition,
            start_date=tournament.start_date,
            end_date=tournament.end_date,
            min_level=tournament.min_level,
            min_referee_level=tournament.min_referee_level,
            status="upcoming",
            court_type=tournament.court_type,
            spectator_count=0
        )
        db.add(db_tournament)
        db.commit()
        db.refresh(db_tournament)
        
        # Create initial phase
        initial_phase = Phase(
            tournament_id=db_tournament.id,
            name="First Round",
            start_date=tournament.start_date,
            end_date=tournament.start_date + timedelta(days=1)
        )
        db.add(initial_phase)
        db.commit()
        
        return {
            "message": "Tournament created successfully",
            "tournament_id": db_tournament.id,
            "phase_id": initial_phase.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Team management endpoints
@app.get("/api/teams")
def get_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

@app.post("/api/teams/{team_id}/discipline")
def discipline_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team.disciplinary_actions_count += 1
    if team.disciplinary_actions_count >= 3:
        team.is_blocked = True
    
    db.add(team)
    db.commit()
    db.refresh(team)
    return {"message": f"Disciplinary action recorded for team {team.name}. Current actions: {team.disciplinary_actions_count}. Blocked: {team.is_blocked}"}

@app.post("/api/teams/{team_id}/unblock")
def unblock_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    team.is_blocked = False
    team.disciplinary_actions_count = 0
    
    db.add(team)
    db.commit()
    db.refresh(team)
    return {"message": f"Team {team.name} has been unblocked and disciplinary actions reset."}

# Get team players
@app.get("/api/teams/{team_id}/players")
def get_team_players(team_id: int, db: Session = Depends(get_db)):
    return db.query(Player).filter(Player.team_id == team_id).all()

@app.get("/api/tournaments/{tournament_id}/matches", response_model=TournamentMatchesResponse)
def get_tournament_matches(tournament_id: int, db: Session = Depends(get_db)):
    try:
        # Get tournament
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            print(f"Tournament {tournament_id} not found")
            raise HTTPException(status_code=404, detail="Tournament not found")
        
        print(f"Found tournament: {tournament.name}")
        
        # Get all matches for the tournament, joining with Phase to get phase name
        matches_with_phases = db.query(Match, Phase.name.label("phase_name")) \
                                .join(Phase, Match.phase_id == Phase.id) \
                                .filter(Match.tournament_id == tournament_id) \
                                .all()
        
        print(f"Raw matches with phase names from DB for tournament {tournament_id}: {matches_with_phases}")
        print(f"Found {len(matches_with_phases)} matches for tournament {tournament_id}")
        
        # Group matches by phase name
        matches_by_phase = {}
        # Get all possible phases for the tournament to ensure all columns are present
        tournament_phases = db.query(Phase).filter(Phase.tournament_id == tournament_id).all()
        for phase_obj in tournament_phases:
            matches_by_phase[phase_obj.name] = [] # Initialize with empty lists

        for match_obj, phase_name in matches_with_phases:
            # Manually construct MatchResponse to include phase_name from the join
            match_response = MatchResponse(
                id=match_obj.id,
                tournament_id=match_obj.tournament_id,
                player1_id=match_obj.player1_id,
                player2_id=match_obj.player2_id,
                referee_id=match_obj.referee_id,
                phase_id=match_obj.phase_id,
                phase_name=phase_name, # Assign phase_name directly
                winner_id=match_obj.winner_id,
                match_date=match_obj.match_date,
                court_number=match_obj.court_number,
                score=match_obj.score,
                status=match_obj.status
            )
            matches_by_phase[phase_name].append(match_response.dict())
        
        response = {
            "tournament_id": tournament.id,
            "tournament_name": tournament.name,
            "matches": matches_by_phase
        }
        print("Response:", response)
        return response
        
    except Exception as e:
        print(f"Error in get_tournament_matches: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tournaments/{tournament_id}/players")
def get_tournament_players(tournament_id: int, db: Session = Depends(get_db)):
    # Get tournament
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Get all players registered for the tournament through TournamentRegistration
    registered_players = db.query(Player).join(
        TournamentRegistration, Player.id == TournamentRegistration.player_id
    ).filter(
        TournamentRegistration.tournament_id == tournament_id
    ).all()
    
    return registered_players

@app.get("/api/referees")
def get_referees(db: Session = Depends(get_db)):
    referees = db.query(Referee).all()
    return referees

@app.get("/api/referees/{referee_id}", response_model=RefereeResponse)
def get_referee_profile(referee_id: int, db: Session = Depends(get_db)):
    referee = db.query(Referee).filter(Referee.id == referee_id).first()
    if not referee:
        raise HTTPException(status_code=404, detail="Referee not found")
    return referee

@app.post("/api/tournaments/{tournament_id}/matches")
def create_tournament_match(tournament_id: int, match: MatchCreate, db: Session = Depends(get_db)):
    try:
        # Get tournament
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")
        
        # Validate phase
        phase = db.query(Phase).filter(Phase.id == match.phase_id).first()
        if not phase or phase.tournament_id != tournament_id:
            raise HTTPException(status_code=404, detail="Invalid phase")
        
        # Validate players
        player1 = db.query(Player).filter(Player.id == match.player1_id).first()
        player2 = db.query(Player).filter(Player.id == match.player2_id).first()
        if not player1 or not player2:
            raise HTTPException(status_code=404, detail="One or both players not found")
        
        # Validate referee
        referee = db.query(Referee).filter(Referee.id == match.referee_id).first()
        if not referee:
            raise HTTPException(status_code=404, detail="Referee not found")
        
        # Validate referee level
        if referee.level < tournament.min_referee_level:
            raise HTTPException(status_code=400, detail="Referee level too low for this tournament")
        
        # Create match
        db_match = Match(
            tournament_id=tournament_id,
            player1_id=match.player1_id,
            player2_id=match.player2_id,
            referee_id=match.referee_id,
            phase_id=match.phase_id,
            match_date=match.match_date,
            court_number=match.court_number,
            status=match.status,
            score=match.score,
            winner_id=match.winner_id
        )
        db.add(db_match)
        db.commit()
        db.refresh(db_match)
        
        return {
            "message": "Match created successfully",
            "match_id": db_match.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/matches/{match_id}")
def update_match(match_id: int, match_update: MatchUpdate, db: Session = Depends(get_db)):
    try:
        # Get match
        match = db.query(Match).filter(Match.id == match_id).first()
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Update match
        if match_update.score is not None:
            match.score = match_update.score
        if match_update.winner_id is not None:
            match.winner_id = match_update.winner_id
        if match_update.status is not None:
            match.status = match_update.status
        
        db.commit()
        db.refresh(match)
        
        return {
            "message": "Match updated successfully",
            "match_id": match.id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tournaments/{tournament_id}/phases", response_model=List[PhaseResponse])
def get_tournament_phases(tournament_id: int, db: Session = Depends(get_db)):
    phases = db.query(Phase).filter(Phase.tournament_id == tournament_id).all()
    return phases

@app.post("/api/tournaments/{tournament_id}/register-team")
def register_team_for_tournament(tournament_id: int, registration: TeamTournamentRegistration, db: Session = Depends(get_db)):
    # Get tournament
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Verify all players belong to the team
    team_players = db.query(Player).filter(
        Player.team_id == registration.team_id,
        Player.id.in_(registration.player_ids)
    ).all()
    
    if len(team_players) != len(registration.player_ids):
        raise HTTPException(status_code=400, detail="Some players do not belong to the team")
    
    # Check if any player is already registered
    existing_registrations = db.query(TournamentRegistration).filter(
        TournamentRegistration.tournament_id == tournament_id,
        TournamentRegistration.player_id.in_(registration.player_ids)
    ).all()
    
    if existing_registrations:
        raise HTTPException(status_code=400, detail="Some players are already registered for this tournament")
    
    # Create registrations for each player
    for player in team_players:
        db_registration = TournamentRegistration(
            tournament_id=tournament_id,
            player_id=player.id
        )
        db.add(db_registration)
    
    db.commit()
    return {"message": "Players registered successfully for the tournament"}

# New endpoint to get tournaments for a specific team, optionally filtered by status
@app.get("/api/teams/{team_id}/tournaments")
def get_team_tournaments(
    team_id: int,
    db: Session = Depends(get_db),
    status: Optional[str] = None # Filter by status (e.g., 'upcoming', 'completed')
):
    # Get all players belonging to the team
    team_players = db.query(Player).filter(Player.team_id == team_id).all()
    if not team_players:
        return [] # No players in team, so no tournaments they can register for

    # Get tournament IDs that any player from this team is registered for
    registered_tournament_ids = db.query(TournamentRegistration.tournament_id).filter(
        TournamentRegistration.player_id.in_([p.id for p in team_players])
    ).distinct().all()

    # Extract just the IDs from the result
    tournament_ids = [t_id for (t_id,) in registered_tournament_ids]

    # Fetch tournaments based on these IDs
    query = db.query(Tournament).filter(Tournament.id.in_(tournament_ids))
    
    if status:
        query = query.filter(Tournament.status == status)
        
    tournaments = query.all()
    return tournaments 

@app.get("/api/players/rankings", response_model=List[PlayerRanking])
def get_player_rankings(
    court_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of all players sorted by their scores in descending order.
    Can be filtered by court type.
    """
    # Base query to get all players with their team names
    query = db.query(Player, Team.name.label('team_name')) \
              .outerjoin(Team, Player.team_id == Team.id)

    # If court_type is specified, filter by completed matches in that court type
    if court_type is not None:
        # Get player IDs who have completed matches in the specified court type
        player_ids = db.query(Player.id) \
            .join(TournamentRegistration, Player.id == TournamentRegistration.player_id) \
            .join(Tournament, TournamentRegistration.tournament_id == Tournament.id) \
            .filter(Tournament.court_type == court_type, Tournament.status == 'completed') \
            .distinct() \
            .all()
        
        if player_ids:
            # Filter players to only those who have matches in the specified court type
            query = query.filter(Player.id.in_([p[0] for p in player_ids]))
        else:
            # If no players found for this court type, return empty list
            return []

    # Order by score descending
    query = query.order_by(Player.score.desc())

    results = query.all()
    
    rankings = []
    for rank, (player, team_name) in enumerate(results, 1):
        rankings.append(PlayerRanking(
            id=player.id,
            name=player.name,
            level=player.level,
            score=player.score,
            team_id=player.team_id,
            team_name=team_name or "N/A",
            ranking=rank
        ))
    
    return rankings

@app.get("/api/tournaments/history", response_model=List[TournamentResponse])
def get_tournament_history(team_id: Optional[int] = None, db: Session = Depends(get_db)):
    # Get all completed tournaments
    query = db.query(Tournament).filter(Tournament.status == 'completed')
    
    if team_id:
        # If team_id is provided, get tournaments where the team participated
        team_tournaments = db.query(Tournament).join(
            TournamentRegistration, Tournament.id == TournamentRegistration.tournament_id
        ).join(
            Player, TournamentRegistration.player_id == Player.id
        ).filter(
            Player.team_id == team_id
        ).distinct().all()
        
        return team_tournaments
    
    return query.all() 

# Scoring system constants
TOURNAMENT_SCORES = {
    "FINAL": {
        "winner": 100,
        "runner_up": 60
    },
    "SEMIFINAL": {
        "winner": 50,
        "loser": 30
    },
    "QUARTERFINAL": {
        "winner": 25,
        "loser": 15
    },
    "ROUND_OF_16": {
        "winner": 10,
        "loser": 5
    }
}

REFEREE_SCORING = {
    "FINAL": 10,
    "SEMIFINAL": 7,
    "QUARTERFINAL": 5,
    "ROUND_OF_16": 3,
}

def update_player_scores(tournament_id: int, db: Session):
    """Update player scores based on their performance in the tournament."""
    # Get all matches for the tournament
    matches = db.query(Match).join(Phase).filter(
        Match.tournament_id == tournament_id,
        Match.status == "completed"
    ).order_by(Phase.name).all()

    # Group matches by phase
    matches_by_phase = {}
    for match in matches:
        phase = db.query(Phase).filter(Phase.id == match.phase_id).first()
        if phase.name not in matches_by_phase:
            matches_by_phase[phase.name] = []
        matches_by_phase[phase.name].append(match)

    # Update scores for each phase
    for phase_name, phase_matches in matches_by_phase.items():
        if phase_name in TOURNAMENT_SCORES:
            for match in phase_matches:
                # Update winner's score
                if match.winner_id:
                    winner = db.query(Player).filter(Player.id == match.winner_id).first()
                    if winner:
                        winner.score += TOURNAMENT_SCORES[phase_name]["winner"]
                
                # Update loser's score
                loser_id = match.player2_id if match.winner_id == match.player1_id else match.player1_id
                loser = db.query(Player).filter(Player.id == loser_id).first()
                if loser:
                    loser.score += TOURNAMENT_SCORES[phase_name]["loser"]

    db.commit()

def update_referee_scores(tournament_id: int, db: Session):
    matches = db.query(Match).filter(Match.tournament_id == tournament_id, Match.status == "completed").all()
    referee_scores_update = {}

    for match in matches:
        # Ensure match.phase_id is not None before proceeding
        if match.phase_id:
            phase = db.query(Phase).filter(Phase.id == match.phase_id).first()
            if phase and phase.name in REFEREE_SCORING:
                referee_id = match.referee_id
                score_to_add = REFEREE_SCORING[phase.name]
                referee_scores_update[referee_id] = referee_scores_update.get(referee_id, 0) + score_to_add

    for referee_id, score_change in referee_scores_update.items():
        referee = db.query(Referee).filter(Referee.id == referee_id).first()
        if referee:
            referee.score += score_change
            db.add(referee)

    db.commit()
    print(f"[DEBUG] Referee scores updated for tournament {tournament_id}.")

@app.put("/api/tournaments/{tournament_id}/complete")
def complete_tournament(tournament_id: int, db: Session = Depends(get_db)):
    """Mark a tournament as completed and update player scores."""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    # Check if all matches are completed
    matches = db.query(Match).filter(Match.tournament_id == tournament_id).all()
    if not all(match.status == "completed" for match in matches):
        raise HTTPException(status_code=400, detail="Not all matches are completed")
    
    # Update tournament status
    tournament.status = "completed"
    
    # Update player scores
    update_player_scores(tournament_id, db)
    update_referee_scores(tournament_id, db)
    
    db.commit()
    return {"message": f"Tournament {tournament.name} ({tournament.edition}) marked as completed and scores updated."}

@app.get("/api/tournaments/most-spectators", response_model=TournamentCreate)
def get_tournament_with_most_spectators(db: Session = Depends(get_db)):
    """
    Retrieve the tournament with the highest spectator count.
    """
    tournament = db.query(Tournament).order_by(Tournament.spectator_count.desc()).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="No tournaments found with spectator data")
    return tournament

@app.get("/api/referees/rankings", response_model=List[RefereeResponse])
def get_referee_rankings(db: Session = Depends(get_db)):
    """
    Retrieve a list of all referees sorted by their scores in descending order.
    """
    referees = db.query(Referee).order_by(Referee.score.desc()).all()
    return referees 