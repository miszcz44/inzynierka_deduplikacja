from fastapi import APIRouter, Depends, Form, UploadFile, File
from sqlalchemy.orm import Session
import schemas.user as _schemas_user
import schemas.statistics as _schemas_statistics
import schemas.workflow as _schemas
import crud.workflow as _crud
from common.dependencies import get_db, get_current_user
from typing import Dict, Any, List
from crud.workflow import get_workflow_by_id, get_statistics


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


@router.get("/{workflow_id}/file-content", response_model=Dict[str, Any])
async def get_workflow_file_content(
        workflow_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    unique_columns = await _crud.get_workflow_file_content(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id
    )

    return {
        "columns": unique_columns,
    }


@router.get("/{workflow_id}/content")
async def get_workflow_file_content(
        workflow_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    return await _crud.get_workflow_content(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id
    )


@router.get("/{workflow_id}/processed-data")
async def get_workflow_processed_data(
        workflow_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    return await _crud.get_workflow_processed_data(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id
    )


@router.get("/{workflow_id}/statistics")
async def get_workflow_statistics(workflow_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)):

    return await _crud.get_evaluation(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id,
        type='statistics'
    )


@router.get("/{workflow_id}/deduplicated-data")
async def get_workflow_deduplicated_data(workflow_id: int,
                                  db: Session = Depends(get_db),
                                  current_user: _schemas_user = Depends(get_current_user)):
    return await _crud.get_evaluation(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id,
        type='evaluated_data'
    )


@router.get("/{workflow_id}/matches")
async def get_workflow_matches(workflow_id: int,
                                  db: Session = Depends(get_db),
                                  current_user: _schemas_user = Depends(get_current_user)):
    return await _crud.get_evaluation(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id,
        type='matches'
    )


@router.get("/{workflow_id}/parameters")
async def get_workflow_matches(workflow_id: int,
                                  db: Session = Depends(get_db),
                                  current_user: _schemas_user = Depends(get_current_user)):
    return await _crud.get_parameters(
        workflow_id=workflow_id,
        db=db,
        user_id=current_user.id,
    )


@router.get("/{statistics_id}/get_statistics")
async def get_statistics(statistics_id: int,
                                  db: Session = Depends(get_db),
                                  current_user: _schemas_user = Depends(get_current_user)):
    return await _crud.get_statistics(
        statistics_id=statistics_id,
        db=db,
        user_id=current_user,
    )


@router.get("/{statistics_id}/get_parameters")
async def get_params(statistics_id: int,
                                  db: Session = Depends(get_db),
                                  current_user: _schemas_user = Depends(get_current_user)):
    statistics = await get_statistics(statistics_id, db, current_user.id)
    workflow = await get_workflow_by_id(db, statistics.workflow_id)
    return await _crud.get_parameters(
        workflow_id=workflow.id,
        db=db,
        user_id=current_user.id,
    )


@router.post("/{workflow_id}/save-statistics")
async def save_statistics(workflow_id: int,
                                  db: Session = Depends(get_db),
                                  title: str = Form(...),
                                  current_user: _schemas_user = Depends(get_current_user)):
    return await _crud.save_statistics(
        workflow_id=workflow_id,
        db=db,
        title=title,
        user_id=current_user.id,
    )


@router.get("/statistics-list")
async def get_statistics_list(db: Session = Depends(get_db), current_user: _schemas_user = Depends(get_current_user)):
    return await _crud.get_statistics_list(
        db=db,
        user_id=current_user.id,
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