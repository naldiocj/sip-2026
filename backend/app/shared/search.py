"""Abstração inicial de pesquisa (OpenSearch).

PostgreSQL continua a ser a fonte oficial dos dados.
OpenSearch será utilizado posteriormente para pesquisa avançada.
Nesta fase apenas: configuração, conexão e health check.
"""

from functools import lru_cache

from opensearchpy import OpenSearch

from app.core.config import get_settings


@lru_cache
def get_opensearch() -> OpenSearch:
    settings = get_settings()
    return OpenSearch(
        hosts=[settings.opensearch_url],
        http_auth=None,
        use_ssl=False,
        verify_certs=False,
        timeout=3,
    )


def ping_opensearch() -> bool:
    try:
        return bool(get_opensearch().ping())
    except Exception:
        return False
