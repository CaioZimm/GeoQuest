from app.models import models, schemas
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import datetime
from zoneinfo import ZoneInfo
import unicodedata
import hashlib

def get_today_date():
    try:
        return datetime.now(ZoneInfo("America/Sao_Paulo")).date()
    except Exception:
        return datetime.now().date()

def get_challenge_country(db: Session, seed: str = None):
    countries = db.query(models.Country).order_by(models.Country.id).all()
    if not countries:
        raise HTTPException(status_code=500, detail="Nenhum país cadastrado no banco.")
        
    if seed:
        h = int(hashlib.md5(seed.encode()).hexdigest(), 16)
        return countries[h % len(countries)]

    today = get_today_date()
    challenge = db.query(models.DailyChallenge).filter(models.DailyChallenge.date == today).first()
    
    if not challenge:
        day_of_year = today.timetuple().tm_yday
        chosen_country = countries[day_of_year % len(countries)]
        
        challenge = models.DailyChallenge(country_id=chosen_country.id, date=today)
        db.add(challenge)
        db.commit()
        db.refresh(challenge)

    return db.query(models.Country).filter(models.Country.id == challenge.country_id).first()

def get_daily_challenge_data(db: Session, seed: str = None):
    country = get_challenge_country(db, seed)
    
    clues = db.query(models.Clue).filter(models.Clue.country_id == country.id).order_by(models.Clue.order).all()
    
    if not clues:
        raise HTTPException(status_code=500, detail="País do desafio não possui pistas cadastradas.")
        
    return schemas.DailyChallengeResponse(
        date=str(get_today_date()) if not seed else "Modo Infinito",
        total_clues=len(clues),
        first_clue=clues[0].text
    )

def list_all_countries(db: Session):
    countries = db.query(models.Country.name).order_by(models.Country.name).all()
    return [c[0] for c in countries]

def process_guess(db: Session, request: schemas.GuessRequest, user_id: str = None):
    country = get_challenge_country(db, request.seed)
    
    if not country:
        raise HTTPException(status_code=500, detail="País do desafio não encontrado.")
        
    def normalize_str(s: str) -> str:
        return ''.join(c for c in unicodedata.normalize('NFD', s)
                  if unicodedata.category(c) != 'Mn').lower().strip()

    is_correct = normalize_str(request.guess) == normalize_str(country.name)
    
    clues = db.query(models.Clue).filter(models.Clue.country_id == country.id).order_by(models.Clue.order).all()
    all_clues_list = [c.text for c in clues]

    # Record progress helper
    def record_progress(won: bool):
        if not user_id or request.seed:
            return
        from app.models.models import DailyProgress
        try:
            today = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
        except:
            today = datetime.now().date()
            
        progress = db.query(DailyProgress).filter(
            DailyProgress.user_id == int(user_id),
            DailyProgress.date == today
        ).first()
        
        if not progress:
            progress = DailyProgress(
                user_id=int(user_id),
                date=today,
                won=1 if won else 0,
                clues_used=len(clues) if not won else request.current_clue_index + 1
            )
            db.add(progress)
            db.commit()

    if is_correct:
        record_progress(True)
        return schemas.GuessResponse(
            correct=True,
            message="Você acertou!",
            country=schemas.CountryBase.from_orm(country),
            all_clues=all_clues_list
        )
    else:
        next_index = request.current_clue_index
        
        if next_index < len(clues):
            next_clue = clues[next_index].text
            return schemas.GuessResponse(
                correct=False,
                message=f"Não é {request.guess}.",
                next_clue=next_clue
            )
        else:
            record_progress(False)
            return schemas.GuessResponse(
                correct=False,
                message=f"Fim de jogo. O país era {country.name}.",
                country=schemas.CountryBase.from_orm(country),
                all_clues=all_clues_list
            )

def get_progress(db: Session, user_id: str):
    if not user_id:
        return {"played_today": False}
        
    try:
        today = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
    except:
        today = datetime.now().date()
        
    from app.models.models import DailyProgress
    progress = db.query(DailyProgress).filter(
        DailyProgress.user_id == int(user_id),
        DailyProgress.date == today
    ).first()
    
    if progress:
        country = get_challenge_country(db)
        from app.models.models import Clue
        clues = db.query(Clue).filter(Clue.country_id == country.id).order_by(Clue.order).all()
        clues_list = [c.text for c in clues]
        return {
            "played_today": True,
            "won": bool(progress.won),
            "clues_used": progress.clues_used,
            "country": schemas.CountryBase.from_orm(country),
            "all_clues": clues_list
        }
    return {"played_today": False}