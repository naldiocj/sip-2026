"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function MandadosPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Mandados" description="Emissão e acompanhamento de mandados" />
        <PageContent>
          <p className="text-muted-foreground">Gestão de mandados — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}