"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DetidosPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Detidos" description="Registo e movimentação de detidos" />
        <PageContent>
          <p className="text-muted-foreground">Gestão de detidos — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}