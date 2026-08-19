"""Fixtures do módulo organization (partilham as de tests/conftest.py)."""

import pytest
from app.modules.organization.application.assignment_service import (
    AssignmentService,
)
from app.modules.organization.domain.organization import (
    Organization,
    OrganizationStatus,
    OrganizationType,
)
from app.modules.organization.domain.unit import OrganizationalUnit, UnitStatus
from app.modules.organization.domain.unit_type import UnitType
from sqlalchemy import select
from sqlalchemy.orm import Session


@pytest.fixture()
def seeded_organization(db_session: Session) -> Organization:
    """Organização interna de teste."""
    org = db_session.scalar(select(Organization).where(Organization.code == "ORG-TEST"))
    if org is None:
        org = Organization(
            code="ORG-TEST",
            name="Organização Teste",
            short_name="OrgTest",
            organization_type=OrganizationType.INTERNAL,
            status=OrganizationStatus.ACTIVE,
            is_active=True,
        )
        db_session.add(org)
        db_session.flush()
    return org


@pytest.fixture()
def seeded_unit(seeded_organization: Organization, db_session: Session) -> OrganizationalUnit:
    """Unidade organizacional de topo de teste."""
    unit = db_session.scalar(
        select(OrganizationalUnit).where(OrganizationalUnit.code == "UNIT-TEST")
    )
    if unit is None:
        unit = OrganizationalUnit(
            organization_id=seeded_organization.id,
            type_id=UnitType.DEPARTMENT,
            code="UNIT-TEST",
            name="Unidade Teste",
            short_name="UnidTest",
            status=UnitStatus.ACTIVE,
            is_active=True,
        )
        db_session.add(unit)
        db_session.flush()
    return unit


@pytest.fixture()
def seeded_child_unit(seeded_unit: OrganizationalUnit, db_session: Session) -> OrganizationalUnit:
    """Unidade filha de teste."""
    child = db_session.scalar(
        select(OrganizationalUnit).where(OrganizationalUnit.code == "CHILD-TEST")
    )
    if child is None:
        child = OrganizationalUnit(
            organization_id=seeded_unit.organization_id,
            type_id=UnitType.SECTION,
            code="CHILD-TEST",
            name="Unidade Filha Teste",
            parent_id=seeded_unit.id,
            status=UnitStatus.ACTIVE,
            is_active=True,
        )
        db_session.add(child)
        db_session.flush()
    return child


@pytest.fixture()
def assignment_service(db_session: Session) -> AssignmentService:
    """Serviço de atribuições ligado à sessão de teste."""
    return AssignmentService(db_session)
