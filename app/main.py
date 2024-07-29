from typing import TYPE_CHECKING, List
import fastapi as _fastapi
import sqlalchemy.orm as _orm
import schemas as _schemas
import services as _services
from fastapi.middleware.cors import CORSMiddleware

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

app = _fastapi.FastAPI()

origins = [
    'http://localhost:3000'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
async def get_user(id: int,
                      db: "Session" = _fastapi.Depends(_services.get_db)):
    user = await _services.get_user(id=id, db=db)
    if user is None:
        raise _fastapi.HTTPException(status_code=404, detail="User not found")
    return user