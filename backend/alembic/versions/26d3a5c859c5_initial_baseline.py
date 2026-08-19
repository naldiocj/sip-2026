"""baseline inicial

Revision ID: 26d3a5c859c5
Revises: 
Create Date: 2026-08-17 17:48:30.473285
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '26d3a5c859c5'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass