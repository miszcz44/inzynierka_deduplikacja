import datetime as dt
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from config.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    date_created = Column(DateTime, default=dt.datetime.utcnow)

    projects = relationship("Project", back_populates="user")