"""Infraestrutura base de eventos assíncronos (RabbitMQ).

Nesta fase apenas os conceitos base:

- Event / Message;
- Publisher;
- Consumer.

Todas as mensagens carregam correlation_id para propagação.
Não criar dezenas de queues nesta fase.
"""

import json
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Any

from aio_pika import ExchangeType, connect_robust
from aio_pika import Message as PikaMessage
from aio_pika.abc import AbstractIncomingMessage

from app.core.config import get_settings
from app.core.context import get_correlation_id

DEFAULT_EXCHANGE = "sip.events"

Handler = Callable[[str, str, Any], Awaitable[None]]


@dataclass
class Event:
    """Evento de domínio base.

    - name: nome canónico do evento, ex.: "process.piece.received";
    - payload: dados do evento;
    - correlation_id: herdado do contexto actual;
    - message_id: id único da mensagem.
    """

    name: str
    payload: dict[str, Any]
    correlation_id: str = field(default_factory=get_correlation_id)
    message_id: str = ""


class Publisher:
    """Publica eventos no exchange sip.events (topic)."""

    def __init__(self, url: str | None = None) -> None:
        self._url = url or get_settings().rabbitmq_url

    async def publish(self, event: Event, routing_key: str | None = None) -> None:
        connection = await connect_robust(self._url)
        async with connection:
            channel = await connection.channel()
            await channel.declare_exchange(DEFAULT_EXCHANGE, ExchangeType.TOPIC, durable=True)
            message = PikaMessage(
                body=json.dumps(event.payload).encode(),
                content_type="application/json",
                correlation_id=event.correlation_id,
                message_id=event.message_id or event.name,
                headers={"event": event.name},
            )
            exchange = await channel.get_exchange(DEFAULT_EXCHANGE)
            await exchange.publish(message, routing_key=routing_key or event.name)


class Consumer:
    """Consome mensagens de um routing key com correlation_id propagado."""

    def __init__(self, queue_name: str, routing_keys: list[str], handler: Handler) -> None:
        self.queue_name = queue_name
        self.routing_keys = routing_keys
        self.handler = handler

    async def start(self) -> None:
        connection = await connect_robust(get_settings().rabbitmq_url)
        async with connection:
            channel = await connection.channel()
            queue = await channel.declare_queue(self.queue_name, durable=True)
            for routing_key in self.routing_keys:
                await queue.bind(DEFAULT_EXCHANGE, routing_key)
            await queue.consume(self._on_message)

    async def _on_message(self, message: AbstractIncomingMessage) -> None:
        async with message.process(requeue=True):
            await self.handler(
                message.correlation_id or "",
                message.message_id or "",
                message.body,
            )
