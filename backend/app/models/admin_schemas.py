from typing import List, Optional
from pydantic import BaseModel

class ClueSchema(BaseModel):
    id: Optional[int] = None
    text: str
    order: int
    difficulty: str

class AdminCountryCreate(BaseModel):
    name: str
    code: str
    continent: str
    capital: str
    population: int
    area: float
    clues: List[ClueSchema]

class AdminCountryResponse(AdminCountryCreate):
    id: int

    class Config:
        from_attributes = True

class AdminUserResponse(BaseModel):
    id: int
    name: str
    email: str
    provider: str
    played: int
    win_rate: int
    current_streak: int
    max_streak: int
    avg_guesses: float

class AdminDashboardResponse(BaseModel):
    total_users: int
    total_countries: int
    total_matches: int
    matches_today: int
    global_win_rate: int
    global_avg_guesses: float