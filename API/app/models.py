from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import enum
from .config import settings

# Database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models
class UserType(str, enum.Enum):
    TEAM = "team"
    REFEREE = "referee"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    user_type = Column(Enum(UserType))

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    is_blocked = Column(Boolean, default=False)

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    level = Column(Integer)
    score = Column(Integer, default=0)
    team_id = Column(Integer, ForeignKey("teams.id"))

class Referee(Base):
    __tablename__ = "referees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    last_name = Column(String)
    level = Column(Integer)
    score = Column(Integer, default=0)
    fiscal_code = Column(String, unique=True, index=True)

class Tournament(Base):
    __tablename__ = "tournaments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    edition = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    min_level = Column(Integer)
    min_referee_level = Column(Integer)
    status = Column(String)  # upcoming, active, completed
    court_type = Column(String)

class TournamentRegistration(Base):
    __tablename__ = "tournament_registrations"
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    player_id = Column(Integer, ForeignKey("players.id"))
    registration_date = Column(DateTime, default=None)

class RefereeAvailability(Base):
    __tablename__ = "referee_availability"
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    referee_id = Column(Integer, ForeignKey("referees.id"))
    is_available = Column(Boolean, default=True)

# Dependency

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 