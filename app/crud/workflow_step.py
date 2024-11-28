from sqlalchemy.orm import Session
import models.workflow_step as _models
from models.enums.step_name import StepName
import schemas.workflow_step as _schemas


async def save_workflow_step(db: Session, workflow_step: _schemas.WorkflowStep, workflow_id: int):
    step = _models.WorkflowStep(
        name=StepName.DATA_READING,
        workflow_id=workflow_id
    )

    existing_step = db.query(_models.WorkflowStep).filter(
        _models.WorkflowStep.name == StepName.DATA_READING,
        _models.WorkflowStep.workflow_id == workflow_id
    ).first()

    if existing_step is None:
        db.add(step)
        db.commit()
        db.refresh(step)
