import datetime as _dt
import pydantic as _pydantic
from pydantic import Field, validator
from typing import List
from schemas.workflow import WorkflowBase


class _BaseProject(_pydantic.BaseModel):
    title: str
    description: str | None = None

    @validator('title')
    def validate_title(cls, value):
        if not value or len(value) < 1:
            raise ValueError("Title cannot be empty.")
        return value


class ProjectCreate(_pydantic.BaseModel):
    title: str
    description: str | None = None

    @validator('title')
    def validate_title(cls, value):
        if not value or len(value) < 1:
            raise ValueError("Title cannot be empty.")
        return value


class Project(_BaseProject):
    id: int
    filename: str
    date_created: _dt.datetime
    date_updated: _dt.datetime
    workflows: List[WorkflowBase]

    class Config:
        from_attributes = True
