from sqlalchemy.orm import Session
import models.workflow_step as _models
from models.enums.step_name import StepName
import schemas.workflow_step as _schemas


async def save_workflow_step(db: Session, workflow_step: _schemas.WorkflowStep, workflow_id: int):
    step = _models.WorkflowStep(
        name=workflow_step.step,
        parameters=workflow_step.parameters,
        workflow_id=workflow_id
    )

    # Check if the step already exists
    existing_step = db.query(_models.WorkflowStep).filter(
        _models.WorkflowStep.name == workflow_step.step,  # Compare by step name
        _models.WorkflowStep.workflow_id == workflow_id   # Compare by workflow ID
    ).first()

    if existing_step is None:
        # Add new step if it doesn't exist
        db.add(step)
    else:
        # Update existing step if it exists
        existing_step.parameters = workflow_step.parameters
        db.add(existing_step)

    # Commit the changes and refresh
    db.commit()
    db.refresh(existing_step if existing_step else step)
