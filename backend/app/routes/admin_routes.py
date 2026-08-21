from app.models.admin_schemas import AdminCountryCreate, AdminCountryResponse, AdminUserResponse, AdminDashboardResponse
from fastapi import APIRouter, Depends, HTTPException, Header
from app.controllers.admin_controller import AdminController
from app.routes.auth_routes import get_current_user_id
from app.database.connection import get_db
from sqlalchemy.orm import Session

router = APIRouter()

def verify_admin(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Não autorizado")
    user_id = get_current_user_id(authorization)
    
    if str(user_id) not in ("0"):
        raise HTTPException(status_code=403, detail="Acesso restrito ao administrador")
    return user_id

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_dashboard_metrics(db: Session = Depends(get_db), admin_id: str = Depends(verify_admin)):
    return AdminController.get_dashboard(db)

@router.get("/users", response_model=list[AdminUserResponse])
def get_all_users(db: Session = Depends(get_db), admin_id: str = Depends(verify_admin)):
    return AdminController.get_users(db)

@router.get("/countries", response_model=list[AdminCountryResponse])
def get_all_countries(db: Session = Depends(get_db), admin_id: str = Depends(verify_admin)):
    return AdminController.get_countries(db)

@router.post("/countries", response_model=AdminCountryResponse)
def create_country(data: AdminCountryCreate, db: Session = Depends(get_db), admin_id: str = Depends(verify_admin)):
    return AdminController.create_country(db, data)

@router.put("/countries/{country_id}", response_model=AdminCountryResponse)
def update_country(country_id: int, data: AdminCountryCreate, db: Session = Depends(get_db), admin_id: str = Depends(verify_admin)):
    return AdminController.update_country(db, country_id, data)

@router.delete("/countries/{country_id}")
def delete_country(country_id: int, db: Session = Depends(get_db), admin_id: str = Depends(verify_admin)):
    return AdminController.delete_country(db, country_id)