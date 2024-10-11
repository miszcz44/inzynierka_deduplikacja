from typing import Optional
from sqlalchemy.orm import Session
from models import user as _models
from schemas import user as _schemas
from utils.hashing import hash_password

async def create_user(user: _schemas.CreateUser, db: Session) -> _schemas.User:
    hashed_password = hash_password(user.password)
    new_user = _models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return _schemas.User.from_orm(new_user)


async def user_exists(username: str, db: Session) -> bool:
    return db.query(_models.User).filter(_models.User.username == username).first() is not None


async def get_user_by_id(id: int, db: Session) -> Optional[_models.User]:
    return db.query(_models.User).filter(_models.User.id == id).first()


async def get_user_by_username(username: str, db: Session) -> Optional[_models.User]:
    return db.query(_models.User).filter(_models.User.username == username).first()
