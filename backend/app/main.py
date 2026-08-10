from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import os

from app.routes.challenge_routes import router as challenge_router
from app.database.connection import engine
from app.models import models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GeoQuest API")

# Configure CORS
raw_origins = os.environ.get("FRONTEND_URL", "http://localhost:3000").split(",")
origins = [o.strip() for o in raw_origins if o.strip()]
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
def check_api():
    return {"status": "ok", "message": "GeoQuest API is running!"}

app.include_router(challenge_router, prefix="/api")