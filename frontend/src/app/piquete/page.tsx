"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PiquetePage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Piquete" description="Gestão de piquete e operações" />
        <PageContent>
          <p className="text-muted-foreground">Gestão de piquete — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}