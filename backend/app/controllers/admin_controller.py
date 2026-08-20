from app.models.admin_schemas import AdminCountryCreate, AdminDashboardResponse, AdminUserResponse, AdminCountryResponse
from app.services.admin_service import AdminService
from sqlalchemy.orm import Session
from fastapi import HTTPException

class AdminController:
    @staticmethod
    def get_dashboard(db: Session):
        data = AdminService.get_dashboard_metrics(db)
        return AdminDashboardResponse(**data)

    @staticmethod
    def get_users(db: Session):
        users_data = AdminService.get_all_users_stats(db)
        return [AdminUserResponse(**u) for u in users_data]

    @staticmethod
    def get_countries(db: Session):
        countries_data = AdminService.get_all_countries(db)
        return [AdminCountryResponse(**c) for c in countries_data]

    @staticmethod
    def create_country(db: Session, data: AdminCountryCreate):
        country_data = AdminService.create_country(db, data)
        if not country_data:
            raise HTTPException(status_code=400, detail="País já existe.")
        return AdminCountryResponse(**country_data)

    @staticmethod
    def update_country(db: Session, country_id: int, data: AdminCountryCreate):
        country_data = AdminService.update_country(db, country_id, data)
        if not country_data:
            raise HTTPException(status_code=404, detail="País não encontrado.")
        return AdminCountryResponse(**country_data)

    @staticmethod
    def delete_country(db: Session, country_id: int):
        success = AdminService.delete_country(db, country_id)
        if not success:
            raise HTTPException(status_code=404, detail="País não encontrado.")
        return {"status": "success", "message": "País removido"}