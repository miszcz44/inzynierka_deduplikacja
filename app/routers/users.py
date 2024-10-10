from typing import TYPE_CHECKING
import fastapi as _fastapi
from crud import user as _crud
from schemas import user as _schemas
from common.dependencies import get_db

if TYPE_CHECKING:
    from sqlalchemy.orm import Session

router = _fastapi.APIRouter(
    prefix="/api/user",
    tags=["users"]
)


@router.get("/{id}", response_model=_schemas.User)
async def get_user(id: int, db: "Session" = _fastapi.Depends(get_db)):
    user = await _crud.get_user_by_id(id=id, db=db)
    if user is None:
        raise _fastapi.HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register", response_model=_schemas.User)
async def register_user(user: _schemas.CreateUser, db: "Session" = _fastapi.Depends(get_db)):
    try:
        _schemas.CreateUser(username=user.username, password=user.password)
    except ValueError as e:
        raise _fastapi.HTTPException(status_code=400, detail=str(e))

    if await _crud.user_exists(user.username, db):
        raise _fastapi.HTTPException(status_code=409, detail="Username already exists")

    return await _crud.create_user(user=user, db=db)
