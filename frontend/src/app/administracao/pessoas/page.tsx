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
import { Input } from "@/components/ui/input";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-components";
import { usePeople } from "@/hooks/use-people";
import { useAuth } from "@/hooks/use-auth";
import { humanizePersonStatus } from "@/lib/humanize";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlusIcon, SearchIcon, UsersIcon } from "lucide-react";

function PessoasContent() {
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canCreate = permissions.includes("person.create");
  const canUpdate = permissions.includes("person.update");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const { data, isLoading, isError, refetch } = usePeople({
    search: query || undefined,
    page_size: 50,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Pessoas"
        description="Gestão de pessoas e dados funcionais"
        actions={
          canCreate ? (
            <Button onClick={() => router.push("/administracao/pessoas/novo")}>
              <UserPlusIcon className="mr-2 size-4" />
              Nova Pessoa
            </Button>
          ) : undefined
        }
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            <form
              className="mb-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setQuery(search.trim());
              }}
            >
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por nome ou número"
                aria-label="Pesquisar pessoas"
                className="max-w-sm"
              />
              <Button type="submit" variant="outline" aria-label="Aplicar pesquisa">
                <SearchIcon className="size-4" />
              </Button>
            </form>

            {isLoading ? (
              <LoadingState rows={5} />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : (data?.items.length ?? 0) === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="Sem pessoas"
                description="Não foram encontradas pessoas com os filtros aplicados."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Nome Preferido</TableHead>
                    <TableHead>Categoria Funcional</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.items ?? []).map((person) => (
                    <TableRow
                      key={person.id}
                      className={canUpdate ? "cursor-pointer" : undefined}
                      onClick={
                        canUpdate
                          ? () => router.push(`/administracao/pessoas/${person.id}`)
                          : undefined
                      }
                    >
                      <TableCell className="font-mono text-xs">
                        {person.person_number}
                      </TableCell>
                      <TableCell className="font-medium">{person.full_name}</TableCell>
                      <TableCell>{person.preferred_name ?? "—"}</TableCell>
                      <TableCell>{person.functional_category ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={person.is_active ? "default" : "secondary"}>
                          {humanizePersonStatus(person.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
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