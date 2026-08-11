from app.models.schemas import RegisterRequest, LoginRequest, GoogleLoginRequest
from app.controllers import auth_controller
from app.database.connection import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    return auth_controller.register_user(db, req)

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return auth_controller.login_user(db, req)

@router.post("/google")
def google_sync(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Syncs a Google user to the local database upon login."""
    return auth_controller.google_sync_user(db, req)