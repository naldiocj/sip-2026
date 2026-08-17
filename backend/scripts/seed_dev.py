"""Seed de desenvolvimento — DEV ONLY.

Cria perfis oficiais, permissões do sistema e utilizadores de
desenvolvimento com credenciais DEV ONLY.

NUNCA executar em produção.
NUNCA utilizar credenciais reais.

Uso:
    cd backend
    .venv/bin/python scripts/seed_dev.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import SessionLocal
from app.modules.auth.domain import (
    Permission,
    PermissionConstants,
    Profile,
    ProfileEnum,
    User,
    UserStatus,
)
from argon2 import PasswordHasher
from sqlalchemy import select
from sqlalchemy.orm import Session

DEV_CREDENTIALS_NOTICE = "AVISO: credenciais DEV ONLY. Nunca utilizar em produção.\nCredenciais:"

# Mapeamento Perfil -> Permissões (fonte única da configuração RBAC de base).
PROFILE_PERMISSIONS: dict[ProfileEnum, list[str]] = {
    ProfileEnum.ADMINISTRADOR_SISTEMA: PermissionConstants.all_permissions(),
    ProfileEnum.DIRECTOR: [
        PermissionConstants.PROCESS_READ,
        PermissionConstants.PROCESS_CREATE,
        PermissionConstants.PROCESS_UPDATE,
        PermissionConstants.PROCESS_ASSIGN,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.DOCUMENT_CREATE,
        PermissionConstants.DOCUMENT_EDIT,
        PermissionConstants.USER_READ,
        PermissionConstants.NOTIFICATION_READ,
        PermissionConstants.NOTIFICATION_MANAGE,
        PermissionConstants.ORGANIZATION_READ,
        PermissionConstants.REPORT_READ,
        PermissionConstants.REPORT_CREATE,
        PermissionConstants.REPORT_EXPORT,
    ],
    ProfileEnum.SECRETARIA_GERAL: [
        PermissionConstants.PROCESS_READ,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.DOCUMENT_CREATE,
        PermissionConstants.DOCUMENT_EDIT,
        PermissionConstants.NOTIFICATION_READ,
        PermissionConstants.NOTIFICATION_MANAGE,
        PermissionConstants.ORGANIZATION_READ,
        PermissionConstants.REPORT_READ,
    ],
    ProfileEnum.CHEFE_DEPARTAMENTO: [
        PermissionConstants.PROCESS_READ,
        PermissionConstants.PROCESS_CREATE,
        PermissionConstants.PROCESS_UPDATE,
        PermissionConstants.PROCESS_ASSIGN,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.DOCUMENT_EDIT,
        PermissionConstants.NOTIFICATION_READ,
        PermissionConstants.NOTIFICATION_MANAGE,
        PermissionConstants.REPORT_READ,
    ],
    ProfileEnum.CHEFE_SECCAO: [
        PermissionConstants.PROCESS_READ,
        PermissionConstants.PROCESS_CREATE,
        PermissionConstants.PROCESS_UPDATE,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.NOTIFICATION_READ,
        PermissionConstants.REPORT_READ,
    ],
    ProfileEnum.INSTRUTOR_PROCESSUAL: [
        PermissionConstants.PROCESS_READ,
        PermissionConstants.PROCESS_CREATE,
        PermissionConstants.PROCESS_UPDATE,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.DOCUMENT_CREATE,
        PermissionConstants.DOCUMENT_EDIT,
        PermissionConstants.NOTIFICATION_READ,
    ],
    ProfileEnum.AGENTE_PIQUETE: [
        PermissionConstants.PIQUETE_READ,
        PermissionConstants.PIQUETE_CREATE,
        PermissionConstants.PIQUETE_UPDATE,
        PermissionConstants.PROCESS_READ,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.NOTIFICATION_READ,
    ],
    ProfileEnum.EDITOR_DOCUMENTAL: [
        PermissionConstants.TEMPLATE_READ,
        PermissionConstants.TEMPLATE_CREATE,
        PermissionConstants.TEMPLATE_EDIT,
        PermissionConstants.TEMPLATE_PUBLISH,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.DOCUMENT_CREATE,
        PermissionConstants.DOCUMENT_EDIT,
        PermissionConstants.DOCUMENT_PUBLISH,
        PermissionConstants.NOTIFICATION_READ,
    ],
    # AGENTE_PGR: sem acesso global a processos (SPRINT-02 define o scope PGR).
    ProfileEnum.AGENTE_PGR: [
        PermissionConstants.PGR_READ,
        PermissionConstants.PGR_MANAGE,
        PermissionConstants.NOTIFICATION_READ,
    ],
}

# Utilizadores de desenvolvimento (DEV ONLY).
DEV_USERS: list[dict[str, object]] = [
    {
        "username": "admin",
        "password": "admin123",
        "full_name": "Administrador do Sistema",
        "employee_number": "0001",
        "profile": ProfileEnum.ADMINISTRADOR_SISTEMA,
    },
    {
        "username": "director",
        "password": "director123",
        "full_name": "Director",
        "employee_number": "0002",
        "profile": ProfileEnum.DIRECTOR,
    },
    {
        "username": "secretaria",
        "password": "secretaria123",
        "full_name": "Secretaria Geral",
        "employee_number": "0003",
        "profile": ProfileEnum.SECRETARIA_GERAL,
    },
    {
        "username": "chefe_departamento",
        "password": "chefe123",
        "full_name": "Chefe de Departamento",
        "employee_number": "0004",
        "profile": ProfileEnum.CHEFE_DEPARTAMENTO,
    },
    {
        "username": "chefe_seccao",
        "password": "seccao123",
        "full_name": "Chefe de Secção",
        "employee_number": "0005",
        "profile": ProfileEnum.CHEFE_SECCAO,
    },
    {
        "username": "instrutor",
        "password": "instrutor123",
        "full_name": "Instrutor Processual",
        "employee_number": "0006",
        "profile": ProfileEnum.INSTRUTOR_PROCESSUAL,
    },
    {
        "username": "piquete",
        "password": "piquete123",
        "full_name": "Agente de Piquete",
        "employee_number": "0007",
        "profile": ProfileEnum.AGENTE_PIQUETE,
    },
    {
        "username": "editor",
        "password": "editor123",
        "full_name": "Editor Documental",
        "employee_number": "0008",
        "profile": ProfileEnum.EDITOR_DOCUMENTAL,
    },
    {
        "username": "pgr",
        "password": "pgr123",
        "full_name": "Agente PGR",
        "employee_number": "0009",
        "profile": ProfileEnum.AGENTE_PGR,
    },
]


def seed(session: Session, hasher: PasswordHasher | None = None) -> dict[str, int]:
    """Executa o seed (idempotente). Devolve contagem de objectos criados."""
    hasher = hasher or PasswordHasher()
    created = {"profiles": 0, "permissions": 0, "users": 0}

    # Perfis
    profiles: dict[ProfileEnum, Profile] = {}
    for profile_enum in ProfileEnum:
        profile = session.scalar(select(Profile).where(Profile.code == profile_enum))
        if profile is None:
            profile = Profile(
                code=profile_enum,
                name=profile_enum.value.replace("_", " ").title(),
                description=f"Perfil {profile_enum.value}",
                is_active=True,
            )
            session.add(profile)
            created["profiles"] += 1
        profiles[profile_enum] = profile

    # Permissões
    permissions: dict[str, Permission] = {}
    for code in PermissionConstants.all_permissions():
        permission = session.scalar(select(Permission).where(Permission.code == code))
        if permission is None:
            resource, _, action = code.partition(".")
            permission = Permission(
                code=code,
                resource=resource,
                action=action,
                description=f"Permissão {code}",
                is_active=True,
            )
            session.add(permission)
            created["permissions"] += 1
        permissions[code] = permission

    session.flush()

    # Associações perfil -> permissões
    for profile_enum, codes in PROFILE_PERMISSIONS.items():
        profile = profiles[profile_enum]
        for code in codes:
            if code not in profile.permissions:
                profile.permissions.append(permissions[code])

    # Utilizadores
    for user_data in DEV_USERS:
        username = str(user_data["username"])
        user = session.scalar(select(User).where(User.username == username))
        if user is None:
            user = User(
                username=username,
                email=f"{username}@sip.dev.local",
                password_hash=hasher.hash(str(user_data["password"])),
                full_name=str(user_data["full_name"]),
                employee_number=str(user_data["employee_number"]),
                status=UserStatus.ACTIVE,
                is_active=True,
            )
            session.add(user)
            created["users"] += 1
            session.flush()
            user.profiles.append(profiles[ProfileEnum(str(user_data["profile"]))])

    session.commit()
    return created


def main() -> None:
    print("=" * 60)
    print("SIP — Seed de desenvolvimento (DEV ONLY)")
    print("=" * 60)
    with SessionLocal() as session:
        created = seed(session)
    print(f"Perfis criados: {created['profiles']}")
    print(f"Permissões criadas: {created['permissions']}")
    print(f"Utilizadores criados: {created['users']}")
    print()
    print(DEV_CREDENTIALS_NOTICE)
    for user_data in DEV_USERS:
        print(f"  {user_data['username']:<20} {user_data['password']}")
    print()
    print("DEV ONLY — estas credenciais NUNCA devem existir em produção.")


if __name__ == "__main__":
    main()
