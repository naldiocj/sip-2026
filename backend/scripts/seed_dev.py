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
    PROFILE_LABELS,
    Permission,
    PermissionConstants,
    Profile,
    ProfileEnum,
    User,
    UserStatus,
)
from argon2 import PasswordHasher
from sqlalchemy import func, select
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
        PermissionConstants.PERSON_READ,
        PermissionConstants.ASSIGNMENT_READ,
        PermissionConstants.ASSIGNMENT_CREATE,
        PermissionConstants.ASSIGNMENT_UPDATE,
        PermissionConstants.RESPONSIBILITY_READ,
        PermissionConstants.DELEGATION_READ,
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
        PermissionConstants.PERSON_READ,
        PermissionConstants.PERSON_CREATE,
        PermissionConstants.PERSON_UPDATE,
        PermissionConstants.ASSIGNMENT_READ,
        PermissionConstants.ASSIGNMENT_CREATE,
        PermissionConstants.ASSIGNMENT_UPDATE,
        PermissionConstants.ASSIGNMENT_END,
        PermissionConstants.RESPONSIBILITY_READ,
        PermissionConstants.DELEGATION_READ,
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
        PermissionConstants.ORGANIZATION_READ,
        PermissionConstants.PERSON_READ,
        PermissionConstants.ASSIGNMENT_READ,
        PermissionConstants.RESPONSIBILITY_READ,
        PermissionConstants.REPORT_READ,
    ],
    ProfileEnum.CHEFE_SECCAO: [
        PermissionConstants.PROCESS_READ,
        PermissionConstants.PROCESS_CREATE,
        PermissionConstants.PROCESS_UPDATE,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.NOTIFICATION_READ,
        PermissionConstants.ORGANIZATION_READ,
        PermissionConstants.PERSON_READ,
        PermissionConstants.ASSIGNMENT_READ,
        PermissionConstants.RESPONSIBILITY_READ,
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
        PermissionConstants.PERSON_READ,
        PermissionConstants.ASSIGNMENT_READ,
        PermissionConstants.RESPONSIBILITY_READ,
    ],
    ProfileEnum.AGENTE_PIQUETE: [
        PermissionConstants.PIQUETE_READ,
        PermissionConstants.PIQUETE_CREATE,
        PermissionConstants.PIQUETE_UPDATE,
        PermissionConstants.PROCESS_READ,
        PermissionConstants.DOCUMENT_READ,
        PermissionConstants.NOTIFICATION_READ,
        PermissionConstants.PERSON_READ,
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
        PermissionConstants.PERSON_READ,
    ],
    # AGENTE_PGR: sem acesso global a processos (SPRINT-02 define o scope PGR).
    ProfileEnum.AGENTE_PGR: [
        PermissionConstants.PGR_READ,
        PermissionConstants.PGR_MANAGE,
        PermissionConstants.NOTIFICATION_READ,
        PermissionConstants.PERSON_READ,
        PermissionConstants.ASSIGNMENT_READ,
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
    created = {"profiles": 0, "permissions": 0, "users": 0, "persons": 0}

    # Perfis
    profiles: dict[ProfileEnum, Profile] = {}
    for profile_enum in ProfileEnum:
        humanized_name = PROFILE_LABELS[profile_enum]
        profile = session.scalar(select(Profile).where(Profile.code == profile_enum))
        if profile is None:
            profile = Profile(
                code=profile_enum,
                name=humanized_name,
                description=f"Perfil {humanized_name}",
                is_active=True,
            )
            session.add(profile)
            created["profiles"] += 1
        elif profile.name != humanized_name:
            profile.name = humanized_name
            profile.description = f"Perfil {humanized_name}"
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

    # Organização e unidades (DEV ONLY)
    from app.modules.organization.domain.organization import (
        Organization,
        OrganizationStatus,
        OrganizationType,
    )
    from app.modules.organization.domain.unit import OrganizationalUnit, UnitStatus
    from app.modules.organization.domain.unit_type import UnitType
    from app.modules.organization.domain.user_assignment import (
        AssignmentStatus,
        AssignmentType,
        UserAssignment,
    )
    from app.modules.person.domain.person import Person, PersonNumberGenerator, PersonStatus

    org = session.scalar(select(Organization).where(Organization.code == "SIC"))
    if org is None:
        org = Organization(
            code="SIC",
            name="Serviço de Investigação Criminal",
            short_name="SIC",
            description="Organização principal do SIP",
            organization_type=OrganizationType.INTERNAL,
            status=OrganizationStatus.ACTIVE,
            is_active=True,
        )
        session.add(org)
        created["organizations"] = 1
        session.flush()

        # Direcção de Investigação
        dir_inv = OrganizationalUnit(
            organization_id=org.id,
            type_id=UnitType.DIRECTION,
            code="DIR-INV",
            name="Direcção de Investigação",
            short_name="DI",
            status=UnitStatus.ACTIVE,
            is_active=True,
        )
        session.add(dir_inv)
        session.flush()

        # Departamento de Investigação Criminal
        dep_inv = OrganizationalUnit(
            organization_id=org.id,
            parent_id=dir_inv.id,
            type_id=UnitType.DEPARTMENT,
            code="DEP-IC",
            name="Departamento de Investigação Criminal",
            short_name="DIC",
            status=UnitStatus.ACTIVE,
            is_active=True,
        )
        session.add(dep_inv)
        session.flush()

        # Secção de Investigação
        sec_inv = OrganizationalUnit(
            organization_id=org.id,
            parent_id=dep_inv.id,
            type_id=UnitType.SECTION,
            code="SEC-INV",
            name="Secção de Investigação",
            short_name="SI",
            status=UnitStatus.ACTIVE,
            is_active=True,
        )
        session.add(sec_inv)
        session.flush()

        # Secretaria Geral
        sec_geral = OrganizationalUnit(
            organization_id=org.id,
            type_id=UnitType.UNIT,
            code="SEC-GERAL",
            name="Secretaria Geral",
            short_name="SG",
            status=UnitStatus.ACTIVE,
            is_active=True,
        )
        session.add(sec_geral)
        session.flush()

        # Direcções
        directions = [
            ("DIACID", "Direção de Investigação de Acidentes", "Inv. Acidentes"),
            ("DCCCPES", "Direção de Combate aos Crimes Contra as Pessoas", "Crimes Pessoas"),
            ("DCCCPAT", "Direção de Combate aos Crimes Contra O Património", "Crimes Património"),
            ("DCCFF", "Direção de Combate aos Crimes Financeiros e Fiscais", "Crimes Financeiros"),
            ("DCCORG", "Direção de Combate ao Crime Organizado", "Crime Organizado"),
            ("DCOP", "Direção de Central de Operações", "Central Operações"),
            ("DCN", "Direção de Combate ao Narcotráfico", "Narcotráfico"),
            (
                "DCTPMCCA",
                "Direção de Combate ao Tráfico de Pedras, Metais e Crime Contra o Ambiente",
                "Tráfico Ambiente",
            ),
            (
                "DCCCESP",
                "Direção de Combate ao Crime Contra Economia e Saúde Pública",
                "Economia Saúde",
            ),
            ("DAMCL", "Direção de Atendimento ao Menor em Conflito com a Lei", "Menor Conflito"),
            ("DCCCI", "Direção de Combate ao Crime Cibernético", "Crime Cibernético"),
            ("DCCC", "Direção de Combate ao Crime de Corrupção", "Corrupção"),
            ("DICA", "Departamento de Investigação Criminal no Aeroporto", "Inv. Aeroporto"),
            ("DICP", "Departamento de Investigação Criminal no Porto", "Inv. Porto"),
        ]
        for code, name, short_name in directions:
            unit = OrganizationalUnit(
                organization_id=org.id,
                type_id=UnitType.DIRECTION,
                code=code,
                name=name,
                short_name=short_name,
                status=UnitStatus.ACTIVE,
                is_active=True,
            )
            session.add(unit)
        session.flush()

        # Atribuir admin à Direcção de Investigação
        admin_user = session.scalar(select(User).where(User.username == "admin"))
        if admin_user is not None:
            assignment = UserAssignment(
                user_id=admin_user.id,
                organizational_unit_id=dir_inv.id,
                assignment_type=AssignmentType.PRIMARY,
                is_primary=True,
                status=AssignmentStatus.ACTIVE,
            )
            session.add(assignment)
            created["assignments"] = 1

    # Pessoas (DEV ONLY) — ligadas aos utilizadores de dev.
    person_names = {
        "admin": "Administrador do Sistema",
        "director": "Director Geral",
        "secretaria": "Secretária Geral",
        "chefe_departamento": "Chefe de Departamento",
        "chefe_seccao": "Chefe de Secção",
        "instrutor": "Instrutor Processual",
        "piquete": "Agente de Piquete",
        "editor": "Editor Documental",
        "pgr": "Agente PGR",
    }
    for username, full_name in person_names.items():
        existing = session.scalar(select(Person).where(Person.full_name == full_name))
        if existing is None:
            _last_number = session.scalar(func.max(Person.person_number))
            person = Person(
                person_number=PersonNumberGenerator.next_number(_last_number),
                full_name=full_name,
                preferred_name=full_name.split()[0],
                status=PersonStatus.ACTIVE,
                is_active=True,
                employee_number=str(
                    next(u["employee_number"] for u in DEV_USERS if u["username"] == username)
                ),
            )
            session.add(person)
            session.flush()
            created["persons"] = created.get("persons", 0) + 1
            user = session.scalar(select(User).where(User.username == username))
            if user is not None and user.person is None:
                user.person = person

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
    print(f"Organizações criadas: {created.get('organizations', 0)}")
    print(f"Atribuições criadas: {created.get('assignments', 0)}")
    print(f"Pessoas criadas: {created.get('persons', 0)}")
    print()
    print(DEV_CREDENTIALS_NOTICE)
    for user_data in DEV_USERS:
        print(f"  {user_data['username']:<20} {user_data['password']}")
    print()
    print("DEV ONLY — estas credenciais NUNCA devem existir em produção.")


if __name__ == "__main__":
    main()
