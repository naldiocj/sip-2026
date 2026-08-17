# ADR-001 — Modular Monolith

## Estado

Aceite

## Contexto

O SIP deve ser construído como uma plataforma integrada com múltiplos
módulos (Processos, Piquete, Documentos, Instrução, Mandados, BRP,
PGR, Relatórios). A questão é: monolito, microserviços ou algo
intermédio?

## Decisão

Adoptar **Modular Monolith** com fronteiras claras entre módulos.

### Razões

1. **Simplicidade operacional** — um único processo, uma única base
   de dados, uma única consistent boundary.
2. **Equipas pequenas** — o SIP terá uma equipa reduzida; microserviços
   adicionam overhead de deploy, monitorização e debugging.
3. **Consistência transaccional** — operações processuais exigem
   atomicidade entre módulos (ex.: criar processo + registar peça).
4. **Evolutivo** — se no futuro for necessário extrair módulos, as
   fronteiras claras facilitam a migração para microserviços.
5. **Performance** — chamadas internas são mais rápidas que chamadas
   de rede entre microserviços.

### Contra-argumentos considerados

- Microserviços oferecem escalabilidade independente → não necessário
  nesta fase; PostgreSQL aguenta a carga projectada.
- Microserviços oferecem deploy independente → compensável com
  feature flags e módulos bem isolados.

## Consequências

- Cada módulo deve ter fronteiras claras (domain, application,
  infrastructure, api).
- Dependências circulares são proibidas.
- A base de dados é partilhada mas cada módulo usa as suas tabelas.
- Deploy é unitário (um container backend).
- Scaling é vertical (não horizontal por módulo).
