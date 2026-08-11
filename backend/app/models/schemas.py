from pydantic import BaseModel
from typing import Optional

class CountryBase(BaseModel):
    name: str
    code: str
    continent: str
    capital: str
    population: int
    area: int

    class Config:
        orm_mode = True
        from_attributes = True

class DailyChallengeResponse(BaseModel):
    date: str
    total_clues: int
    first_clue: str

class GuessRequest(BaseModel):
    guess: str
    current_clue_index: int
    seed: Optional[str] = None

class GuessResponse(BaseModel):
    correct: bool
    message: str
    next_clue: Optional[str] = None
    country: Optional[CountryBase] = None
    all_clues: Optional[list[str]] = None

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    email: str
    name: str = None