from models.enums.step_name import StepName
from pydantic import BaseModel, Json


class Statistics(BaseModel):
    title: str


class StatisticsList(BaseModel):
    title: str
    project_name: str
    workflow_name: str
    filename: str
    statistics: Json

    class Config:
        orm_mode = True