import io
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
import models.project as _models
import schemas.project as _schemas
import datetime as _dt
import json

MAX_FILE_SIZE = 10 * 1024 * 1024


async def create_project(db: Session, project: _schemas.ProjectCreate, file: UploadFile,
                         user_id: int) -> _models.Project:
    existing_project = db.query(_models.Project).filter(
        _models.Project.title == project.title,
        _models.Project.user_id == user_id
    ).first()

    if existing_project:
        raise HTTPException(
            status_code=400,
            detail={"message": "A project with this title already exists for the user."}
        )

    file_content, filename = await _process_file(file)

    new_project = _models.Project(
        title=project.title,
        description=project.description,
        filename=filename,
        file_content=file_content,
        user_id=user_id,
        date_created=_dt.datetime.utcnow(),
        date_updated=_dt.datetime.utcnow()
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


async def update_project(db: Session, project: _models.Project, project_dto: _schemas.ProjectCreate, file: UploadFile) \
        -> _models.Project:

    if file:
        file_content, filename = await _process_file(file)
        project.filename = filename
        project.file_content = file_content

    project.title = project_dto.description
    project.description = project_dto.description
    project.date_updated = _dt.datetime.utcnow()

    db.commit()
    db.refresh(project)

    return project


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


async def delete_project(db: Session, project: _models.Project) \
        -> _models.Project:

    db.delete(project)
    db.commit()

    return project

async def get_project_by_id(db: Session, project_id: int) -> _models.Project | None:
    return db.query(_models.Project).filter(_models.Project.id == project_id).first()