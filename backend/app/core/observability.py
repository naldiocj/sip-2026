"""Observabilidade base.

Mantida simples nesta fase:
- métricas HTTP (contadores e histogramas) expostas em /metrics;
- traces OpenTelemetry apenas quando um endpoint OTLP estiver configurado.

Objectivo: health, métricas HTTP, erros, latência, traces essenciais,
disponibilidade.
"""

from fastapi import FastAPI
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from starlette.responses import Response

from app.core.config import Settings

http_requests_total = Counter(
    "sip_http_requests_total",
    "Total de pedidos HTTP",
    ["method", "path", "status"],
)

http_request_duration_seconds = Histogram(
    "sip_http_request_duration_seconds",
    "Duração dos pedidos HTTP em segundos",
    ["method", "path"],
)


def setup_observability(app: FastAPI, settings: Settings) -> None:
    if not settings.otel_exporter_otlp_endpoint:
        return
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.sdk.resources import Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor

    resource = Resource.create({"service.name": settings.otel_service_name})
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint=settings.otel_exporter_otlp_endpoint))
    )
    trace.set_tracer_provider(provider)
    FastAPIInstrumentor.instrument_app(app, tracer_provider=provider)


def metrics_response() -> Response:
    """Resposta Prometheus em /metrics."""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
