import datetime as dt
import sqlalchemy as _sql

import database as _database


class User(_database.Base):
    __tablename__ = "users"
    id = _sql.Column(_sql.Integer, primary_key=True, index=True)
    email = _sql.Column(_sql.String, unique=True, index=True)
    date_created = _sql.Column(_sql.DateTime, default=dt.datetime.utcnow)