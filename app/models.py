import datetime as dt
import uuid
import sqlalchemy as _sql
import database as _database
import pydantic as _pydantic
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB


class User(_database.Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    date_created = Column(DateTime, default=dt.datetime.utcnow)
    raw_data_tables = _sql.orm.relationship("RawData", back_populates="owner")


class RawData(_database.Base):
    __tablename__ = "raw_data"

    id = _sql.Column(_sql.Integer, primary_key=True, index=True)
    # table_name = _sql.Column(_sql.String, index=True) # TODO: FOR BETTER VISIBILITY AND QUERYING
    user_id = _sql.Column(_sql.Integer, _sql.ForeignKey('users.id'), nullable=False)
    username = _sql.Column(_sql.String, nullable=False)
    email = _sql.Column(_sql.String, nullable=False)
    data = _sql.Column(JSONB)
    date_created = _sql.Column(_sql.DateTime, default=dt.datetime.utcnow)

    owner = _sql.orm.relationship("User", back_populates="raw_data_tables")
