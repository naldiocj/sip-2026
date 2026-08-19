"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PgrPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="PGR" description="Procuradoria Geral da República" />
        <PageContent>
          <p className="text-muted-foreground">Módulo PGR — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}