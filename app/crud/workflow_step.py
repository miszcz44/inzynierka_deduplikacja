from sqlalchemy.orm import Session
import models.workflow_step as _models
from models.enums.step_name import StepName


async def data_reading_step(workflow_id: int, db: Session):
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
