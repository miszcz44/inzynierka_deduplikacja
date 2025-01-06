import fastapi as _fastapi
from routers import users, auth, projects, workflows, workflow_step
from fastapi.middleware.cors import CORSMiddleware
from common.dependencies import _add_tables
from fastapi import File, UploadFile, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt


app = _fastapi.FastAPI()

origins = ['http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"]
)


@app.on_event("startup")
async def startup():
    _add_tables()

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(workflows.router)
app.include_router(workflow_step.router)


@app.get("/")
def version():
    return "1.0.0"


# @app.post("/api/upload", response_model=_schemas.RawDataBase)
# async def upload_file(
#         file: UploadFile = File(...),
#         db: "Session" = _fastapi.Depends(_services.get_db),
#         current_user: _schemas.User = _fastapi.Depends(_services.get_current_user)):
#     if file.content_type not in ["text/csv", "application/json"]:
#         raise HTTPException(status_code=400, detail="Invalid file type")
#
#     file_content = await file.read()
#     file_type = file.content_type
#     file_name = file.filename
#     raw_data = _services.save_file_data_to_db(current_user,
#                                               file_content, file_type, file_name,
#                                               db)
#
#     return raw_data
#
#
# @app.get("/api/raw-data/{data_id}", response_model=_schemas.RawDataBase)
# async def get_raw_data_by_id(data_id: int, db: "Session" = Depends(_services.get_db),
#                              current_user: _schemas.User = Depends(_services.get_current_user)):
#     raw_data = db.query(_models.RawData).filter_by(id=data_id, user_id=current_user.id).first()
#     if not raw_data:
#         raise HTTPException(status_code=404, detail="Data not found")
#     return raw_data
#
#
# @app.get("/api/user/tables", response_model=List[_schemas.RawDataBase])
# async def get_user_tables(db: "Session" = Depends(_services.get_db),
#                           current_user: _schemas.User = Depends(_services.get_current_user)):
#     tables = db.query(_models.RawData).filter_by(user_id=current_user.id).all()
#     return tables
#
#
# @app.get("/api/user/table/{table_id}", response_model=_schemas.RawDataBase)
# async def get_table_by_id(table_id: int, db: "Session" = Depends(_services.get_db),
#                           current_user: _schemas.User = Depends(_services.get_current_user)):
#     table = db.query(_models.RawData).filter_by(id=table_id, user_id=current_user.id).first()
#     if not table:
#         raise HTTPException(status_code=404, detail="Table not found")
#     return table
#
#
# @app.get("/api/block_building/{table_id}", response_model=_schemas.BlockBuildingInfo)
# async def block_building_info(table_id: int,
#                               db: "Session" = Depends(_services.get_db),
#                               current_user: _schemas.User = Depends(_services.get_current_user)):
#
#     table = db.query(_models.RawData).filter_by(id=table_id, user_id=current_user.id).first()
#
#     if not table:
#         raise HTTPException(status_code=404, detail="Table not found")
#
#     block_building_info = {
#         "table_name": table.table_name,
#         "table_id": table.id,
#         "user_id": current_user.id,
#         "username": current_user.username,
#         "methods_available": ["Rolling Window", "Suffix Table"],
#         "date_created": table.date_created
#     }
#
#     return block_building_info