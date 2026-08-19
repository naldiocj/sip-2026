"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PesquisaPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Pesquisa" description="Pesquisa global de processos e documentos" />
        <PageContent>
          <p className="text-muted-foreground">Motor de pesquisa — a implementar na Fase 13.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}