import datetime as dt
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from config.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    filename = Column(String, nullable=False)
    file_content = Column(JSONB)
    date_created = Column(DateTime, default=dt.datetime.utcnow, nullable=False)
    date_updated = Column(DateTime, default=dt.datetime.utcnow, onupdate=dt.datetime.utcnow, nullable=False)
    workflows = relationship("Workflow", back_populates="project", cascade="all, delete-orphan")

    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    user = relationship("User", back_populates="projects")
