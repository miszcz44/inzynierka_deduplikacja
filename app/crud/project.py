from fastapi import HTTPException
from sqlalchemy.orm import Session
import models.project as _models
import schemas.project as _schemas
import datetime as _dt


async def create_project(db: Session, project: _schemas.ProjectCreate, user_id: int) -> _models.Project:
    existing_project = db.query(_models.Project).filter(
        _models.Project.title == project.title,
        _models.Project.user_id == user_id
    ).first()

    if existing_project:
        raise HTTPException(
            status_code=400,
            detail={"message": "A project with this title already exists for the user."}
        )

    new_project = _models.Project(
        title=project.title,
        description=project.description,
        user_id=user_id,
        date_created=_dt.datetime.utcnow(),
        date_updated=_dt.datetime.utcnow()
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


async def update_project(db: Session, project: _models.Project, project_dto: _schemas.ProjectCreate) -> _models.Project:
    project.title = project_dto.title
    project.description = project_dto.description
    project.date_updated = _dt.datetime.utcnow()

    db.commit()
    db.refresh(project)

    return project


async def delete_project(db: Session, project: _models.Project) \
        -> _models.Project:

    db.delete(project)
    db.commit()


async def get_project_by_id(db: Session, project_id: int) -> _models.Project | None:
    return db.query(_models.Project).filter(_models.Project.id == project_id).first()