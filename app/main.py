from typing import TYPE_CHECKING, List
import fastapi as _fastapi
import sqlalchemy.orm as _orm
import schemas as _schemas
import services as _services
from config import SECRET_KEY, ALGORITHM
from fastapi.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt


if TYPE_CHECKING:
    from sqlalchemy.orm import Session

# Authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = _fastapi.FastAPI()


origins = [
    'http://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
async def startup():
    _services._add_tables()


@app.get("/")
def version():
    return "1.0.0"


@app.post("/api/user/", response_model=_schemas.User)
async def create_user(user: _schemas.CreateUser,
                         db: "Session" = _fastapi.Depends(_services.get_db)):
    return await _services.create_user(user=user, db=db)


@app.get("/api/user/{id}/", response_model=_schemas.User)
async def get_user(id: int, db: "Session" = _fastapi.Depends(_services.get_db)):
    user = await _services.get_user_by_id(id=id, db=db)
    if user is None:
        raise _fastapi.HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/register/", response_model=_schemas.User)
async def register_user(user: _schemas.CreateUser,
                         db: "Session" = _fastapi.Depends(_services.get_db)):
    existing_user = await _services.get_user(user=user, db=db)
    if existing_user:
        if existing_user.username:
            raise _fastapi.HTTPException(status_code=400, detail="Username already exists")
        elif existing_user.email:
            raise _fastapi.HTTPException(status_code=400, detail="Email already taken")

    return await _services.create_user(user=user, db=db)


@app.get("/api/verify-token/")
async def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token validation failed",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"username": username, "status": "Token is valid"}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.post("/api/token/")
async def login_for_access_token(db: "Session" = Depends(_services.get_db),
                                 form_data: OAuth2PasswordRequestForm = Depends()):
    user = await _services.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = _services.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


# @app.post("/api/upload/{user_id}/", response_model=_schemas.RawData)
# async def upload_file(
#         user_id: int, file: UploadFile = File(...), db: "Session" = _fastapi.Depends(_services.get_db)):
#     if file.content_type not in ["text/csv", "application/json"]:
#         raise HTTPException(status_code=400, detail="Invalid file type")
#
#     try:
#         file_content = await file.read()
#         raw_data = _services.save_file_data_to_db(
#             user_id=user_id, file_content=file_content, file_type=file.content_type, file_name=file.filename, db=db
#         )
#         return {"message": "File uploaded successfully", "raw_data": raw_data}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to ingest the file: {str(e)}")

