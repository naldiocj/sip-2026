"""tabelas de responsabilidades, delegações e substituições

Revision ID: a1788843e317
Revises: 7739daf1267b
Create Date: 2026-08-19 13:11:15.392964
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = 'a1788843e317'
down_revision: str | None = '7739daf1267b'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ### comandos gerados automaticamente pelo Alembic - ajustar conforme necessário! ###
    op.create_table('delegations',
    sa.Column('delegator_user_id', sa.Uuid(), nullable=False),
    sa.Column('delegate_user_id', sa.Uuid(), nullable=False),
    sa.Column('scope', sa.String(length=30), nullable=False),
    sa.Column('organizational_unit_id', sa.Uuid(), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=True),
    sa.Column('end_date', sa.Date(), nullable=True),
    sa.Column('reason', sa.Text(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['delegate_user_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['delegator_user_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['organizational_unit_id'], ['organizational_units.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_delegations_delegate_user_id'), 'delegations', ['delegate_user_id'], unique=False)
    op.create_index(op.f('ix_delegations_delegator_user_id'), 'delegations', ['delegator_user_id'], unique=False)
    op.create_index(op.f('ix_delegations_organizational_unit_id'), 'delegations', ['organizational_unit_id'], unique=False)
    op.create_index(op.f('ix_delegations_scope'), 'delegations', ['scope'], unique=False)
    op.create_table('functional_role_assignments',
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('organizational_unit_id', sa.Uuid(), nullable=False),
    sa.Column('functional_role', sa.String(length=30), nullable=False),
    sa.Column('start_date', sa.Date(), nullable=True),
    sa.Column('end_date', sa.Date(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['organizational_unit_id'], ['organizational_units.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_functional_role_assignments_functional_role'), 'functional_role_assignments', ['functional_role'], unique=False)
    op.create_index(op.f('ix_functional_role_assignments_organizational_unit_id'), 'functional_role_assignments', ['organizational_unit_id'], unique=False)
    op.create_index(op.f('ix_functional_role_assignments_user_id'), 'functional_role_assignments', ['user_id'], unique=False)
    op.create_table('responsibilities',
    sa.Column('user_id', sa.Uuid(), nullable=False),
    sa.Column('scope', sa.String(length=30), nullable=False),
    sa.Column('organizational_unit_id', sa.Uuid(), nullable=True),
    sa.Column('resource_type', sa.String(length=50), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=True),
    sa.Column('end_date', sa.Date(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['organizational_unit_id'], ['organizational_units.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_responsibilities_organizational_unit_id'), 'responsibilities', ['organizational_unit_id'], unique=False)
    op.create_index(op.f('ix_responsibilities_scope'), 'responsibilities', ['scope'], unique=False)
    op.create_index(op.f('ix_responsibilities_user_id'), 'responsibilities', ['user_id'], unique=False)
    op.create_table('substitutions',
    sa.Column('substituted_user_id', sa.Uuid(), nullable=False),
    sa.Column('substitute_user_id', sa.Uuid(), nullable=False),
    sa.Column('organizational_unit_id', sa.Uuid(), nullable=True),
    sa.Column('functional_role', sa.String(length=30), nullable=True),
    sa.Column('start_date', sa.Date(), nullable=True),
    sa.Column('end_date', sa.Date(), nullable=True),
    sa.Column('reason', sa.Text(), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['organizational_unit_id'], ['organizational_units.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['substitute_user_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['substituted_user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_substitutions_organizational_unit_id'), 'substitutions', ['organizational_unit_id'], unique=False)
    op.create_index(op.f('ix_substitutions_substitute_user_id'), 'substitutions', ['substitute_user_id'], unique=False)
    op.create_index(op.f('ix_substitutions_substituted_user_id'), 'substitutions', ['substituted_user_id'], unique=False)
    op.add_column('organizations', sa.Column('organization_type', sa.String(length=20), nullable=False, server_default='INTERNAL'))
    op.alter_column('organizations', 'organization_type', server_default=None)
    # ### fim dos comandos do Alembic ###


def downgrade() -> None:
    # ### comandos gerados automaticamente pelo Alembic - ajustar conforme necessário! ###
    op.drop_column('organizations', 'organization_type')
    op.drop_index(op.f('ix_substitutions_substituted_user_id'), table_name='substitutions')
    op.drop_index(op.f('ix_substitutions_substitute_user_id'), table_name='substitutions')
    op.drop_index(op.f('ix_substitutions_organizational_unit_id'), table_name='substitutions')
    op.drop_table('substitutions')
    op.drop_index(op.f('ix_responsibilities_user_id'), table_name='responsibilities')
    op.drop_index(op.f('ix_responsibilities_scope'), table_name='responsibilities')
    op.drop_index(op.f('ix_responsibilities_organizational_unit_id'), table_name='responsibilities')
    op.drop_table('responsibilities')
    op.drop_index(op.f('ix_functional_role_assignments_user_id'), table_name='functional_role_assignments')
    op.drop_index(op.f('ix_functional_role_assignments_organizational_unit_id'), table_name='functional_role_assignments')
    op.drop_index(op.f('ix_functional_role_assignments_functional_role'), table_name='functional_role_assignments')
    op.drop_table('functional_role_assignments')
    op.drop_index(op.f('ix_delegations_scope'), table_name='delegations')
    op.drop_index(op.f('ix_delegations_organizational_unit_id'), table_name='delegations')
    op.drop_index(op.f('ix_delegations_delegator_user_id'), table_name='delegations')
    op.drop_index(op.f('ix_delegations_delegate_user_id'), table_name='delegations')
    op.drop_table('delegations')
    # ### fim dos comandos do Alembic ###
