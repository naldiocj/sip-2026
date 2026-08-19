"use client";

import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-components";
import { UserCheckIcon } from "lucide-react";

function DelegacoesContent() {
  return (
    <PageContainer>
      <PageHeader
        title="Delegações"
        description="Delegações de competência entre utilizadores"
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            <EmptyState
              icon={UserCheckIcon}
              title="Gestão de delegações"
              description="A gestão de delegações de competência será implementada em breve."
            />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

export default function DelegacoesPage() {
  return (
    <ProtectedRoute>
      <DelegacoesContent />
    </ProtectedRoute>
  );
}