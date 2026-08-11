from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import socket
import os

from app.routes.challenge_routes import router as challenge_router
from app.database.connection import engine
from app.models import models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GeoQuest API")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

# Configure CORS
raw_origins = os.environ.get("FRONTEND_URL", "http://localhost:3000").split(",")
origins = [o.strip() for o in raw_origins if o.strip()]
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

local_ip = get_local_ip()
network_origin = f"http://{local_ip}:3000"
if network_origin not in origins:
    origins.append(network_origin)

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

from app.routes.auth_routes import router as auth_router

app.include_router(challenge_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")