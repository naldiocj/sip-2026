"use client";

import { useState } from "react";
import type { Person } from "@/lib/person-types";
import { humanizePersonStatus, humanizeEmploymentStatus } from "@/lib/humanize";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/state-components";
import {
  IdCardIcon,
  BriefcaseIcon,
  UserRoundIcon,
  KeyRoundIcon,
  BadgeCheckIcon,
  MapPinIcon,
  CalendarClockIcon,
  ShieldIcon,
  UserCheckIcon,
  HistoryIcon,
  ScrollTextIcon,
  PencilIcon,
} from "lucide-react";

interface PersonDetailProps {
  person: Person;
  canUpdate: boolean;
  onEdit?: (person: Person) => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PersonDetail({ person, canUpdate, onEdit }: PersonDetailProps) {
  const [activeTab, setActiveTab] = useState("pessoais");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{person.full_name}</h3>
              <Badge variant={person.is_active ? "default" : "secondary"} className="text-xs">
                {humanizePersonStatus(person.status)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {person.person_number}
              {person.preferred_name && ` · ${person.preferred_name}`}
            </p>
          </div>
          {canUpdate && (
            <Button variant="outline" size="sm" onClick={() => onEdit?.(person)}>
              <PencilIcon className="mr-1.5 size-3.5" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="flex-wrap">
          <TabsTrigger value="pessoais">
            <IdCardIcon className="mr-1.5 size-3.5" />
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="funcionais">
            <BriefcaseIcon className="mr-1.5 size-3.5" />
            Dados Funcionais
          </TabsTrigger>
          <TabsTrigger value="conta">
            <KeyRoundIcon className="mr-1.5 size-3.5" />
            Conta SIP
          </TabsTrigger>
          <TabsTrigger value="perfis">
            <BadgeCheckIcon className="mr-1.5 size-3.5" />
            Perfis
          </TabsTrigger>
          <TabsTrigger value="lotacao">
            <MapPinIcon className="mr-1.5 size-3.5" />
            Lotação
          </TabsTrigger>
          <TabsTrigger value="atribuicoes">
            <CalendarClockIcon className="mr-1.5 size-3.5" />
            Atribuições
          </TabsTrigger>
          <TabsTrigger value="responsabilidades">
            <ShieldIcon className="mr-1.5 size-3.5" />
            Responsabilidades
          </TabsTrigger>
          <TabsTrigger value="delegacoes">
            <UserCheckIcon className="mr-1.5 size-3.5" />
            Delegações
          </TabsTrigger>
          <TabsTrigger value="historico">
            <HistoryIcon className="mr-1.5 size-3.5" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="auditoria">
            <ScrollTextIcon className="mr-1.5 size-3.5" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pessoais" className="mt-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Nome completo" value={person.full_name} />
            <DetailRow label="Nome preferido" value={person.preferred_name ?? "—"} />
            <DetailRow label="Data de nascimento" value={formatDate(person.birth_date)} />
            <DetailRow label="Local de nascimento" value={person.birth_place ?? "—"} />
            <DetailRow label="Nacionalidade" value={person.nationality ?? "—"} />
            <DetailRow label="Género" value={person.gender ?? "—"} />
            <DetailRow label="Nº BI" value={person.bi_number ?? "—"} />
            <DetailRow label="Telefone" value={person.phone ?? "—"} />
            <DetailRow label="Email" value={person.email ?? "—"} />
            <DetailRow label="Morada" value={person.address ?? "—"} />
          </dl>
        </TabsContent>

        <TabsContent value="funcionais" className="mt-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label="Nº de funcionário" value={person.employee_number ?? "—"} />
            <DetailRow label="Categoria funcional" value={person.functional_category ?? "—"} />
            <DetailRow label="Cargo / Função" value={person.job_title ?? "—"} />
            <DetailRow
              label="Data de admissão"
              value={formatDate(person.admission_date)}
            />
            <DetailRow
              label="Estado de emprego"
              value={
                person.employment_status
                  ? humanizeEmploymentStatus(person.employment_status)
                  : "—"
              }
            />
            <DetailRow
              label="Registo profissional"
              value={person.professional_registration ?? "—"}
            />
            {person.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-xs text-muted-foreground">Observações</dt>
                <dd className="text-sm">{person.notes}</dd>
              </div>
            )}
          </dl>
        </TabsContent>

        <TabsContent value="conta" className="mt-4">
          <EmptyState
            icon={UserRoundIcon}
            title="Conta SIP"
            description="Os dados da conta SIP associada a esta pessoa serão disponibilizados numa versão futura."
          />
        </TabsContent>

        <TabsContent value="perfis" className="mt-4">
          <EmptyState
            icon={BadgeCheckIcon}
            title="Perfis"
            description="Os perfis e permissões associados a esta pessoa serão disponibilizados numa versão futura."
          />
        </TabsContent>

        <TabsContent value="lotacao" className="mt-4">
          <EmptyState
            icon={MapPinIcon}
            title="Lotação"
            description="A lotação da pessoa em unidades organizacionais será implementada em breve."
          />
        </TabsContent>

        <TabsContent value="atribuicoes" className="mt-4">
          <EmptyState
            icon={CalendarClockIcon}
            title="Atribuições"
            description="A gestão de atribuições será implementada em breve."
          />
        </TabsContent>

        <TabsContent value="responsabilidades" className="mt-4">
          <EmptyState
            icon={ShieldIcon}
            title="Responsabilidades"
            description="A gestão de responsabilidades será implementada em breve."
          />
        </TabsContent>

        <TabsContent value="delegacoes" className="mt-4">
          <EmptyState
            icon={UserCheckIcon}
            title="Delegações"
            description="A gestão de delegações será implementada em breve."
          />
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <EmptyState
            icon={HistoryIcon}
            title="Histórico"
            description="O histórico de alterações desta pessoa será disponibilizado em breve."
          />
        </TabsContent>

        <TabsContent value="auditoria" className="mt-4">
          <EmptyState
            icon={ScrollTextIcon}
            title="Auditoria"
            description="O registo de auditoria desta pessoa será disponibilizado em breve."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}