"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProcessosPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Processos" description="Gestão de processos instrutórios" />
        <PageContent>
          <p className="text-muted-foreground">Gestão de processos — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}