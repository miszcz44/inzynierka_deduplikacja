from typing import TYPE_CHECKING, Optional
import database as _database
import models as _models
import schemas as _schemas
from config import SECRET_KEY, ALGORITHM
import datetime as dt
import pandas as pd
import io
import bcrypt
from jose import jwt

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


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
    user = _models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return _schemas.User.from_orm(user)


async def get_user(user: _schemas.CreateUser, db: "Session"):
    existing_user = db.query(_models.User).filter(
        (_models.User.username == user.username) | (_models.User.email == user.email)
    ).first()
    return existing_user


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

# def load_file(file: bytes, file_type:str) -> pd.DataFrame:
#     if file_type == "text/csv":
#         try:
#             df = pd.read_csv(io.StringIO(file.decode('utf-8')))
#         except Exception as e:
#             raise ValueError(f"Failed to read the file: {e}")
#     elif file_type == "application/json":
#         try:
#             df = pd.read_json(io.StringIO(file.decode('utf-8')))
#         except Exception as e:
#             raise ValueError(f"Failed to read the file: {e}")
#     else:
#         raise ValueError("File type not supported")
#     return df
#
#
# def save_file_data_to_db(user_id: int, file_content: bytes, file_type: str, file_name: str, db: "Session") -> _models.RawData:
#     df = load_file(file_content, file_type)
#     raw_data_json = df.to_dict(orient="records")
#
#     raw_data = _models.RawData(name=file_name, data=raw_data_json, user_id=user_id)
#     db.add(raw_data)
#     db.commit()
#     db.refresh(raw_data)
#     return raw_data
