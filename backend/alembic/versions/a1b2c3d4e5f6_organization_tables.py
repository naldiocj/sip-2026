"""tabelas de organização

Revision ID: a1b2c3d4e5f6
Revises: edfc35790c54
Create Date: 2026-08-18 10:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: str | None = 'edfc35790c54'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # --- organizations ---
    op.create_table(
        'organizations',
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('short_name', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_organizations_code', 'organizations', ['code'], unique=True)

    # --- organizational_units ---
    op.create_table(
        'organizational_units',
        sa.Column('organization_id', sa.Uuid(), nullable=False),
        sa.Column('parent_id', sa.Uuid(), nullable=True),
        sa.Column('type_id', sa.String(length=30), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('short_name', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['parent_id'], ['organizational_units.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_organizational_units_organization_id', 'organizational_units', ['organization_id'])
    op.create_index('ix_organizational_units_parent_id', 'organizational_units', ['parent_id'])
    op.create_index('ix_organizational_units_type_id', 'organizational_units', ['type_id'])
    op.create_index('ix_organizational_units_code', 'organizational_units', ['code'])

    # --- user_assignments ---
    op.create_table(
        'user_assignments',
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('organizational_unit_id', sa.Uuid(), nullable=False),
        sa.Column('assignment_type', sa.String(length=30), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['organizational_unit_id'], ['organizational_units.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_user_assignments_user_id', 'user_assignments', ['user_id'])
    op.create_index('ix_user_assignments_organizational_unit_id', 'user_assignments', ['organizational_unit_id'])


def downgrade() -> None:
    op.drop_index('ix_user_assignments_organizational_unit_id', table_name='user_assignments')
    op.drop_index('ix_user_assignments_user_id', table_name='user_assignments')
    op.drop_table('user_assignments')

    op.drop_index('ix_organizational_units_code', table_name='organizational_units')
    op.drop_index('ix_organizational_units_type_id', table_name='organizational_units')
    op.drop_index('ix_organizational_units_parent_id', table_name='organizational_units')
    op.drop_index('ix_organizational_units_organization_id', table_name='organizational_units')
    op.drop_table('organizational_units')

    op.drop_index('ix_organizations_code', table_name='organizations')
    op.drop_table('organizations')
