from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from app.routes.challenge_routes import router as challenge_router
from app.database.connection import engine
from app.models import models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GeoQuest API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
def check_api():
    return {"status": "ok", "message": "GeoQuest API is running!"}

app.include_router(challenge_router, prefix="/api")