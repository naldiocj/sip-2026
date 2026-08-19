"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Templates" description="Templates de documentos" />
        <PageContent>
          <p className="text-muted-foreground">Templates de documentos — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}