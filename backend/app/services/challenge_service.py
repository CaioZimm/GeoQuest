from app.models.models import User, DailyProgress
from datetime import timedelta, datetime
from app.models import models, schemas
from sqlalchemy.orm import Session
from fastapi import HTTPException
from datetime import timedelta
from zoneinfo import ZoneInfo
from sqlalchemy import func
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
        import random
        r = random.Random(42)
        shuffled_countries = countries.copy()
        r.shuffle(shuffled_countries)
        
        epoch = datetime(2024, 1, 1).date()
        days_since_epoch = (today - epoch).days
        
        chosen_country = shuffled_countries[days_since_epoch % len(shuffled_countries)]
        
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
                clues_used=len(clues) if not won else request.current_clue_index
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

def get_user_stats(db: Session, user_id: str):
    if not user_id:
        return schemas.UserStatsResponse(played=0, win_rate=0, current_streak=0, max_streak=0, avg_guesses=0.0)
        
    from app.models.models import DailyProgress
    records = db.query(DailyProgress).filter(
        DailyProgress.user_id == int(user_id)
    ).order_by(DailyProgress.date.desc()).all()
    
    played = len(records)
    if played == 0:
        return schemas.UserStatsResponse(played=0, win_rate=0, current_streak=0, max_streak=0, avg_guesses=0.0)
        
    wins = [r for r in records if r.won]
    win_rate = int((len(wins) / played) * 100)
    
    avg_guesses = 0.0
    if wins:
        avg_guesses = round(sum(r.clues_used for r in wins) / len(wins), 1)
        
    try:
        today = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
    except:
        today = datetime.now().date()
        
    ordered_records = sorted(records, key=lambda x: x.date)
    temp_streak = 0
    max_streak = 0
    streak_7_count = 0
    prev_date = None
    
    for r in ordered_records:
        if r.won:
            if prev_date is None or r.date == prev_date + timedelta(days=1):
                temp_streak += 1
            elif r.date > prev_date + timedelta(days=1):
                temp_streak = 1
            
            if temp_streak % 7 == 0 and temp_streak > 0:
                streak_7_count += 1
                
            if temp_streak > max_streak:
                max_streak = temp_streak
        else:
            temp_streak = 0
        prev_date = r.date
        
    temp_streak = 0
    prev_date_desc = None
    
    if records:
        first_date = records[0].date
        if first_date == today or first_date == today - timedelta(days=1):
            for r in records:
                if r.won:
                    if prev_date_desc is None:
                        temp_streak += 1
                    elif r.date == prev_date_desc - timedelta(days=1):
                        temp_streak += 1
                    else:
                        break
                    prev_date_desc = r.date
                else:
                    break

    one_shot_count = sum(1 for r in wins if r.clues_used == 1)
    
    from app.models.models import DailyChallenge, Country
    won_dates = [r.date for r in wins]
    challenges = db.query(DailyChallenge).filter(DailyChallenge.date.in_(won_dates)).all()
    won_country_ids = [c.country_id for c in challenges]
    
    won_continents = db.query(Country.continent).filter(Country.id.in_(won_country_ids)).distinct().all()
    won_continents_set = {c[0] for c in won_continents if c[0]}
    
    all_continents = db.query(Country.continent).distinct().all()
    all_continents_set = {c[0] for c in all_continents if c[0]}
    total_conts = len(all_continents_set) if all_continents_set else 6
    
    def get_tier(count: int, thresholds: list) -> tuple[str, int]:
        tiers = ['none', 'bronze', 'silver', 'gold', 'platinum', 'emerald']
        current_tier_idx = 0
        next_goal = thresholds[0]
        for i, t in enumerate(thresholds):
            if count >= t:
                current_tier_idx = i + 1
                if i + 1 < len(thresholds):
                    next_goal = thresholds[i+1]
                else:
                    next_goal = t
        return tiers[current_tier_idx], next_goal

    # Tiro Certeiro (1, 5, 10, 20, 50)
    tc_tier, tc_next = get_tier(one_shot_count, [1, 5, 10, 20, 50])
    tc_desc = "Você é uma lenda dos Tiros Certeiros!" if tc_tier == 'emerald' else f"Acertou de primeira. Faltam {tc_next - one_shot_count} para o nível {['Prata', 'Ouro', 'Platina', 'Esmeralda', 'Máximo'][['bronze', 'silver', 'gold', 'platinum', 'emerald'].index(tc_tier) if tc_tier != 'none' else 0]}!"

    # Imparável (7, 14, 30, 60, 90 days)
    imp_tier, imp_next = get_tier(max_streak, [7, 14, 30, 60, 90])
    imp_desc = "Uma divindade imparável!" if imp_tier == 'emerald' else f"Dias seguidos jogando. Faltam {imp_next - max_streak} dias para o próximo nível!"

    # Mochileiro (2, 3, 4, 5, total)
    distinct_conts = len(won_continents_set)
    moch_tier, moch_next = get_tier(distinct_conts, [2, 3, 4, 5, total_conts])
    moch_desc = "Explorou todos os continentes do mundo!" if moch_tier == 'emerald' else f"Acertou países em {distinct_conts} continentes. Faltam {moch_next - distinct_conts} continentes para evoluir o nível!"
    
    achievements = [
        schemas.Achievement(
            id="one_shot",
            name="Tiro Certeiro",
            description=tc_desc,
            icon="🎯",
            count=one_shot_count,
            achieved=one_shot_count > 0,
            tier=tc_tier,
            next_goal=tc_next
        ),
        schemas.Achievement(
            id="streak_7",
            name="Imparável",
            description=imp_desc,
            icon="🔥",
            count=max_streak,
            achieved=max_streak >= 7,
            tier=imp_tier,
            next_goal=imp_next
        ),
        schemas.Achievement(
            id="backpacker",
            name="Mochileiro",
            description=moch_desc,
            icon="🎒",
            count=distinct_conts,
            achieved=distinct_conts >= 2,
            tier=moch_tier,
            next_goal=moch_next
        )
    ]
                    
    return schemas.UserStatsResponse(
        played=played,
        win_rate=win_rate,
        current_streak=temp_streak,
        max_streak=max_streak,
        avg_guesses=avg_guesses,
        achievements=achievements
    )

def get_leaderboard(db: Session, user_id: str = None):
    users = db.query(User).all()
    progress_records = db.query(DailyProgress).order_by(DailyProgress.date.asc()).all()
    
    user_progress = {u.id: [] for u in users}
    for p in progress_records:
        if p.user_id in user_progress:
            user_progress[p.user_id].append(p)
            
    stats_list = []
    
    for user in users:
        records = user_progress.get(user.id, [])
        
        total_score = 0
        total_wins = 0
        
        temp_streak = 0
        max_streak = 0
        prev_date = None
        
        for r in records:
            if r.won:
                total_wins += 1
                total_score += max(0, 1000 - (r.clues_used - 1) * 166)
                
                if prev_date is None:
                    temp_streak = 1
                elif r.date == prev_date + timedelta(days=1):
                    temp_streak += 1
                elif r.date > prev_date + timedelta(days=1):
                    temp_streak = 1
                    
                if temp_streak > max_streak:
                    max_streak = temp_streak
                    
                prev_date = r.date
            else:
                temp_streak = 0
                prev_date = r.date
                
        if total_wins > 0:
            name = user.name or "Anônimo"
            stats_list.append({
                "user_id": user.id,
                "user_name": name,
                "total_score": total_score,
                "total_wins": total_wins,
                "max_streak": max_streak
            })
            
    by_score = sorted(stats_list, key=lambda x: x["total_score"], reverse=True)
    by_streak = sorted(stats_list, key=lambda x: x["max_streak"], reverse=True)
    
    user_score_entry = None
    user_streak_entry = None
    
    if user_id:
        # Find user in score list
        for idx, item in enumerate(by_score):
            if item["user_id"] == user_id:
                user_score_entry = schemas.LeaderboardEntry(
                    rank=idx + 1,
                    user_name=item["user_name"],
                    total_score=item["total_score"],
                    total_wins=item["total_wins"],
                    max_streak=item["max_streak"]
                )
                break
                
        # Find user in streak list
        for idx, item in enumerate(by_streak):
            if item["user_id"] == user_id:
                user_streak_entry = schemas.LeaderboardEntry(
                    rank=idx + 1,
                    user_name=item["user_name"],
                    total_score=item["total_score"],
                    total_wins=item["total_wins"],
                    max_streak=item["max_streak"]
                )
                break
    
    def to_entries(lst):
        entries = []
        for idx, item in enumerate(lst):
            entries.append(schemas.LeaderboardEntry(
                rank=idx + 1,
                user_name=item["user_name"],
                total_score=item["total_score"],
                total_wins=item["total_wins"],
                max_streak=item["max_streak"]
            ))
        return entries
        
    return schemas.LeaderboardResponse(
        by_score=to_entries(by_score[:20]),
        by_streak=to_entries(by_streak[:20]),
        user_score_entry=user_score_entry,
        user_streak_entry=user_streak_entry
    )