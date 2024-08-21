import datetime as _dt
import pydantic as _pydantic
from typing import Optional, List, Any


class RawDataBase(_pydantic.BaseModel):
    id: int
    # table_name: str # TODO: FOR BETTER VISIBILITY AND QUERYING
    user_id: int
    username: str
    email: str
    data: Any
    date_created: _dt.datetime

    class Config:
        from_attributes = True


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



