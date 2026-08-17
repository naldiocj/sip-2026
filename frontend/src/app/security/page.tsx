"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function SecurityPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Segurança" description="Autenticação e autorização" />
        <PageContent>
          <p className="text-muted-foreground">Identidade e acesso — a implementar na Fase 01.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}
