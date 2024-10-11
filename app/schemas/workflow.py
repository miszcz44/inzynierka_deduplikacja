from typing import Optional
from pydantic import BaseModel
import datetime as _dt


class WorkflowBase(BaseModel):
    id: int
    title: str
    date_created: _dt.datetime
    date_updated: _dt.datetime

    class Config:
        from_attributes = True


class Workflow(WorkflowBase):
    filename: Optional[str]
