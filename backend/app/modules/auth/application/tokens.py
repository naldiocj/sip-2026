"""Serviço de tokens JWT.

Access Token: curto (configurável, default 30 min), claims mínimas:
sub (user_id), sid (session_id), iss, aud, iat, exp.

Não colocar dados sensíveis ou excessivos no JWT.
A revogação é feita via sessão (o sid do token é validado contra a BD).

Refresh Token: arquitectura preparada (sessão com TTL e revogação);
o endpoint /auth/refresh será activado quando necessário.
"""

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt as pyjwt

from app.core.config import get_settings


class TokenService:
    """Criação e validação de tokens de acesso (JWT)."""

    def create_access_token(self, user_id: uuid.UUID, session_id: uuid.UUID) -> str:
        settings = get_settings()
        now = datetime.now(UTC)
        payload = {
            "sub": str(user_id),
            "sid": str(session_id),
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
            "iat": now,
            "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
        }
        return pyjwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)

    def decode_access_token(self, token: str) -> dict[str, Any]:
        """Valida e decodifica um token.

        Levanta InvalidTokenError em caso de token inválido, expirado
        ou com claims incorrectas (iss/aud).
        """
        settings = get_settings()
        return pyjwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
        )
