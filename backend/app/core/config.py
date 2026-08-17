"""Configuração centralizada do backend.

Toda a configuração é carregada através de variáveis de ambiente.
Não utilizar configurações espalhadas pelo código.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "SIP — Sistema de Instrução Processual"
    app_env: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    version: str = "0.1.0"

    # PostgreSQL
    database_url: str = "postgresql+psycopg://sip:sip@localhost:5432/sip"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # RabbitMQ
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"

    # MinIO
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "sip"
    minio_secret_key: str = "sip-secret"
    minio_secure: bool = False
    minio_buckets: dict[str, str] = {
        "documents": "sip-documents",
        "assets": "sip-assets",
        "attachments": "sip-attachments",
        "exports": "sip-exports",
    }

    # OpenSearch
    opensearch_url: str = "http://localhost:9200"

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost"]

    # Headers de correlação
    request_id_header: str = "X-Request-ID"
    correlation_id_header: str = "X-Correlation-ID"

    # OpenTelemetry
    otel_exporter_otlp_endpoint: str | None = None
    otel_service_name: str = "sip-backend"


@lru_cache
def get_settings() -> Settings:
    """Instância única (cacheada) da configuração."""
    return Settings()
