"use client";

import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { HealthStatus } from "@/components/health/health-status";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={user ? `Bem-vindo, ${user.full_name}` : "Estado do sistema SIP"}
      />
      <PageContent>
        <HealthStatus />
      </PageContent>
    </PageContainer>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
