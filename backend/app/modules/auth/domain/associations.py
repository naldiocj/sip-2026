"""Association tables for RBAC."""

from sqlalchemy import Column, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

# User <-> Profile association
user_profiles = Table(
    "user_profiles",
    Base.metadata,
    Column("user_id", UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True),
    Column("profile_id", UUID(as_uuid=True), ForeignKey("profiles.id"), primary_key=True),
)

# Profile <-> Permission association
profile_permissions = Table(
    "profile_permissions",
    Base.metadata,
    Column("profile_id", UUID(as_uuid=True), ForeignKey("profiles.id"), primary_key=True),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("permissions.id"), primary_key=True),
)
