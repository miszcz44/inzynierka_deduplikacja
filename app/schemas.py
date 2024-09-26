import re
import datetime as _dt
import pydantic as _pydantic
from pydantic import validator
from typing import Optional, List, Any

USERNAME_REGEX = r"^[a-zA-Z][a-zA-Z0-9_-]{3,23}$"
PASSWORD_REGEX = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%!])[A-Za-z\d@#$%!]{8,24}$"

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
    username: str


class User(_BaseUser):
    id: int
    date_created: _dt.datetime
    # raw_data_tables: List[RawData] = []

    class Config:
        from_attributes = True


class CreateUser(_BaseUser):
    username: str
    password: str

    @validator('username')
    def validate_username(cls, value):
        if not re.match(USERNAME_REGEX, value):
            raise ValueError(
                "Username must be 4 to 24 characters long, begin with a letter,"
                " and can contain letters, numbers, underscores, and hyphens.")
        return value

    @validator('password')
    def validate_password(cls, value):
        if not re.match(PASSWORD_REGEX, value):
            raise ValueError(
                "Password must be 8 to 24 characters long,"
                " and include uppercase and lowercase letters, a number, and a special character (!@#$%).")
        return value