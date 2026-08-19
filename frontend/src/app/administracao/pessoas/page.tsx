"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-components";
import { usePeople } from "@/hooks/use-people";
import { useAuth } from "@/hooks/use-auth";
import { UserPlusIcon, UsersIcon } from "lucide-react";
import { PersonDataTable } from "@/components/person/person-data-table";
import { PersonForm } from "@/components/person/person-form";
import { useCreatePerson } from "@/hooks/use-people";
import { toast } from "sonner";

function PessoasContent() {
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes("person.create");
  const canUpdate = permissions.includes("person.update");

  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading, isError, refetch } = usePeople({
    page_size: 50,
  });

  const createMutation = useCreatePerson();

  const handleCreated = (person: unknown) => {
    toast.success("Pessoa criada com sucesso");
    router.push(`/administracao/pessoas/${(person as { id: string }).id}`);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Pessoas"
        description="Gestão de pessoas e dados funcionais"
        actions={
          canCreate ? (
            <Button
              onClick={() => setFormOpen(true)}
              data-testid="nova-pessoa"
            >
              <UserPlusIcon className="mr-2 size-4" />
              Nova Pessoa
            </Button>
          ) : undefined
        }
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <LoadingState rows={5} />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : (data?.items.length ?? 0) === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="Sem pessoas"
                description="Ainda não existem pessoas registadas. Crie a primeira pessoa para começar."
                action={
                  canCreate
                    ? {
                        label: "Criar Pessoa",
                        onClick: () => setFormOpen(true),
                      }
                    : undefined
                }
              />
            ) : (
              <PersonDataTable
                persons={data?.items ?? []}
                onSelectPerson={(person) =>
                  router.push(`/administracao/pessoas/${person.id}`)
                }
                onEditPerson={canUpdate ? (person) => router.push(`/administracao/pessoas/${person.id}`) : undefined}
                canManage={canUpdate}
              />
            )}
          </CardContent>
        </Card>
        <PersonForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onCreated={handleCreated}
          createFn={(data) => createMutation.mutateAsync(data)}
        />
      </PageContent>
    </PageContainer>
  );
}

export default function PessoasPage() {
  return (
    <ProtectedRoute>
      <PessoasContent />
    </ProtectedRoute>
  );
}