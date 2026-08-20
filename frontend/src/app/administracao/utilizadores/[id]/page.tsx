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
import { UserDetail } from "@/components/user/user-detail";
import { useAuth } from "@/hooks/use-auth";
import { useUser, useUserAudit } from "@/hooks/use-users";
import type { UserListItem } from "@/lib/users-api";
import { ArrowLeftIcon } from "lucide-react";

function UtilizadorDetalheContent() {
  const params = useParams<{ id: string }>();
  const userId = params.id;
  const router = useRouter();
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];
  const canUpdate = permissions.includes("user.update");
  const canManageProfiles = permissions.includes("profile.manage");
  const canAssign = permissions.includes("assignment.create");

  const {
    data: userData,
    isLoading,
    isError,
    refetch,
  } = useUser(userId);
  const {
    data: auditData,
    isLoading: auditLoading,
    isError: auditError,
    refetch: auditRefetch,
  } = useUserAudit({ user_id: userId, page_size: 100 });

  const [currentUser, setCurrentUser] = useState<UserListItem | null>(null);

  return (
    <PageContainer>
      <PageHeader
        title={userData?.full_name ?? currentUser?.full_name ?? "Utilizador"}
        description={userData ? `@${userData.username}` : "Detalhes da conta"}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/administracao/utilizadores")}>
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
            ) : isError || !userData ? (
              <ErrorState
                message="Não foi possível carregar o utilizador"
                onRetry={() => void refetch()}
              />
            ) : (
              <UserDetail
                user={currentUser ?? userData}
                canUpdate={canUpdate}
                canManageProfiles={canManageProfiles}
                canAssign={canAssign}
                onUserChanged={setCurrentUser}
                auditEvents={auditData?.items ?? null}
                auditLoading={auditLoading}
                auditError={auditError}
                onAuditRetry={() => void auditRefetch()}
              />
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

export default function UtilizadorDetalhePage() {
  return (
    <ProtectedRoute>
      <UtilizadorDetalheContent />
    </ProtectedRoute>
  );
}