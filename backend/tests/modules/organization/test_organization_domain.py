"""Testes do domínio de organização e unidades organizacionais.

Cobre TASK-005 (organization-type) e TASK-006 (organizational-unit):
- criação de organização com tipo explícito;
- default INTERNAL;
- humanização de tipos;
- criação de unidade raiz;
- unicidade de código dentro da organização;
- mesmo código permitido em organizações diferentes.
"""

import pytest
from app.modules.organization.application.organization_service import (
    OrganizationService,
)
from app.modules.organization.domain.organization import (
    ORGANIZATION_TYPE_LABELS,
    OrganizationType,
)
from app.modules.organization.domain.unit import UnitStatus
from app.modules.organization.domain.unit_type import UnitType
from sqlalchemy import exc as sqlalchemy_exc
from sqlalchemy.orm import Session
from tests.conftest import requires_database


@requires_database
class TestOrganizationType:
    def test_create_organization_with_explicit_type(
        self,
        db_session: Session,
    ):
        service = OrganizationService(db_session)
        org = service.create_organization(
            code="PGR-TEST",
            name="Procuradoria Geral da República",
            organization_type=OrganizationType.EXTERNAL,
        )
        assert org.organization_type == OrganizationType.EXTERNAL
        assert org.status.value == "ACTIVE"

    def test_create_organization_defaults_to_internal(
        self,
        db_session: Session,
    ):
        service = OrganizationService(db_session)
        org = service.create_organization(
            code="SIC-TEST-2",
            name="Organização Interna",
        )
        assert org.organization_type == OrganizationType.INTERNAL

    def test_organization_type_humanization(self):
        assert ORGANIZATION_TYPE_LABELS[OrganizationType.INTERNAL] == "Interna"
        assert ORGANIZATION_TYPE_LABELS[OrganizationType.EXTERNAL] == "Externa"


@requires_database
class TestOrganizationalUnit:
    def test_create_root_unit_without_parent(
        self,
        db_session: Session,
        seeded_organization,
    ):
        service = OrganizationService(db_session)
        unit = service.create_unit(
            organization_id=seeded_organization.id,
            type_id=UnitType.DIRECTION,
            name="Direcção Raiz",
            code="DIR-ROOT",
        )
        assert unit.parent_id is None
        assert unit.status == UnitStatus.ACTIVE
        assert unit.is_active is True

    def test_duplicate_code_same_organization_rejected(
        self,
        db_session: Session,
        seeded_organization,
    ):
        service = OrganizationService(db_session)
        service.create_unit(
            organization_id=seeded_organization.id,
            type_id=UnitType.DIRECTION,
            name="Primeira",
            code="DUP-CODE",
        )
        with pytest.raises(Exception) as excinfo:
            service.create_unit(
                organization_id=seeded_organization.id,
                type_id=UnitType.SECTION,
                name="Segunda",
                code="DUP-CODE",
            )
        assert "code" in str(excinfo.value).lower()

    def test_same_code_allowed_in_different_organizations(
        self,
        db_session: Session,
        seeded_organization,
    ):
        service = OrganizationService(db_session)
        other = service.create_organization(
            code="ORG-ALT",
            name="Organização Alternativa",
            organization_type=OrganizationType.EXTERNAL,
        )
        service.create_unit(
            organization_id=seeded_organization.id,
            type_id=UnitType.DIRECTION,
            name="Unidade A",
            code="SHARED-CODE",
        )
        unit_b = service.create_unit(
            organization_id=other.id,
            type_id=UnitType.DIRECTION,
            name="Unidade B",
            code="SHARED-CODE",
        )
        assert unit_b.code == "SHARED-CODE"

    def test_unique_constraint_at_database_level(
        self,
        db_session: Session,
        seeded_organization,
    ):
        service = OrganizationService(db_session)
        service.create_unit(
            organization_id=seeded_organization.id,
            type_id=UnitType.DIRECTION,
            name="Unidade A",
            code="DB-UNIQUE",
        )
        from app.modules.organization.domain.unit import OrganizationalUnit

        duplicate = OrganizationalUnit(
            organization_id=seeded_organization.id,
            type_id=UnitType.SECTION,
            code="DB-UNIQUE",
            name="Duplicada",
            status=UnitStatus.ACTIVE,
            is_active=True,
        )
        db_session.add(duplicate)
        with pytest.raises(sqlalchemy_exc.IntegrityError):
            db_session.flush()
        db_session.rollback()

    def test_units_have_required_indexes(self, db_session: Session):
        from sqlalchemy import inspect

        inspector = inspect(db_session.bind)
        indexes = {i["name"] for i in inspector.get_indexes("organizational_units")}
        for expected in (
            "ix_organizational_units_organization_id",
            "ix_organizational_units_parent_id",
            "ix_organizational_units_type_id",
            "ix_organizational_units_code",
        ):
            assert expected in indexes, f"Índice em falta: {expected}"
