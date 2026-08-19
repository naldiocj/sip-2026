"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function OcorrenciasPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Ocorrências" description="Registo e acompanhamento de ocorrências" />
        <PageContent>
          <p className="text-muted-foreground">Gestão de ocorrências — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}