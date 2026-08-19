"""tabelas de pessoas

Revision ID: 7739daf1267b
Revises: a1b2c3d4e5f6
Create Date: 2026-08-19 12:36:36.144243
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = '7739daf1267b'
down_revision: str | None = 'a1b2c3d4e5f6'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ### comandos gerados automaticamente pelo Alembic - ajustar conforme necessário! ###
    op.create_table('persons',
    sa.Column('person_number', sa.String(length=20), nullable=False),
    sa.Column('full_name', sa.String(length=255), nullable=False),
    sa.Column('preferred_name', sa.String(length=255), nullable=True),
    sa.Column('birth_date', sa.Date(), nullable=True),
    sa.Column('birth_place', sa.String(length=255), nullable=True),
    sa.Column('nationality', sa.String(length=100), nullable=True),
    sa.Column('gender', sa.String(length=30), nullable=True),
    sa.Column('bi_number', sa.String(length=50), nullable=True),
    sa.Column('phone', sa.String(length=50), nullable=True),
    sa.Column('email', sa.String(length=255), nullable=True),
    sa.Column('address', sa.Text(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('employee_number', sa.String(length=50), nullable=True),
    sa.Column('functional_category', sa.String(length=100), nullable=True),
    sa.Column('job_title', sa.String(length=255), nullable=True),
    sa.Column('admission_date', sa.Date(), nullable=True),
    sa.Column('employment_status', sa.String(length=30), nullable=True),
    sa.Column('professional_registration', sa.String(length=100), nullable=True),
    sa.Column('notes', sa.Text(), nullable=True),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_persons_bi_number'), 'persons', ['bi_number'], unique=False)
    op.create_index(op.f('ix_persons_email'), 'persons', ['email'], unique=False)
    op.create_index(op.f('ix_persons_employee_number'), 'persons', ['employee_number'], unique=True)
    op.create_index(op.f('ix_persons_person_number'), 'persons', ['person_number'], unique=True)
    op.add_column('users', sa.Column('person_id', sa.Uuid(), nullable=True))
    op.create_index(op.f('ix_users_person_id'), 'users', ['person_id'], unique=True)
    op.create_foreign_key('fk_users_person_id', 'users', 'persons', ['person_id'], ['id'], ondelete='SET NULL')
    # ### fim dos comandos do Alembic ###


def downgrade() -> None:
    # ### comandos gerados automaticamente pelo Alembic - ajustar conforme necessário! ###
    op.drop_constraint('fk_users_person_id', 'users', type_='foreignkey')
    op.drop_index(op.f('ix_users_person_id'), table_name='users')
    op.drop_column('users', 'person_id')
    op.drop_index(op.f('ix_persons_person_number'), table_name='persons')
    op.drop_index(op.f('ix_persons_employee_number'), table_name='persons')
    op.drop_index(op.f('ix_persons_email'), table_name='persons')
    op.drop_index(op.f('ix_persons_bi_number'), table_name='persons')
    op.drop_table('persons')
    # ### fim dos comandos do Alembic ###