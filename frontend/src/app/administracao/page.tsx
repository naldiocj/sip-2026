"use client";

import Link from "next/link";
import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { humanizePermission } from "@/lib/humanize";
import {
  UserPlusIcon,
  LandmarkIcon,
  CalendarClockIcon,
  ShieldIcon,
  UserCheckIcon,
  UsersIcon,
  ArrowRightIcon,
} from "lucide-react";

const ADMIN_SECTIONS = [
  {
    id: "pessoas",
    label: "Pessoas",
    description: "Gestão de pessoas e dados funcionais",
    route: "/administracao/pessoas",
    icon: UserPlusIcon,
    permission: "person.read",
  },
  {
    id: "organizacao",
    label: "Organização",
    description: "Estrutura organizacional e unidades",
    route: "/administracao/organizacao",
    icon: LandmarkIcon,
    permission: "organization.read",
  },
  {
    id: "atribuicoes",
    label: "Atribuições",
    description: "Lotação de utilizadores em unidades",
    route: "/administracao/atribuicoes",
    icon: CalendarClockIcon,
    permission: "assignment.read",
  },
  {
    id: "responsabilidades",
    label: "Responsabilidades",
    description: "Funções e âmbitos de responsabilidade",
    route: "/administracao/responsabilidades",
    icon: ShieldIcon,
    permission: "responsibility.read",
  },
  {
    id: "delegacoes",
    label: "Delegações",
    description: "Delegações de competência entre utilizadores",
    route: "/administracao/delegacoes",
    icon: UserCheckIcon,
    permission: "delegation.read",
  },
  {
    id: "utilizadores",
    label: "Utilizadores",
    description: "Gestão de contas e perfis",
    route: "/administracao/utilizadores",
    icon: UsersIcon,
    permission: "user.read",
  },
] as const;

function AdministracaoContent() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  const visibleSections = ADMIN_SECTIONS.filter((section) =>
    permissions.includes(section.permission),
  );

  return (
    <PageContainer>
      <PageHeader
        title="Administração"
        description="Gestão administrativa, organizacional e funcional do SIP"
      />
      <PageContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleSections.map((section) => (
            <Link key={section.id} href={section.route} className="group">
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <section.icon className="size-6 text-muted-foreground" />
                    <ArrowRightIcon className="size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="text-base">{section.label}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {humanizePermission(section.permission)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </PageContent>
    </PageContainer>
  );
}

export default function AdministracaoPage() {
  return (
    <ProtectedRoute>
      <AdministracaoContent />
    </ProtectedRoute>
  );
}