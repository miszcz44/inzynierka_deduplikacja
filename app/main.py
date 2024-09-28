from typing import TYPE_CHECKING, List
import fastapi as _fastapi
import sqlalchemy.orm as _orm
import schemas as _schemas
import services as _services
import models as _models
from config import SECRET_KEY, ALGORITHM
from fastapi.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt


if TYPE_CHECKING:
    from sqlalchemy.orm import Session

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

@app.get("/api/user/{id}", response_model=_schemas.User)
async def get_user(id: int, db: "Session" = _fastapi.Depends(_services.get_db)):
    user = await _services.get_user_by_id(id=id, db=db)
    if user is None:
        raise _fastapi.HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/register", response_model=_schemas.User)
async def register_user(user: _schemas.CreateUser, db: "Session" = _fastapi.Depends(_services.get_db)):
    try:
        user_data = _schemas.CreateUser(username=user.username, password=user.password)
    except ValueError as e:
        raise _fastapi.HTTPException(status_code=400, detail=str(e))

    if await _services.user_exists(user, db):
        raise _fastapi.HTTPException(status_code=409, detail="Username already exists")

    return await _services.create_user(user=user, db=db)


@app.get("/api/verify-token")
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


@app.post("/api/token")
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


@app.post("/api/upload", response_model=_schemas.RawDataBase)
async def upload_file(
        file: UploadFile = File(...),
        db: "Session" = _fastapi.Depends(_services.get_db),
        current_user: _schemas.User = _fastapi.Depends(_services.get_current_user)):
    if file.content_type not in ["text/csv", "application/json"]:
        raise HTTPException(status_code=400, detail="Invalid file type")

    file_content = await file.read()
    file_type = file.content_type
    file_name = file.filename
    raw_data = _services.save_file_data_to_db(current_user,
                                              file_content, file_type, file_name,
                                              db)

    return raw_data


@app.get("/api/raw-data/{data_id}", response_model=_schemas.RawDataBase)
async def get_raw_data_by_id(data_id: int, db: "Session" = Depends(_services.get_db),
                             current_user: _schemas.User = Depends(_services.get_current_user)):
    raw_data = db.query(_models.RawData).filter_by(id=data_id, user_id=current_user.id).first()
    if not raw_data:
        raise HTTPException(status_code=404, detail="Data not found")
    return raw_data


@app.get("/api/user/tables", response_model=List[_schemas.RawDataBase])
async def get_user_tables(db: "Session" = Depends(_services.get_db),
                          current_user: _schemas.User = Depends(_services.get_current_user)):
    tables = db.query(_models.RawData).filter_by(user_id=current_user.id).all()
    return tables


@app.get("/api/user/table/{table_id}", response_model=_schemas.RawDataBase)
async def get_table_by_id(table_id: int, db: "Session" = Depends(_services.get_db),
                          current_user: _schemas.User = Depends(_services.get_current_user)):
    table = db.query(_models.RawData).filter_by(id=table_id, user_id=current_user.id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table


@app.get("/api/block_building/{table_id}", response_model=_schemas.BlockBuildingInfo)
async def block_building_info(table_id: int,
                              db: "Session" = Depends(_services.get_db),
                              current_user: _schemas.User = Depends(_services.get_current_user)):

    table = db.query(_models.RawData).filter_by(id=table_id, user_id=current_user.id).first()

    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    block_building_info = {
        "table_name": table.table_name,
        "table_id": table.id,
        "user_id": current_user.id,
        "username": current_user.username,
        "methods_available": ["Rolling Window", "Suffix Table"],
        "date_created": table.date_created
    }

    return block_building_info




