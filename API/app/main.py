from fastapi import FastAPI, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from .models import (
    Base, SessionLocal, get_db,
    UserType, User, Team, Player, Referee, Tournament
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

class TournamentCreate(BaseModel):
    name: str
    edition: str
    start_date: datetime
    end_date: datetime
    min_level: int
    court_type: str

# FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    print(f"Login attempt - Email: {email}, Type: {user_type}")  # Debug log
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Login successful", "user_type": user.user_type}

# Team endpoints
@app.post("/api/teams/register")
async def register_team(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
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
    db.flush()
    
    # Create team
    db_team = Team(
        name=name,
        email=email
    )
    db.add(db_team)
    db.commit()
    return {"message": "Team registered successfully"}

# Player endpoints
@app.post("/api/players")
def register_player(player: PlayerCreate, db: Session = Depends(get_db)):
    db_player = Player(**player.dict())
    db.add(db_player)
    db.commit()
    return db_player

# Tournament endpoints
@app.get("/api/tournaments")
def get_tournaments(db: Session = Depends(get_db)):
    return db.query(Tournament).all()

@app.post("/api/tournaments")
def create_tournament(tournament: TournamentCreate, db: Session = Depends(get_db)):
    db_tournament = Tournament(**tournament.dict())
    db.add(db_tournament)
    db.commit()
    return db_tournament

# Team management endpoints
@app.get("/api/teams")
def get_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

# Get team players
@app.get("/api/teams/{team_id}/players")
def get_team_players(team_id: int, db: Session = Depends(get_db)):
    return db.query(Player).filter(Player.team_id == team_id).all() 