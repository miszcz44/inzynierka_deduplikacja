from sqlalchemy.orm import Session
from crud.project import get_project_by_id
from fastapi import HTTPException, UploadFile
import models.workflow as _models
import models.statistics as _models_statistics
import models.workflow_step as _step_model
import models.project as _project_model
import schemas.workflow as _schemas
import schemas.statistics as _schemas_statistics
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
            csv_content = content.decode('utf-8')
            csv_reader = csv.DictReader(csv_content.splitlines())

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


async def get_evaluation(workflow_id: int, db: Session, user_id: int, type: str):
    workflow = await get_workflow_by_id(db=db, workflow_id=workflow_id)

    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")

    project = await get_project_by_id(db=db, project_id=workflow.project_id)

    source_data = pd.DataFrame(project.file_content)
    classified_data = pd.DataFrame(workflow.classification_data)

    evaluation = Evaluation(source_data, classified_data)
    if type == 'statistics':
        evaluation.get_statistics()
    elif type == 'evaluated_data':
        evaluation.get_deduplicated_data()
    elif type == 'matches':
        evaluation.show_matches_side_by_side()
    evaluation.dataframes_to_jsonb()
    return evaluation.retrieve_dataframe_from_jsonb(type)


async def save_statistics(workflow_id: int, db: Session, user_id: int, title: str):
    workflow = await get_workflow_by_id(db, workflow_id)
    project = await get_project_by_id(db, workflow.project_id)

    statistics = _models_statistics.Statistics(
        title=title,
        workflow_id=workflow_id,
        filename=project.filename,
        workflow_name=workflow.title,
        project_name=project.title,
        deduplicated_data=await get_evaluation(workflow_id, db, user_id, 'evaluated_data'),
        statistics=await get_evaluation(workflow_id, db, user_id, 'statistics'),
        matches=await get_evaluation(workflow_id, db, user_id, 'matches'),
    )

    db.add(statistics)
    db.commit()
    db.refresh(statistics)

    return statistics


async def get_statistics_list(db: Session, user_id: int):
    list = (
        db.query(_models_statistics.Statistics)
        .join(_models.Workflow, _models_statistics.Statistics.workflow_id == _models.Workflow.id)
        .join(_project_model.Project, _models.Workflow.project_id == _project_model.Project.id)
        .filter(_project_model.Project.user_id == user_id)
        .all()
    )

    result = []
    for record in list:
        mapped_record = {
            "title": record.title,
            "project_name": record.project_name,
            "workflow_name": record.workflow_name,
            "filename": record.filename,
            "statistics": record.statistics,
        }
        result.append(mapped_record)

    return result

async def get_statistics(statistics_id: int, db: Session, user_id: int):
    return db.query(_models_statistics.Statistics).filter(_models_statistics.Statistics.id == statistics_id).first()


async def get_parameters(workflow_id: int, db: Session, user_id: int):
    return db.query(_step_model.WorkflowStep).filter(_step_model.WorkflowStep.workflow_id == workflow_id).all()


def extract_unique_columns(data: list) -> set:
    unique_columns = set()

    def recursive_keys(item, prefix=''):
        if isinstance(item, dict):
            for key, value in item.items():
                new_prefix = f"{prefix}.{key}" if prefix else key
                recursive_keys(value, new_prefix)
        else:
            unique_columns.add(prefix)

    for row in data:
        recursive_keys(row)

    return unique_columns


async def get_workflow_by_id(db: Session, workflow_id: int) -> _models.Workflow | None:
    return db.query(_models.Workflow).filter(_models.Workflow.id == workflow_id).first()