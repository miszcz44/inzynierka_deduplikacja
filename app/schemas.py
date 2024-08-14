import datetime as _dt
import pydantic as _pydantic
from typing import Optional, List, Any


# class _BaseRawData(_pydantic.BaseModel):
#     name: str
#     data: Optional[Any]
#
#
# class RawData(_BaseRawData):
#     id: int
#     user_id: int
#
#     class Config:
#         from_attributes = True


class _BaseUser(_pydantic.BaseModel):
    email: str


class User(_BaseUser):
    id: int
    username: str
    date_created: _dt.datetime
    # raw_data_tables: List[RawData] = []

    class Config:
        from_attributes = True


class CreateUser(_BaseUser):
    username: str
    password: str



