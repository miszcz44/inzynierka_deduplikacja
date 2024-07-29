import datetime as _dt
import pydantic as _pydantic

class _BaseUser(_pydantic.BaseModel):
    email: str


class User(_BaseUser):
    id: int
    date_created: _dt.datetime

    class Config:
        from_attributes = True


class CreateUser(_BaseUser):
    pass
