import datetime as dt
import sqlalchemy as _sql
import database as _database
import pydantic as _pydantic
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON


class User(_database.Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    date_created = Column(DateTime, default=dt.datetime.utcnow)
    # raw_data_tables = _sql.orm.relationship("RawData", back_populates="owner")


# class RawData(_database.Base):
#     __tablename__ = "raw_data"
#
#     id = _sql.Column(Integer, primary_key=True, index=True)
#     name = _sql.Column(String, index=True)
#     data = _sql.Column(JSON)
#     date_created = Column(_sql.DateTime, default=dt.datetime.utcnow)
#     user_id = Column(_sql.Integer, ForeignKey('users.id'))
#     owner = _sql.orm.relationship("User", back_populates="raw_data_tables")
