from app.database.all_un_countries import un_countries_data
from app.database.connection import SessionLocal
from sqlalchemy.orm import Session
from app.models import models
import os

def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

def seed_database():
    db = get_db()
    
    print("Iniciando inserção/atualização dos países membros da ONU e suas pistas...")
    
    inserted_count = 0
    for c_data in un_countries_data:
        clues_data = c_data.pop("clues") if "clues" in c_data else []
        
        existing_country = db.query(models.Country).filter(models.Country.name == c_data["name"]).first()
        if not existing_country:
            country = models.Country(**c_data)
            db.add(country)
            db.flush()
            
            for index, text in enumerate(clues_data):
                diff = "Hard" if index < 2 else ("Medium" if index < 4 else "Easy")
                clue = models.Clue(
                    country_id=country.id,
                    text=text,
                    order=index + 1,
                    difficulty=diff
                )
                db.add(clue)
            inserted_count += 1
            
    db.commit()
    print(f"Seed concluído! {inserted_count} novos países cadastrados no banco de dados.")

if __name__ == "__main__":
    seed_database()