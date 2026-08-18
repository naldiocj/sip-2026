# Responsibility Scopes — Architecture

## Overview

Responsibility scopes define the breadth of data a user can access within the organization. They are independent of permissions (which define capabilities).

## Scope Levels

| Scope | Description | Example |
|-------|-------------|---------|
| GLOBAL | All data across all organizations | System admin |
| ORGANIZATION | All data within the organization | Organization admin |
| DIRECTION | All data within a direction | Director |
| DEPARTMENT | All data within a department | Department head |
| SECTION | All data within a section | Section chief |
| OWN | Only own data | Instrutor |
| ASSIGNED | Only assigned data | Assigned instrutor |
| PIQUETE | Piquete-specific data | Piquete agent |
| PGR | PGR-specific data | PGR agent |

## Relationship to Authorization

Scopes are used in conjunction with permissions:

```
Permission: process.read
Profile: INSTRUTOR_PROCESSUAL
Scope: OWN/ASSIGNED
→ Can only read own or assigned processes
```

```
Permission: process.read
Profile: CHEFE_SECCAO
Scope: SECTION
→ Can read all processes in their section
```

## Implementation

Scopes are stored as enum values and resolved via the AccessContext service. They are not stored per-user but derived from:

1. User's primary unit type
2. User's profile
3. Future: explicit scope assignments

## Design Principles

1. **Scopes are additive**: A user with DIRECTION scope also has SECTION, DEPARTMENT, ORGANIZATION
2. **Scopes are contextual**: The same profile can have different scopes in different units
3. **Scopes are future-proof**: The infrastructure exists for SPRINT-03 authorization rules
