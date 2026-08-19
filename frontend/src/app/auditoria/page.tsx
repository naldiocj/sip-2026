"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function AuditoriaPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Auditoria" description="Registo de auditoria" />
        <PageContent>
          <p className="text-muted-foreground">Registo de auditoria — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}