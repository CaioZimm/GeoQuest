from fastapi import Depends, HTTPException, Header
import jwt
import os

SECRET_KEY = os.environ.get("NEXTAUTH_SECRET", "super-secret-key-123")
ALGORITHM = "HS256"

def get_current_user_id(authorization: str = Header(None)):
    if not authorization:
        return None
    
    try:
        token = authorization.split(" ")[1]
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        return user_id
    except Exception as e:
        print("JWT Decode error:", e)
        return None