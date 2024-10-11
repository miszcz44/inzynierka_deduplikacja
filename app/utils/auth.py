from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, status
from config.config import SECRET_KEY, ALGORITHM
from schemas import user as _schemas
from crud import user as _crud_user
import datetime as dt
from sqlalchemy.orm import Session
import utils.hashing as _hashing


async def authenticate_user(username: str, password: str, db: Session) -> Optional[_schemas.User]:
    user = await _crud_user.get_user_by_username(username, db)
    if not user or not _hashing.verify_password(password, user.hashed_password):
        return None
    return _schemas.User.from_orm(user)


def create_access_token(data: dict, expires_delta: dt.timedelta | None = None):
    to_encode = data.copy()
    expire = dt.datetime.utcnow() + (expires_delta if expires_delta else dt.timedelta(minutes=300))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
