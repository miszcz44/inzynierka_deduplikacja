from sqlalchemy.orm import Session
import models.workflow_step as _models
from models.enums.step_name import StepName
import schemas.workflow_step as _schemas
from crud.workflow import get_workflow_by_id
from crud.project import get_project_by_id
from crud.step_executor import execute


async def save_workflow_step(db: Session, workflow_step: _schemas.WorkflowStep, workflow_id: int):
    step = _models.WorkflowStep(
        name=workflow_step.step,
        parameters=workflow_step.parameters,
        workflow_id=workflow_id
    )

    workflow = await get_workflow_by_id(db, workflow_id)
    project = await get_project_by_id(db, workflow.project_id)

    existing_step = db.query(_models.WorkflowStep).filter(
        _models.WorkflowStep.name == workflow_step.step,
        _models.WorkflowStep.workflow_id == workflow_id
    ).first()

    if existing_step is None:
        db.add(step)
    else:
        existing_step.parameters = workflow_step.parameters
        db.add(existing_step)


    data_to_process = project.file_content
    if workflow.processed_data:
        data_to_process = workflow.processed_data
    processed_data = await execute(data_to_process, workflow_step.step,
                             existing_step.parameters if existing_step else step.parameters,
                                   workflow.blocked_data)
    workflow.processed_data = processed_data
    if workflow_step.step == StepName.BLOCK_BUILDING:
        workflow.blocked_data = processed_data
    workflow.last_step = workflow_step.step
    db.commit()
    db.refresh(existing_step if existing_step else step)
    db.refresh(workflow)


async def get_last_step(db: Session, workflow_id: int):
    workflow = await get_workflow_by_id(db, workflow_id)
    return workflow.last_step


async def get_step(db: Session, workflow_id: int, step_name: str):
    workflow = await get_workflow_by_id(db, workflow_id)
    return db.query(_models.WorkflowStep).filter(
        _models.WorkflowStep.name == step_name,
        _models.WorkflowStep.workflow_id == workflow_id
    ).first()