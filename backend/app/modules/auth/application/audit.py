"""Serviço de auditoria de segurança.

Ponto único de registo de eventos de auditoria. Os callers fornecem
apenas dados de contexto — este serviço garante que passwords, tokens
e segredos NUNCA são persistidos.

Uso nos pontos de interesse (login, logout, autorização, ...):

    AuditService(db).record(
        AuditEventType.LOGIN_SUCCESS,
        user_id=user.id,
        ip_address=ip,
        user_agent=ua,
    )
"""

from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.modules.auth.domain.audit import AuditEvent, AuditEventType, AuditResult

_SENSITIVE_KEY_MARKERS = ("password", "token", "secret", "credential", "hash")


class AuditService:
    """Regista eventos de auditoria na base de dados."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def record(
        self,
        event_type: AuditEventType,
        *,
        user_id: object | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
        details: dict[str, object] | None = None,
        result: AuditResult = AuditResult.SUCCESS,
        commit: bool = True,
    ) -> AuditEvent:
        """Persiste um evento de auditoria (commit imediato por omissão).

        Defesa em profundidade: qualquer chave de details que possa
        conter passwords, tokens ou segredos é removida antes de
        persistir.

        Usar commit=False quando a operação de negócio ainda vai ser
        commitada pelo chamador (evita commits parciais e preserva a
        atomicidade da transacção).
        """
        safe_details = self._sanitize_details(details or {})
        event = AuditEvent(
            event_type=event_type,
            user_id=user_id,
            timestamp=datetime.now(UTC),
            ip_address=ip_address[:45] if ip_address else None,
            user_agent=user_agent[:512] if user_agent else None,
            details=safe_details,
            result=result,
        )
        self.db.add(event)
        if commit:
            self.db.commit()
        return event

    @staticmethod
    def _sanitize_details(details: dict[str, object]) -> dict[str, object]:
        return {
            key: value
            for key, value in details.items()
            if not any(marker in key.lower() for marker in _SENSITIVE_KEY_MARKERS)
        }
