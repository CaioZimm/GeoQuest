from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    code = Column(String, unique=True, index=True)
    continent = Column(String)
    capital = Column(String)
    population = Column(Integer)
    area = Column(Integer)

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
