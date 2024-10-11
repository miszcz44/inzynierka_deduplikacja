from config.database import Base
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime as dt


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    filename = Column(String)
    file_content = Column(JSONB)
    date_created = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    date_updated = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)

    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)

    owner = relationship("Project", back_populates="workflows")


