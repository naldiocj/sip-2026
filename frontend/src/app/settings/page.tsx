"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader title="Definições" description="Configuração do sistema" />
        <PageContent>
          <p className="text-muted-foreground">Definições — a implementar conforme necessário.</p>
        </PageContent>
      </PageContainer>
    </ProtectedRoute>
  );
}
