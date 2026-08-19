"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DocumentosPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Documentos" description="Gestão de templates e documentos processuais" />
        <PageContent>
          <p className="text-muted-foreground">Motor documental — a implementar na Fase 04.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}