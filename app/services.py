from typing import TYPE_CHECKING, Optional
from fastapi import Depends, HTTPException, status, UploadFile
from fastapi.security import OAuth2PasswordBearer
import database as _database
import models as _models
import schemas as _schemas
from config import SECRET_KEY, ALGORITHM
import datetime as dt
import pandas as pd
import numpy as np
import io
import bcrypt
from jose import jwt, JWTError


if TYPE_CHECKING:
    from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def _add_tables():
    _database.Base.metadata.create_all(bind=_database.engine)


def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    hashed_password_str = hashed_password.decode('utf-8')
    return hashed_password_str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password=password_byte_enc, hashed_password=hashed_password_bytes)


async def create_user(user: _schemas.CreateUser, db: "Session") -> _schemas.User:
    hashed_password = hash_password(user.password)
    user = _models.User(username=user.username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return _schemas.User.from_orm(user)


async def user_exists(user: _schemas.CreateUser, db: "Session") -> bool:
    existing_user = db.query(_models.User).filter(
        _models.User.username == user.username
    ).first()
    print("eeeeeeeeeeeeeeeeeeeeeee")
    return existing_user is not None


async def get_user_by_id(id: int, db: "Session") -> Optional[_models.User]:
    user = db.query(_models.User).filter(_models.User.id == id).first()
    return user


async def authenticate_user(username: str, password: str, db: "Session") -> _schemas.User:
    user = db.query(_models.User).filter(_models.User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return _schemas.User.from_orm(user)


def create_access_token(data: dict, expires_delta: dt.timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = dt.datetime.utcnow() + expires_delta
    else:
        expire = dt.datetime.utcnow() + dt.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def save_file_data_to_db(user, file_content: bytes,
                               content_type: str, file_name: str,
                               db: "Session"):

    # file_content = await file.read()
    # table_name = file.filename
    # content_type = file.content_type

    if content_type == "text/csv":
        df = pd.read_csv(io.StringIO(file_content.decode('utf-8')))
    elif content_type == "application/json":
        df = pd.read_json(io.StringIO(file_content.decode('utf-8')))
    else:
        raise ValueError("File type not supported")


    # Replace NaN with None (null in JSON)
    df = df.replace({np.nan: None})

    raw_data_json = df.to_dict(orient="records")

    raw_data = _models.RawData(
        table_name=file_name,
        user_id=user.id,
        username=user.username,
        # email=user.email,
        data=raw_data_json
    )
    db.add(raw_data)
    db.commit()
    db.refresh(raw_data)
    return raw_data


async def get_current_user(token: str = Depends(oauth2_scheme), db: "Session" = Depends(get_db)) -> _schemas.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(_models.User).filter(_models.User.username == username).first()
    if user is None:
        raise credentials_exception

    return _schemas.User.from_orm(user)
