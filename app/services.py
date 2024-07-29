from typing import TYPE_CHECKING
import database as _database
import models as _models
import schemas as _schemas

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

async def create_user(user: _schemas.CreateUser,
                         db: "Session") -> _schemas.User:
    user = _models.User(**user.dict())
    db.add(user)
    db.commit()
    db.refresh(user)
    return _schemas.User.from_orm(user)

async def get_user(id: int, db: "Session"):
    user = db.query(_models.User).filter(_models.User.id == id).first()
    return user
