from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float
from app.database.connection import Base
from sqlalchemy.orm import relationship

class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, unique=True, index=True)
    continent = Column(String)
    capital = Column(String)
    population = Column(Integer)
    area = Column(Float)

    clues = relationship("Clue", back_populates="country", cascade="all, delete-orphan")
    challenges = relationship("DailyChallenge", back_populates="country")

class Clue(Base):
    __tablename__ = "clues"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    text = Column(String, nullable=False)
    order = Column(Integer, nullable=False)
    difficulty = Column(String)

    country = relationship("Country", back_populates="clues")

class DailyChallenge(Base):
    __tablename__ = "daily_challenges"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    date = Column(Date, unique=True, index=True, nullable=False)

    country = relationship("Country", back_populates="challenges")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False) 
    password_hash = Column(String, nullable=True)
    provider = Column(String, nullable=False, default="local")
    
    progress = relationship("DailyProgress", back_populates="user")

class DailyProgress(Base):
    __tablename__ = "daily_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False, index=True)
    won = Column(Integer, nullable=False)
    clues_used = Column(Integer, nullable=False)

    user = relationship("User", back_populates="progress")

class InfiniteClueCache(Base):
    __tablename__ = "infinite_clue_cache"

    id = Column(Integer, primary_key=True, index=True)
    seed = Column(String, unique=True, index=True, nullable=False)
    country_name = Column(String, nullable=False)
    clues_json = Column(String, nullable=False)