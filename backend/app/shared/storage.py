"""Abstração de object storage (MinIO).

Ficheiros binários NUNCA no PostgreSQL.
No banco apenas: object key, bucket, filename, content type, size,
checksum e metadata necessária.
"""

from functools import lru_cache

from minio import Minio

from app.core.config import get_settings


@lru_cache
def get_minio() -> Minio:
    settings = get_settings()
    return Minio(
        settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure,
    )


def ensure_buckets() -> None:
    """Cria buckets lógicos caso não existam."""
    client = get_minio()
    for bucket in get_settings().minio_buckets.values():
        if not client.bucket_exists(bucket):
            client.make_bucket(bucket)


def ping_minio() -> bool:
    try:
        get_minio().bucket_exists("sip-health")
        return True
    except Exception:
        return False
