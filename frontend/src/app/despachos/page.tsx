"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DespachosPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Despachos" description="Gestão de despachos e prazos" />
        <PageContent>
          <p className="text-muted-foreground">Gestão de despachos — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}