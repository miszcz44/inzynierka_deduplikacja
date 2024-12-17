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
    data_to_process = project.file_content
    if workflow_step.step == StepName.BLOCK_BUILDING:
        data_to_process = workflow.preprocessing_data
    if workflow_step.step == StepName.FIELD_AND_RECORD_COMPARISON:
        data_to_process = workflow.block_building_data
    if workflow_step.step == StepName.CLASSIFICATION:
        data_to_process = workflow.comparison_data
    processed_data = await execute(data_to_process, workflow_step.step,
                             existing_step.parameters if existing_step else step.parameters,
                                   workflow.block_building_data)
    if workflow_step.step == StepName.DATA_PREPROCESSING:
        workflow.preprocessing_data = processed_data
    if workflow_step.step == StepName.BLOCK_BUILDING:
        workflow.block_building_data = processed_data
    if workflow_step.step == StepName.FIELD_AND_RECORD_COMPARISON:
        workflow.comparison_data = processed_data
    if workflow_step.step == StepName.CLASSIFICATION:
        workflow.classification_data = processed_data
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
        _models.WorkflowStep.name == step_name,  # Compare by step name
        _models.WorkflowStep.workflow_id == workflow_id   # Compare by workflow ID
    ).first()