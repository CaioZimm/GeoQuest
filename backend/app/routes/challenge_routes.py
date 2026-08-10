from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.controllers import challenge_controller
from app.database.connection import get_db
from app.models import schemas

router = APIRouter()

@router.get("/daily-challenge", response_model=schemas.DailyChallengeResponse)
def get_daily_challenge(seed: str = None, db: Session = Depends(get_db)):
    return challenge_controller.get_daily_challenge_data(db, seed)

@router.get("/countries", response_model=list[str])
def get_all_countries(db: Session = Depends(get_db)):
    """Return a list of all country names for the frontend autocomplete."""
    return challenge_controller.list_all_countries(db)

@router.post("/daily-challenge/guess", response_model=schemas.GuessResponse)
def guess_country(request: schemas.GuessRequest, db: Session = Depends(get_db)):
    return challenge_controller.process_guess(db, request)