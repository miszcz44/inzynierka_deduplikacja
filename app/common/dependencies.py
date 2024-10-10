from config import database as _database
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from config.config import SECRET_KEY, ALGORITHM
import crud.user as _crud_user
import schemas.user as _schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _add_tables():
    _database.Base.metadata.create_all(bind=_database.engine)


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> _schemas.User:
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

    user = await _crud_user.get_user_by_username(db=db, username=username)
    if user is None:
        raise credentials_exception

    return user



