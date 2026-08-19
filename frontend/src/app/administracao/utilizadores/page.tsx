"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function UtilizadoresPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Utilizadores" description="Gestão de utilizadores" />
        <PageContent>
          <p className="text-muted-foreground">Gestão de utilizadores — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}