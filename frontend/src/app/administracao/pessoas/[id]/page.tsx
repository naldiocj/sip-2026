"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/state-components";
import { usePerson, useUpdatePerson } from "@/hooks/use-people";
import { useAuth } from "@/hooks/use-auth";
import { PersonDetail } from "@/components/person/person-detail";
import { PersonForm } from "@/components/person/person-form";
import { ArrowLeftIcon } from "lucide-react";
import { toast } from "sonner";

function PessoaDetalheContent() {
  const params = useParams<{ id: string }>();
  const personId = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canUpdate = permissions.includes("person.update");

  const { data: person, isLoading, isError, refetch } = usePerson(personId);
  const [formOpen, setFormOpen] = useState(false);
  const updateMutation = useUpdatePerson(personId);

  return (
    <PageContainer>
      <PageHeader
        title={person?.full_name ?? "Pessoa"}
        description={person ? `Nº ${person.person_number}` : "Detalhes da pessoa"}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/administracao/pessoas")}>
            <ArrowLeftIcon className="mr-1.5 size-3.5" />
            Voltar
          </Button>
        }
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <LoadingState rows={4} />
            ) : isError || !person ? (
              <ErrorState onRetry={() => refetch()} />
            ) : (
              <PersonDetail
                person={person}
                canUpdate={canUpdate}
                onEdit={() => setFormOpen(true)}
              />
            )}
          </CardContent>
        </Card>
        {person && (
          <PersonForm
            open={formOpen}
            editingPerson={person}
            onClose={() => setFormOpen(false)}
            onCreated={() => undefined}
            onUpdated={() => {
              toast.success("Pessoa atualizada com sucesso");
              refetch();
            }}
            createFn={async () => person}
            updateFn={(_id, data) => updateMutation.mutateAsync(data)}
          />
        )}
      </PageContent>
    </PageContainer>
  );
}

export default function PessoaDetalhePage() {
  return (
    <ProtectedRoute>
      <PessoaDetalheContent />
    </ProtectedRoute>
  );
}