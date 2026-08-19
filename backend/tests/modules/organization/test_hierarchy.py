"""Testes de integridade da hierarquia organizacional (TASK-007).

Cobre:
- self-parent rejeitado;
- ciclos rejeitados;
- parent inexistente;
- parent de outra organização;
- parent inactivo;
- caminho (path) da raiz até à unidade;
- ancestrais e descendentes;
- raiz da hierarquia.
"""

import pytest
from app.modules.organization.application.hierarchy_service import (
    HierarchyService,
)
from app.modules.organization.application.organization_service import (
    OrganizationService,
)
from app.modules.organization.domain.exceptions import (
    CircularHierarchyError,
    CrossOrganizationError,
    InvalidParentError,
    SelfParentError,
)
from app.modules.organization.domain.unit import UnitStatus
from app.modules.organization.domain.unit_type import UnitType
from sqlalchemy.orm import Session
from tests.conftest import requires_database


@requires_database
class TestHierarchyValidation:
    def test_self_parent_rejected(self, db_session: Session, seeded_unit):
        service = HierarchyService(db_session)
        with pytest.raises(SelfParentError):
            service.validate_parent(seeded_unit.id, seeded_unit.id, seeded_unit.organization_id)

    def test_missing_parent_rejected(self, db_session: Session, seeded_unit):
        import uuid

        service = HierarchyService(db_session)
        with pytest.raises(InvalidParentError):
            service.validate_parent(
                seeded_unit.id,
                uuid.uuid4(),
                seeded_unit.organization_id,
            )

    def test_cross_organization_parent_rejected(
        self, db_session: Session, seeded_unit, seeded_organization
    ):
        service = OrganizationService(db_session)
        other = service.create_organization(
            code="ORG-X",
            name="Organização Externa",
        )
        unit_other = service.create_unit(
            organization_id=other.id,
            type_id=UnitType.DIRECTION,
            name="Unidade Externa",
            code="EXT-1",
        )
        hierarchy = HierarchyService(db_session)
        with pytest.raises(CrossOrganizationError):
            hierarchy.validate_parent(
                seeded_unit.id,
                unit_other.id,
                seeded_unit.organization_id,
            )

    def test_inactive_parent_rejected(self, db_session: Session, seeded_unit):
        service = OrganizationService(db_session)
        parent = service.create_unit(
            organization_id=seeded_unit.organization_id,
            type_id=UnitType.DIRECTION,
            name="Pai Inactivo",
            code="PAR-INACTIVE",
        )
        parent.is_active = False
        parent.status = UnitStatus.INACTIVE
        db_session.flush()

        hierarchy = HierarchyService(db_session)
        with pytest.raises(InvalidParentError):
            hierarchy.validate_parent(
                seeded_unit.id,
                parent.id,
                seeded_unit.organization_id,
            )

    def test_cycle_rejected(self, db_session: Session, seeded_unit):
        service = OrganizationService(db_session)
        child = service.create_unit(
            organization_id=seeded_unit.organization_id,
            type_id=UnitType.SECTION,
            name="Filha",
            code="CHILD-CYCLE",
            parent_id=seeded_unit.id,
        )
        hierarchy = HierarchyService(db_session)
        # Mover o pai para ser filho da própria filha cria ciclo
        with pytest.raises(CircularHierarchyError):
            hierarchy.validate_parent(
                seeded_unit.id,
                child.id,
                seeded_unit.organization_id,
            )

    def test_root_parent_is_none_valid(self, db_session: Session, seeded_unit):
        service = HierarchyService(db_session)
        # parent_id=None é sempre válido (mover para raiz)
        service.validate_parent(seeded_unit.id, None, seeded_unit.organization_id)


@requires_database
class TestHierarchyQueries:
    def test_parent_and_children(self, db_session: Session, seeded_unit, seeded_child_unit):
        service = HierarchyService(db_session)
        assert service.get_parent(seeded_child_unit.id).id == seeded_unit.id
        children = service.get_children(seeded_unit.id)
        assert any(c.id == seeded_child_unit.id for c in children)

    def test_ancestors_order(self, db_session: Session, seeded_unit, seeded_child_unit):
        service = OrganizationService(db_session)
        grandchild = service.create_unit(
            organization_id=seeded_unit.organization_id,
            type_id=UnitType.UNIT,
            name="Neta",
            code="GC-1",
            parent_id=seeded_child_unit.id,
        )
        hierarchy = HierarchyService(db_session)
        ancestors = hierarchy.get_ancestors(grandchild.id)
        # Ordem: pai directo primeiro, raiz no fim
        assert ancestors[0].id == seeded_child_unit.id
        assert ancestors[-1].id == seeded_unit.id

    def test_descendants(self, db_session: Session, seeded_unit, seeded_child_unit):
        hierarchy = HierarchyService(db_session)
        descendants = hierarchy.get_descendants(seeded_unit.id)
        assert any(d.id == seeded_child_unit.id for d in descendants)

    def test_root_of_hierarchy(self, db_session: Session, seeded_unit, seeded_child_unit):
        hierarchy = HierarchyService(db_session)
        root = hierarchy.get_root(seeded_child_unit.id)
        assert root.id == seeded_unit.id

    def test_unit_path_root_to_unit(self, db_session: Session, seeded_unit, seeded_child_unit):
        hierarchy = HierarchyService(db_session)
        path = hierarchy.get_unit_path(seeded_child_unit.id)
        assert [u.id for u in path] == [seeded_unit.id, seeded_child_unit.id]

    def test_unit_path_of_root(self, db_session: Session, seeded_unit):
        hierarchy = HierarchyService(db_session)
        path = hierarchy.get_unit_path(seeded_unit.id)
        assert [u.id for u in path] == [seeded_unit.id]
