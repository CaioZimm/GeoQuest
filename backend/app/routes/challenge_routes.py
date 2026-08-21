from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo
from datetime import datetime

from app.dependencies import get_current_user_id
from app.controllers import challenge_controller
from app.database.connection import get_db
from app.models import schemas

router = APIRouter()

@router.get("/daily-challenge", response_model=schemas.DailyChallengeResponse)
def get_daily_challenge(seed: str = None, db: Session = Depends(get_db)):
    return challenge_controller.get_daily_challenge_data(db, seed)

@router.get("/daily-challenge/extra-hint")
def get_extra_hint(seed: str = None, db: Session = Depends(get_db)):
    return challenge_controller.get_extra_hint(db, seed)

@router.get("/countries", response_model=list[str])
def get_all_countries(db: Session = Depends(get_db)):
    """Return a list of all country names for the frontend autocomplete."""
    return challenge_controller.list_all_countries(db)

@router.post("/daily-challenge/guess", response_model=schemas.GuessResponse)
def guess_country(request: schemas.GuessRequest, db: Session = Depends(get_db), authorization: str = Header(None)):
    user_id = get_current_user_id(authorization)
    return challenge_controller.process_guess(db, request, user_id)

@router.get("/progress/today")
def get_today_progress(db: Session = Depends(get_db), authorization: str = Header(None)):
    user_id = get_current_user_id(authorization)
    return challenge_controller.get_progress(db, user_id)

@router.get("/progress/stats", response_model=schemas.UserStatsResponse)
def get_user_stats(db: Session = Depends(get_db), authorization: str = Header(None)):
    user_id = get_current_user_id(authorization)
    return challenge_controller.get_user_stats(db, user_id)

@router.get("/progress/leaderboard", response_model=schemas.LeaderboardResponse)
def get_leaderboard(db: Session = Depends(get_db), authorization: str = Header(None)):
    user_id = None
    if authorization:
        try:
            user_id = get_current_user_id(authorization)
        except Exception:
            pass
    return challenge_controller.get_leaderboard(db, user_id)