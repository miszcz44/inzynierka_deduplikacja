from config.database import Base
from sqlalchemy import JSON
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy import Enum as SQLAlchemyEnum
from models.enums.step_name import StepName


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(SQLAlchemyEnum(StepName), nullable=False)
    parameters = Column(JSON, nullable=True)

    workflow_id = Column(Integer, ForeignKey('workflows.id'), nullable=False)

    workflow = relationship("Workflow", back_populates="workflow_steps")
