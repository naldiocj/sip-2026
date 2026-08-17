import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { HealthStatus } from "@/components/health/health-status";

export default function Home() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Estado do sistema SIP"
      />
      <PageContent>
        <HealthStatus />
      </PageContent>
    </PageContainer>
  );
}
