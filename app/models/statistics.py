import datetime as dt
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from config.database import Base


class Statistics(Base):
    __tablename__ = "statistics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    project_name = Column(String, nullable=False)
    workflow_name = Column(String, nullable=False)
    deduplicated_data = Column(JSONB)
    statistics = Column(JSONB)
    matches = Column(JSONB)
    workflow_id = Column(Integer, ForeignKey('workflows.id'), nullable=False)

    workflow = relationship("Workflow", back_populates="statistics")
