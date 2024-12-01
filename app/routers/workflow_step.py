from fastapi import APIRouter, Depends
import schemas.workflow_step as _schemas
import schemas.user as _schemas_user
from common.dependencies import get_db, get_current_user
from sqlalchemy.orm import Session
import crud.workflow_step as _crud


router = APIRouter(
    prefix="/api/workflow-step",
    tags=["workflow-steps"]
)


@router.put("/{workflow_id}", status_code=200)
async def save_workflow_step(
        workflow_id: int,
        workflow_step: _schemas.WorkflowStep,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user),
):
    await _crud.save_workflow_step(
        db,
        workflow_step=workflow_step,
        workflow_id=workflow_id
    )


@router.get("/{workflow_id}/last-step", status_code=200)
async def get_last_step(
        workflow_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user),
):
    return await _crud.get_last_step(
        db,
        workflow_id=workflow_id
    )
