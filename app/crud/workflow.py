from sqlalchemy.orm import Session
from crud.project import get_project_by_id
from fastapi import HTTPException, UploadFile
import models.workflow as _models
import schemas.workflow as _schemas
from models.enums.step_name import StepName
from pipeline.Evaluation import Evaluation
import datetime as _dt
from typing import List
import pandas as pd
import json
import csv
import random

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


async def delete_workflow(workflow_id: int, db: Session, user_id: int):
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    db.delete(workflow)
    db.commit()


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
        try:
            # Convert CSV to JSON
            csv_content = content.decode('utf-8')
            csv_reader = csv.DictReader(csv_content.splitlines())

            # Convert each row to a JSON object
            file_content = [row for row in csv_reader]
        except Exception as e:
            raise HTTPException(status_code=400, detail={"message": f"Error processing CSV file: {str(e)}"})

    return file_content, file.filenam


async def get_workflow_file_content(workflow_id: int, db: Session, user_id: int) -> set:
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    if not project.file_content:
        raise HTTPException(status_code=404, detail="No file content available for this workflow")

    return extract_unique_columns(project.file_content)



async def get_workflow_content(workflow_id: int, db: Session, user_id: int):
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if project.user_id != user_id:
        raise HTTPException(status_code=403,
                            detail="Not enough permissions to access this workflow")

    if not project.file_content:
        raise HTTPException(status_code=404, detail="No file content available for this workflow")

    return project.file_content


async def get_workflow_processed_data(workflow_id: int, db: Session, user_id: int):
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    if workflow.last_step == StepName.DATA_PREPROCESSING:
        return workflow.preprocessing_data
    if workflow.last_step == StepName.BLOCK_BUILDING:
        return workflow.block_building_data
    if workflow.last_step == StepName.FIELD_AND_RECORD_COMPARISON:
        return workflow.comparison_data
    if workflow.last_step == StepName.CLASSIFICATION:
        return workflow.classification_data

    return project.file_content


async def get_evaluation(workflow_id: int, db: Session, user_id: int):
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    source_data = pd.DataFrame(project.file_content)
    classified_data = pd.DataFrame(workflow.classification_data)

    evaluation = Evaluation(source_data, classified_data)
    random_number = random.randint(1, 4)
    evaluation.dataframes_to_jsonb()

    if(random_number == 1):
        return evaluation.retrieve_dataframe_from_jsonb('statistics')
    if (random_number == 2):
        return evaluation.retrieve_dataframe_from_jsonb('evaluated_data')
    if(random_number == 3):
        return evaluation.retrieve_dataframe_from_jsonb('matches')
    if(random_number == 4):
        return evaluation.used_methods_parameters


def extract_unique_columns(data: list) -> set:
    """
    Recursively extracts all unique keys from a list of dictionaries, handling nested objects.
    """
    unique_columns = set()

    def recursive_keys(item, prefix=''):
        if isinstance(item, dict):
            for key, value in item.items():
                new_prefix = f"{prefix}.{key}" if prefix else key
                recursive_keys(value, new_prefix)
        else:
            # Non-dict values are considered leaf nodes
            unique_columns.add(prefix)

    for row in data:
        recursive_keys(row)

    return unique_columns


async def get_workflow_by_id(db: Session, workflow_id: int) -> _models.Workflow | None:
    return db.query(_models.Workflow).filter(_models.Workflow.id == workflow_id).first()