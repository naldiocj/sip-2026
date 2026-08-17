"""User session entity.

Sessions allow revocation of access (logout, security incidents).
Full refresh-token support is prepared here and activated in a future
sprint, keeping the architecture revocable from day one.
"""

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserSession(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """User authentication session.

    A session is created on login and revoked on logout or when access
    must be cut. An access token carries the session id so revocation
    can be enforced on every authenticated request.
    """

    __tablename__ = "user_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    ip_address: Mapped[str | None] = mapped_column(
        String(45),
        nullable=True,
    )
    user_agent: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )

    user = relationship(
        "User",
        back_populates="sessions",
    )

    @property
    def is_revoked(self) -> bool:
        """Whether the session has been revoked."""
        return self.revoked_at is not None

    def revoke(self) -> None:
        """Revoke this session (idempotent)."""
        if self.revoked_at is None:
            self.revoked_at = datetime.now()

    def __repr__(self) -> str:
        return f"<UserSession {self.id} user={self.user_id}>"
