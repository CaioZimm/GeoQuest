from app.models.schemas import RegisterRequest, LoginRequest, GoogleLoginRequest, UpdateProfileRequest
from app.models.models import User
from sqlalchemy.orm import Session
from fastapi import HTTPException
import bcrypt

def register_user(db: Session, req: RegisterRequest):
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado.")

    hashed_password = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = User(email=req.email, password_hash=hashed_password, name=req.name, provider="local")
    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def login_user(db: Session, req: LoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    if user.provider != "local":
        raise HTTPException(status_code=401, detail="Esta conta usa um login social (Google).")
    if not bcrypt.checkpw(req.password.encode('utf-8'), user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return user

def google_sync_user(db: Session, req: GoogleLoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        user = User(email=req.email, name=req.name, provider="google")
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

def update_user_profile(db: Session, user_id: int, req: UpdateProfileRequest):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    user.name = req.name
    if req.password:
        if user.provider != "local":
            raise HTTPException(status_code=400, detail="Não é possível alterar a senha de contas vinculadas ao Google.")
        hashed_password = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user.password_hash = hashed_password
    db.commit()
    db.refresh(user)

    return user