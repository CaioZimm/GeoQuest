from app.models.models import Country, Clue, User, DailyProgress
from app.models.admin_schemas import AdminCountryCreate
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo

class AdminService:
    @staticmethod
    def get_dashboard_metrics(db: Session):
        total_users = db.query(User).count()
        total_countries = db.query(Country).count()
        
        progress_records = db.query(DailyProgress).all()
        total_matches = len(progress_records)
        
        try:
            today = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
        except:
            today = datetime.now().date()
            
        matches_today = sum(1 for r in progress_records if r.date == today)
        
        wins = [r for r in progress_records if r.won]
        global_win_rate = int((len(wins) / total_matches) * 100) if total_matches > 0 else 0
        global_avg_guesses = round(sum(r.clues_used for r in wins) / len(wins), 1) if wins else 0.0
        
        return {
            "total_users": total_users,
            "total_countries": total_countries,
            "total_matches": total_matches,
            "matches_today": matches_today,
            "global_win_rate": global_win_rate,
            "global_avg_guesses": global_avg_guesses
        }

    @staticmethod
    def get_all_users_stats(db: Session):
        users = db.query(User).all()
        progress_records = db.query(DailyProgress).order_by(DailyProgress.date.asc()).all()
        
        user_progress = {u.id: [] for u in users}
        for p in progress_records:
            if p.user_id in user_progress:
                user_progress[p.user_id].append(p)
                
        stats_list = []
        
        for user in users:
            records = user_progress.get(user.id, [])
            played = len(records)
            wins = [r for r in records if r.won]
            win_rate = int((len(wins) / played) * 100) if played > 0 else 0
            avg_guesses = round(sum(r.clues_used for r in wins) / len(wins), 1) if wins else 0.0
            
            temp_streak = 0
            max_streak = 0
            prev_date = None
            
            for r in records:
                if r.won:
                    if prev_date is None or r.date == prev_date + timedelta(days=1):
                        temp_streak += 1
                    elif r.date > prev_date + timedelta(days=1):
                        temp_streak = 1
                    
                    if temp_streak > max_streak:
                        max_streak = temp_streak
                else:
                    temp_streak = 0
                prev_date = r.date
                
            stats_list.append({
                "id": user.id,
                "name": user.name or "Anônimo",
                "email": user.email,
                "provider": user.provider or "local",
                "played": played,
                "win_rate": win_rate,
                "current_streak": temp_streak,
                "max_streak": max_streak,
                "avg_guesses": avg_guesses
            })
        return sorted(stats_list, key=lambda x: x["played"], reverse=True)

    @staticmethod
    def get_all_countries(db: Session):
        countries = db.query(Country).all()
        result = []
        for c in countries:
            c_dict = c.__dict__.copy()
            c_dict["clues"] = sorted(c.clues, key=lambda x: x.order)
            result.append(c_dict)
        return result

    @staticmethod
    def create_country(db: Session, data: AdminCountryCreate):
        existing = db.query(Country).filter(Country.name == data.name).first()
        if existing:
            return None
            
        new_country = Country(
            name=data.name,
            code=data.code,
            continent=data.continent,
            capital=data.capital,
            population=data.population,
            area=data.area
        )
        db.add(new_country)
        db.commit()
        db.refresh(new_country)
        
        for clue in data.clues:
            new_clue = Clue(
                country_id=new_country.id,
                text=clue.text,
                order=clue.order,
                difficulty=clue.difficulty
            )
            db.add(new_clue)
        db.commit()
        db.refresh(new_country)
        
        c_dict = new_country.__dict__.copy()
        c_dict["clues"] = sorted(new_country.clues, key=lambda x: x.order)
        return c_dict

    @staticmethod
    def update_country(db: Session, country_id: int, data: AdminCountryCreate):
        country = db.query(Country).filter(Country.id == country_id).first()
        if not country:
            return None
            
        country.name = data.name
        country.code = data.code
        country.continent = data.continent
        country.capital = data.capital
        country.population = data.population
        country.area = data.area
        db.query(Clue).filter(Clue.country_id == country_id).delete()
        
        for clue in data.clues:
            new_clue = Clue(
                country_id=country.id,
                text=clue.text,
                order=clue.order,
                difficulty=clue.difficulty
            )
            db.add(new_clue)
            
        db.commit()
        db.refresh(country)
        
        c_dict = country.__dict__.copy()
        c_dict["clues"] = sorted(country.clues, key=lambda x: x.order)
        return c_dict

    @staticmethod
    def delete_country(db: Session, country_id: int):
        country = db.query(Country).filter(Country.id == country_id).first()
        if not country:
            return False
            
        db.delete(country)
        db.commit()
        return True