"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function RelatoriosPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Relatórios" description="Relatórios e estatísticas" />
        <PageContent>
          <p className="text-muted-foreground">Relatórios e estatísticas — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}