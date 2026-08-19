"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function NotificacoesPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Notificações" description="Centro de notificações" />
        <PageContent>
          <p className="text-muted-foreground">Centro de notificações — a implementar conforme roadmap.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}