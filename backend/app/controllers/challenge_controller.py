from app.services import challenge_service
from sqlalchemy.orm import Session
from app.models import schemas

def get_daily_challenge_data(db: Session, seed: str = None):
    return challenge_service.get_daily_challenge_data(db, seed)

def list_all_countries(db: Session):
    return challenge_service.list_all_countries(db)

def get_extra_hint(db: Session, seed: str = None):
    return challenge_service.get_extra_hint(db, seed)

def process_guess(db: Session, request: schemas.GuessRequest, user_id: str = None):
    return challenge_service.process_guess(db, request, user_id)

def get_progress(db: Session, user_id: str):
    return challenge_service.get_progress(db, user_id)

def get_user_stats(db: Session, user_id: str):
    return challenge_service.get_user_stats(db, user_id)

def get_leaderboard(db: Session, user_id: str = None):
    return challenge_service.get_leaderboard(db, user_id)