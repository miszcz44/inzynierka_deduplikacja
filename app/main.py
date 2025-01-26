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
