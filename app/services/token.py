from sqlalchemy.orm import Session
import utils.auth as _auth
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from crud import user as _crud_user

async def login_for_access_token(form_data: OAuth2PasswordRequestForm, db: Session):
    user = await _auth.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=HTTPException.status_code.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = _auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

def verify_token(token: str):
    return _auth.verify_access_token(token)
