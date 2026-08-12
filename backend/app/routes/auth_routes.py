from app.models.schemas import RegisterRequest, LoginRequest, GoogleLoginRequest, UpdateProfileRequest
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user_id
from app.controllers import auth_controller
from app.database.connection import get_db
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

@router.put("/profile")
def update_profile(req: UpdateProfileRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    print(f"[DEBUG] /profile called. Resolved user_id: {user_id}")
    if not user_id:
        raise HTTPException(status_code=401, detail="Não autorizado")
    return auth_controller.update_user_profile(db, int(user_id), req)