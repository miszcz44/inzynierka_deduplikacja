from sqlalchemy.orm import Session
from crud.project import get_project_by_id
from fastapi import HTTPException, UploadFile
import models.workflow as _models
import schemas.workflow as _schemas
import datetime as _dt
import json

MAX_FILE_SIZE = 10 * 1024 * 1024


async def get_workflow(workflow_id: int, db: Session, user_id: int) -> _schemas.Workflow:
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    return workflow


async def create_workflow(project_id: int, db: Session, title: str, user_id: int) -> _models.Workflow:
    project = await get_project_by_id(db=db, project_id=project_id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    existing_workflow = db.query(_models.Workflow).filter(
        _models.Workflow.title == title,
        _models.Workflow.project_id == project_id
    ).first()

    if existing_workflow:
        raise HTTPException(
            status_code=400,
            detail={"message": "A project with this title already exists for the project."}
        )

    new_workflow = _models.Workflow(
        title=title,
        project_id=project_id,
        date_created=_dt.datetime.utcnow(),
        date_updated=_dt.datetime.utcnow()
    )

    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)

    return new_workflow


async def update_workflow(workflow_id: int, db: Session, title: str, user_id: int) -> _models.Workflow:
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    existing_workflow = db.query(_models.Workflow).filter(
        _models.Workflow.title == title,
        _models.Workflow.project_id == project.id
    ).first()

    if existing_workflow:
        raise HTTPException(
            status_code=400,
            detail={"message": "A project with this title already exists for the project."}
        )

    workflow.title = title

    db.commit()
    db.refresh(workflow)

    return workflow


async def delete_workflow(workflow_id: int, db: Session, user_id: int) -> _models.Workflow:
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    db.delete(workflow)
    db.commit()

    return workflow


async def set_file(workflow_id: int, db: Session, file: UploadFile,  user_id: int):
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    file_content, filename = await _process_file(file)

    workflow.filename = filename
    workflow.file_content = file_content

    db.commit()
    db.refresh(workflow)


async def _process_file(file: UploadFile) -> tuple:
    if not file:
        raise HTTPException(status_code=400, detail={"message": "No file was uploaded."})

    if file.content_type not in ['text/csv', 'application/json']:
        raise HTTPException(
            status_code=400,
            detail={"message": "Invalid file type. Only CSV and JSON files are allowed."}
        )

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail={"message": f"Error reading file: {str(e)}"})

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail={"message": "File size exceeds the 10MB limit."}
        )

    file_content = None
    if file.content_type == 'application/json':
        try:
            file_content = json.loads(content.decode('utf-8'))
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail={"message": "Invalid JSON file."})
    elif file.content_type == 'text/csv':
        file_content = content.decode('utf-8')

    return file_content, file.filename


async def get_workflow_by_id(db: Session, workflow_id: int) -> _models.Workflow | None:
    return db.query(_models.Workflow).filter(_models.Workflow.id == workflow_id).first()