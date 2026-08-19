"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function NovoProcessoPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Novo Processo" description="Criar um novo processo instrutório" />
        <PageContent>
          <p className="text-muted-foreground">Formulário de novo processo — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}