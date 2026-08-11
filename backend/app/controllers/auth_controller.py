from app.models.schemas import RegisterRequest, LoginRequest, GoogleLoginRequest
from passlib.context import CryptContext
from app.models.models import User
from sqlalchemy.orm import Session
from fastapi import HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def register_user(db: Session, req: RegisterRequest):
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado.")

    hashed_password = pwd_context.hash(req.password)
    user = User(
        email=req.email,
        password_hash=hashed_password,
        name=req.name,
        provider="local"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "Conta criada com sucesso", "user_id": user.id}

def login_user(db: Session, req: LoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    if user.provider != "local":
        raise HTTPException(status_code=401, detail="Esta conta usa um login social (Google).")

    if not pwd_context.verify(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name
    }

def google_sync_user(db: Session, req: GoogleLoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(
            email=req.email,
            name=req.name,
            provider="google"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name
    }