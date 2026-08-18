import {
  Building,
  Landmark,
  Building2,
  LayoutList,
  Box,
  MapPin,
  Folder,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Clock,
  type LucideIcon,
} from "lucide-react";

export interface UnitTypeMetadata {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  color: string;
}

const UNIT_TYPE_META: Record<string, UnitTypeMetadata> = {
  ORGANIZATION: {
    value: "ORGANIZATION",
    label: "Organização",
    description: "Entidade institucional principal.",
    icon: Building,
    badgeVariant: "default",
    color: "text-blue-600",
  },
  DIRECTION: {
    value: "DIRECTION",
    label: "Direcção",
    description: "Unidade de topo responsável por uma área de atuação.",
    icon: Landmark,
    badgeVariant: "default",
    color: "text-indigo-600",
  },
  DEPARTMENT: {
    value: "DEPARTMENT",
    label: "Departamento",
    description: "Divisão dentro de uma direção.",
    icon: Building2,
    badgeVariant: "secondary",
    color: "text-violet-600",
  },
  SECTION: {
    value: "SECTION",
    label: "Secção",
    description: "Subdivisão dentro de um departamento.",
    icon: LayoutList,
    badgeVariant: "secondary",
    color: "text-purple-600",
  },
  UNIT: {
    value: "UNIT",
    label: "Unidade",
    description: "Unidade funcional de menor dimensão.",
    icon: Box,
    badgeVariant: "outline",
    color: "text-teal-600",
  },
  PIQUETE: {
    value: "PIQUETE",
    label: "Piquete",
    description: "Unidade operacional de piquete.",
    icon: MapPin,
    badgeVariant: "destructive",
    color: "text-red-600",
  },
  OTHER: {
    value: "OTHER",
    label: "Outra Unidade",
    description: "Outra classificação não categorizada.",
    icon: Folder,
    badgeVariant: "outline",
    color: "text-gray-600",
  },
};

export interface AssignmentTypeMetadata {
  value: string;
  label: string;
  description: string;
  color: string;
}

const ASSIGNMENT_TYPE_META: Record<string, AssignmentTypeMetadata> = {
  PRIMARY: {
    value: "PRIMARY",
    label: "Principal",
    description: "Atribuição principal do utilizador.",
    color: "text-blue-600",
  },
  SECONDARY: {
    value: "SECONDARY",
    label: "Secundária",
    description: "Atribuição secundária.",
    color: "text-gray-600",
  },
  TEMPORARY: {
    value: "TEMPORARY",
    label: "Temporária",
    description: "Atribuição temporária.",
    color: "text-amber-600",
  },
  ACTING: {
    value: "ACTING",
    label: "Interino",
    description: "Exercício interino de funções.",
    color: "text-orange-600",
  },
  DELEGATED: {
    value: "DELEGATED",
    label: "Delegada",
    description: "Funções delegadas.",
    color: "text-cyan-600",
  },
};

export interface StatusMetadata {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
}

const STATUS_META: Record<string, StatusMetadata> = {
  ACTIVE: {
    value: "ACTIVE",
    label: "Ativo",
    icon: ShieldCheck,
    color: "text-green-600",
    badgeVariant: "default",
  },
  INACTIVE: {
    value: "INACTIVE",
    label: "Inativo",
    icon: ShieldOff,
    color: "text-gray-500",
    badgeVariant: "secondary",
  },
  BLOCKED: {
    value: "BLOCKED",
    label: "Bloqueado",
    icon: ShieldAlert,
    color: "text-red-600",
    badgeVariant: "destructive",
  },
  PENDING: {
    value: "PENDING",
    label: "Pendente",
    icon: Clock,
    color: "text-amber-600",
    badgeVariant: "outline",
  },
};

export function getUnitTypeMetadata(typeId: string): UnitTypeMetadata {
  return (
    UNIT_TYPE_META[typeId] ?? {
      value: typeId,
      label: titleCase(typeId),
      description: "",
      icon: Shield,
      badgeVariant: "outline" as const,
      color: "text-gray-600",
    }
  );
}

export function getAssignmentTypeMetadata(typeId: string): AssignmentTypeMetadata {
  return (
    ASSIGNMENT_TYPE_META[typeId] ?? {
      value: typeId,
      label: titleCase(typeId),
      description: "",
      color: "text-gray-600",
    }
  );
}

export function getStatusMetadata(status: string): StatusMetadata {
  return (
    STATUS_META[status] ?? {
      value: status,
      label: titleCase(status),
      icon: Shield,
      color: "text-gray-600",
      badgeVariant: "outline" as const,
    }
  );
}

export function titleCase(value: string): string {
  return value
    .split(/[_.-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
