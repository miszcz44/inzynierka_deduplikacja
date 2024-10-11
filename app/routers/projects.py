from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
import crud.project as _crud
import schemas.project as _schemas_project
import schemas.user as _schemas_user
from common.dependencies import get_db, get_current_user


router = APIRouter(
    prefix="/api/projects",
    tags=["projects"]
)


@router.post("/", status_code=201)
async def create_project(
        title: str = Form(...),
        description: str = Form(None),
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    project_data = _schemas_project.ProjectCreate(
        title=title,
        description=description,
    )

    return await _crud.create_project(
        db=db,
        project=project_data,
        user_id=current_user.id
    )


@router.get("/{project_id}", response_model=_schemas_project.Project)
async def get_project(
        project_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user.User = Depends(get_current_user)
):
    project = await _crud.get_project_by_id(db=db, project_id=project_id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this project")

    return project


@router.put("/{project_id}", status_code=200)
async def update_project(
        project_id: int,
        title: str = Form(...),
        description: str = Form(None),
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    project_data = _schemas_project.ProjectCreate(
        title=title,
        description=description,
    )

    project = await _crud.get_project_by_id(db=db, project_id=project_id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this project")

    return await _crud.update_project(
        db=db,
        project=project,
        project_dto=project_data,
    )


@router.delete("/{project_id}", status_code=200)
async def delete_project(
        project_id: int,
        db: Session = Depends(get_db),
        current_user: _schemas_user = Depends(get_current_user)
):
    project = await _crud.get_project_by_id(db=db, project_id=project_id)

    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.user_id != current_user.id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this project")

    await _crud.delete_project(
        db=db,
        project=project,
    )