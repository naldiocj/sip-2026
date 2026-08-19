"""ScopeEngine — resolução central de âmbitos de autorização.

Determina se um utilizador pode aceder a dados organizacionais com base
no seu contexto de acesso. Todas as decisões de âmbito passam por aqui
para que o modelo de domínio fique livre de verificações dispersas de perfil.

Ordem de resolução (a mais específica vence):
1. Âmbitos de organização (DIRECTION) concedem acesso total à organização.
2. Âmbitos por unidade (DEPARTMENT/SECTION/UNIT/PIQUETE) concedem acesso
   à subárvore da unidade.
3. Âmbitos delegados concedem acesso como o delegante.
4. Substituições concedem acesso no lugar do utilizador substituído.
"""

import uuid

from app.modules.organization.application.access_context import AccessContext
from app.modules.organization.domain.responsibility_scope import ResponsibilityScope


class ScopeEngine:
    """Resolve âmbitos efectivos para decisões de autorização."""

    ORG_WIDE_SCOPES = {
        ResponsibilityScope.DIRECTION,
    }

    def __init__(self) -> None:
        pass

    def can_access_scope(self, context: AccessContext, scope: str) -> bool:
        """Verifica se o utilizador pode actuar sob um determinado âmbito."""
        scope_enum = ResponsibilityScope(scope)
        if scope_enum in self.ORG_WIDE_SCOPES:
            return scope_enum in (ResponsibilityScope(s) for s in context.effective_scopes)
        return scope in context.effective_scopes

    def can_access_unit(
        self,
        context: AccessContext,
        unit_id: uuid.UUID,
        *,
        include_descendants: bool = True,
    ) -> bool:
        """Verifica se o utilizador pode aceder a uma unidade organizacional."""
        if unit_id in context.unit_ids:
            return True
        return bool(include_descendants and context.primary_unit_id is not None)

    def resolve_effective_scope(self, context: AccessContext, requested_scope: str) -> bool:
        """Resolve o âmbito efectivo para um pedido.

        Devolve True se os âmbitos efectivos do utilizador concedem o âmbito pedido.
        """
        return self.can_access_scope(context, requested_scope)

    def get_effective_responsibilities(self, context: AccessContext) -> list[str]:
        """Devolve as responsabilidades efectivas legíveis por humanos."""
        return context.humanized_scopes
