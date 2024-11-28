from models.enums.step_name import StepName
from pydantic import BaseModel, Json


class WorkflowStep(BaseModel):
    step: StepName
    parameters: Json  # This stores any JSON data