from sqlalchemy.orm import Session
from passlib.context import CryptContext
from .models import (
    Base, engine, User, Team, Player, Referee, Tournament,
    UserType, TournamentRegistration, RefereeAvailability
)
from datetime import datetime, timedelta

# Create tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    # Create a session
    db = Session(bind=engine)
    
    try:
        # Create admin user
        admin_user = User(
            email="admin@tennishub.com",
            password=pwd_context.hash("admin123"),
            user_type=UserType.ADMIN
        )
        db.add(admin_user)
        
        # Create teams
        teams = [
            Team(
                name="Team Alpha",
                email="alpha@tennishub.com",
                is_blocked=False
            ),
            Team(
                name="Team Beta",
                email="beta@tennishub.com",
                is_blocked=False
            ),
            Team(
                name="Team Gamma",
                email="gamma@tennishub.com",
                is_blocked=False
            )
        ]
        for team in teams:
            db.add(team)
            # Create team user
            team_user = User(
                email=team.email,
                password=pwd_context.hash("team123"),
                user_type=UserType.TEAM
            )
            db.add(team_user)
        
        db.flush()  # To get team IDs
        
        # Create players
        players = [
            Player(name="John Doe", level=5, score=100, team_id=teams[0].id),
            Player(name="Jane Smith", level=4, score=80, team_id=teams[0].id),
            Player(name="Mike Johnson", level=6, score=120, team_id=teams[1].id),
            Player(name="Sarah Williams", level=5, score=90, team_id=teams[1].id),
            Player(name="David Brown", level=4, score=70, team_id=teams[2].id),
            Player(name="Emma Davis", level=5, score=95, team_id=teams[2].id)
        ]
        for player in players:
            db.add(player)
        
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
            )
        ]
        for referee in referees:
            db.add(referee)
            # Create referee user
            referee_user = User(
                email=f"{referee.name.lower()}.{referee.last_name.lower()}@tennishub.com",
                password=pwd_context.hash("referee123"),
                user_type=UserType.REFEREE
            )
            db.add(referee_user)
        
        # Create tournaments
        tournaments = [
            Tournament(
                name="Summer Championship",
                edition="2024",
                start_date=datetime.now() + timedelta(days=30),
                end_date=datetime.now() + timedelta(days=37),
                min_level=4,
                min_referee_level=3,
                status="upcoming",
                court_type="clay"
            ),
            Tournament(
                name="Winter Cup",
                edition="2024",
                start_date=datetime.now() + timedelta(days=60),
                end_date=datetime.now() + timedelta(days=67),
                min_level=5,
                min_referee_level=4,
                status="upcoming",
                court_type="hard"
            )
        ]
        for tournament in tournaments:
            db.add(tournament)
        
        db.flush()  # To get tournament IDs
        
        # Create tournament registrations
        registrations = [
            TournamentRegistration(
                tournament_id=tournaments[0].id,
                player_id=players[0].id,
                registration_date=datetime.now()
            ),
            TournamentRegistration(
                tournament_id=tournaments[0].id,
                player_id=players[1].id,
                registration_date=datetime.now()
            ),
            TournamentRegistration(
                tournament_id=tournaments[1].id,
                player_id=players[2].id,
                registration_date=datetime.now()
            )
        ]
        for registration in registrations:
            db.add(registration)
        
        # Create referee availability
        availabilities = [
            RefereeAvailability(
                tournament_id=tournaments[0].id,
                referee_id=referees[0].id,
                is_available=True
            ),
            RefereeAvailability(
                tournament_id=tournaments[0].id,
                referee_id=referees[1].id,
                is_available=True
            ),
            RefereeAvailability(
                tournament_id=tournaments[1].id,
                referee_id=referees[2].id,
                is_available=True
            )
        ]
        for availability in availabilities:
            db.add(availability)
        
        # Commit all changes
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database() 