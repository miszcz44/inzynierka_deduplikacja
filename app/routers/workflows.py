from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session
import schemas.user as _schemas_user
import schemas.workflow as _schemas
import crud.workflow as _crud
from common.dependencies import get_db, get_current_user

router = APIRouter(
    prefix="/api/workflows",
    tags=["workflows"]
)


@router.get("/{workflow_id}", response_model=_schemas.Workflow)
async def get_workflow(
        workflow_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    return await _crud.get_workflow(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id
    )


@router.post("/{project_id}", status_code=201)
async def create_workflow(
        project_id: int,
        title: str = Form(...),
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    return await _crud.create_workflow(
        project_id=project_id,
        db=db,
        title=title,
        user_id=current_user.id
    )


@router.put("/{workflow_id}", status_code=200)
async def update_workflow(
        workflow_id: int,
        title: str = Form(...),
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    return await _crud.update_workflow(
        workflow_id=workflow_id,
        db=db,
        title=title,
        user_id=current_user.id
    )


@router.delete("/{workflow_id}", status_code=200)
async def delete_workflow(
        workflow_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    return await _crud.delete_workflow(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id
    )


@router.put("/{workflow_id}/set-file", status_code=200)
async def set_file(
        workflow_id: int,
        db: Session = Depends(get_db),
        file: UploadFile = File(...),
        current_user: _schemas_user = Depends(get_current_user)
):
    return await _crud.set_file(
        workflow_id=workflow_id,
        db=db,
        file=file,
        user_id=current_user.id
    )