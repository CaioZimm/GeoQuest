from app.models.schemas import RegisterRequest, LoginRequest, GoogleLoginRequest, UpdateProfileRequest
from app.services import auth_service
from sqlalchemy.orm import Session

def register_user(db: Session, req: RegisterRequest):
    user = auth_service.register_user(db, req)

    return {"message": "Conta criada com sucesso", "user_id": user.id}

def login_user(db: Session, req: LoginRequest):
    user = auth_service.login_user(db, req)

    return {"id": str(user.id), "email": user.email, "name": user.name}

def google_sync_user(db: Session, req: GoogleLoginRequest):
    user = auth_service.google_sync_user(db, req)

    return {"id": str(user.id), "email": user.email, "name": user.name}

def update_user_profile(db: Session, user_id: int, req: UpdateProfileRequest):
    user = auth_service.update_user_profile(db, user_id, req)

    return {"id": str(user.id), "email": user.email, "name": user.name}