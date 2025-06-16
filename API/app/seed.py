from sqlalchemy.orm import Session
from .models import (
    Base, engine, User, Team, Player, Referee, Tournament,
    UserType, TournamentRegistration, RefereeAvailability, Match, MatchPhase, Phase
)
from datetime import datetime, timedelta
import random

# Create tables
Base.metadata.create_all(bind=engine)

def seed_database():
    # Create a session
    db = Session(bind=engine)
    
    try:
        # Clear existing data
        db.query(Match).delete()
        db.query(Phase).delete()
        db.query(RefereeAvailability).delete()
        db.query(TournamentRegistration).delete()
        db.query(Tournament).delete()
        db.query(Referee).delete()
        db.query(Player).delete()
        db.query(Team).delete()
        db.query(User).delete()
        db.commit()

        # Create admin user
        admin_user = User(
            email="admin@tennishub.com",
            password="admin123",
            user_type=UserType.ADMIN
        )
        db.add(admin_user)
        
        # Create teams
        teams = [
            {
                "name": "Team Alpha",
                "email": "alpha@tennishub.com",
                "is_blocked": False
            },
            {
                "name": "Team Beta",
                "email": "beta@tennishub.com",
                "is_blocked": False
            },
            {
                "name": "Team Gamma",
                "email": "gamma@tennishub.com",
                "is_blocked": False
            },
            {
                "name": "Team Delta",
                "email": "delta@tennishub.com",
                "is_blocked": False
            }
        ]
        
        created_teams = []
        for team_data in teams:
            team_user = User(
                email=team_data["email"],
                password="team123",
                user_type=UserType.TEAM
            )
            db.add(team_user)
            db.flush()
            
            team = Team(
                name=team_data["name"],
                user_id=team_user.id,
                is_blocked=team_data["is_blocked"],
                disciplinary_actions_count=0
            )
            db.add(team)
            created_teams.append(team)
        
        db.flush()
        
        # Create players (16 players, 4 per team)
        players = []
        player_names = [
            ("John", "Doe"), ("Jane", "Smith"), ("Mike", "Johnson"), ("Sarah", "Williams"),
            ("David", "Brown"), ("Emma", "Davis"), ("Alex", "Turner"), ("Olivia", "Martinez"),
            ("James", "Wilson"), ("Sophia", "Lee"), ("Daniel", "Garcia"), ("Isabella", "Rodriguez"),
            ("Ethan", "Moore"), ("Ava", "Taylor"), ("Noah", "Anderson"), ("Mia", "Thomas")
        ]
        
        for i, (first_name, last_name) in enumerate(player_names):
            team_index = i // 4  # 4 players per team
            player = Player(
                name=f"{first_name} {last_name}",
                level=random.randint(4, 6),
                score=random.randint(70, 120),
                team_id=created_teams[team_index].id
            )
            db.add(player)
            players.append(player)
        
        # Create referees
        referees = [
            Referee(
                name="Robert",
                last_name="Wilson",
                level=3,
                score=150,
                fiscal_code="WILRBT80A01H501U"
            ),
            Referee(
                name="Maria",
                last_name="Garcia",
                level=4,
                score=180,
                fiscal_code="GRCMRA85B02H502V"
            ),
            Referee(
                name="James",
                last_name="Taylor",
                level=3,
                score=160,
                fiscal_code="TJRJMS82C03H503W"
            ),
            Referee(
                name="Linda",
                last_name="Brown",
                level=5,
                score=200,
                fiscal_code="BROLIN75D04H504X"
            )
        ]
        for referee in referees:
            db.add(referee)
            referee_user = User(
                email=f"{referee.name.lower()}.{referee.last_name.lower()}@tennishub.com",
                password="referee123",
                user_type=UserType.REFEREE
            )
            db.add(referee_user)
        
        # Create tournaments
        tournaments = [
            Tournament(
                name="Summer Championship",
                edition="2024",
                start_date=datetime.now() - timedelta(days=30),  # Started 30 days ago
                end_date=datetime.now() - timedelta(days=23),    # Ended 23 days ago
                min_level=4,
                min_referee_level=3,
                status="completed",
                court_type="clay"
            ),
            Tournament(
                name="Winter Cup",
                edition="2024",
                start_date=datetime.now() + timedelta(days=30),  # Starts in 30 days
                end_date=datetime.now() + timedelta(days=37),    # Ends in 37 days
                min_level=5,
                min_referee_level=4,
                status="upcoming",
                court_type="hard"
            ),
            Tournament(
                name="Autumn Open",
                edition="2024",
                start_date=datetime.now() + timedelta(days=90),  # Starts in 90 days
                end_date=datetime.now() + timedelta(days=97),    # Ends in 97 days
                min_level=3,
                min_referee_level=2,
                status="upcoming",
                court_type="grass"
            )
        ]
        for tournament in tournaments:
            db.add(tournament)
        
        db.flush()

        # Create phases for each tournament
        for tournament in tournaments:
            t_start_date = tournament.start_date
            phases_data = [
                (MatchPhase.ROUND_OF_16.value, timedelta(days=0), timedelta(days=1)),
                (MatchPhase.QUARTERFINAL.value, timedelta(days=2), timedelta(days=3)),
                (MatchPhase.SEMIFINAL.value, timedelta(days=4), timedelta(days=5)),
                (MatchPhase.FINAL.value, timedelta(days=6), timedelta(days=7)),
            ]

            for phase_name, start_offset, end_offset in phases_data:
                phase = Phase(
                    tournament_id=tournament.id,
                    name=phase_name,
                    start_date=t_start_date + start_offset,
                    end_date=t_start_date + end_offset
                )
                db.add(phase)
        
        db.flush()

        # Register players for tournaments
        # Summer Championship (completed) - all 16 players
        summer_championship = tournaments[0]
        for player in players:
            registration = TournamentRegistration(
                tournament_id=summer_championship.id,
                player_id=player.id
            )
            db.add(registration)

        # Winter Cup (upcoming) - first 8 players
        winter_cup = tournaments[1]
        for player in players[:8]:
            registration = TournamentRegistration(
                tournament_id=winter_cup.id,
                player_id=player.id
            )
            db.add(registration)

        # Autumn Open - no registrations

        db.flush()

        # Create matches for Summer Championship (completed tournament)
        summer_phases = db.query(Phase).filter(Phase.tournament_id == summer_championship.id).all()
        
        # Round of 16 matches
        round_of_16 = next(p for p in summer_phases if p.name == MatchPhase.ROUND_OF_16.value)
        round_of_16_matches = [
            (players[0], players[1], "6-4, 6-3", players[0]),  # Match 1
            (players[2], players[3], "7-5, 6-4", players[2]),  # Match 2
            (players[4], players[5], "6-2, 6-2", players[4]),  # Match 3
            (players[6], players[7], "6-3, 6-4", players[6]),  # Match 4
            (players[8], players[9], "6-4, 7-5", players[8]),  # Match 5
            (players[10], players[11], "6-2, 6-1", players[10]),  # Match 6
            (players[12], players[13], "7-6, 6-4", players[12]),  # Match 7
            (players[14], players[15], "6-3, 6-3", players[14]),  # Match 8
        ]
        
        for i, (player1, player2, score, winner) in enumerate(round_of_16_matches):
            match = Match(
                tournament_id=summer_championship.id,
                player1_id=player1.id,
                player2_id=player2.id,
                referee_id=referees[i % len(referees)].id,
                phase_id=round_of_16.id,
                match_date=round_of_16.start_date + timedelta(hours=i*2),
                court_number=(i % 4) + 1,
                status="completed",
                score=score,
                winner_id=winner.id
            )
            db.add(match)

        # Quarterfinal matches
        quarterfinal = next(p for p in summer_phases if p.name == MatchPhase.QUARTERFINAL.value)
        quarterfinal_matches = [
            (players[0], players[2], "6-4, 7-5", players[0]),  # Match 1
            (players[4], players[6], "6-3, 6-4", players[4]),  # Match 2
            (players[8], players[10], "7-6, 6-4", players[8]),  # Match 3
            (players[12], players[14], "6-4, 6-3", players[12]),  # Match 4
        ]
        
        for i, (player1, player2, score, winner) in enumerate(quarterfinal_matches):
            match = Match(
                tournament_id=summer_championship.id,
                player1_id=player1.id,
                player2_id=player2.id,
                referee_id=referees[i % len(referees)].id,
                phase_id=quarterfinal.id,
                match_date=quarterfinal.start_date + timedelta(hours=i*2),
                court_number=(i % 2) + 1,
                status="completed",
                score=score,
                winner_id=winner.id
            )
            db.add(match)

        # Semifinal matches
        semifinal = next(p for p in summer_phases if p.name == MatchPhase.SEMIFINAL.value)
        semifinal_matches = [
            (players[0], players[4], "6-4, 6-3", players[0]),  # Match 1
            (players[8], players[12], "7-5, 6-4", players[8]),  # Match 2
        ]
        
        for i, (player1, player2, score, winner) in enumerate(semifinal_matches):
            match = Match(
                tournament_id=summer_championship.id,
                player1_id=player1.id,
                player2_id=player2.id,
                referee_id=referees[i % len(referees)].id,
                phase_id=semifinal.id,
                match_date=semifinal.start_date + timedelta(hours=i*2),
                court_number=1,
                status="completed",
                score=score,
                winner_id=winner.id
            )
            db.add(match)

        # Final match
        final = next(p for p in summer_phases if p.name == MatchPhase.FINAL.value)
        final_match = Match(
            tournament_id=summer_championship.id,
            player1_id=players[0].id,
            player2_id=players[8].id,
            referee_id=referees[0].id,
            phase_id=final.id,
            match_date=final.start_date,
            court_number=1,
            status="completed",
            score="6-4, 7-6",
            winner_id=players[0].id
        )
        db.add(final_match)
        
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 