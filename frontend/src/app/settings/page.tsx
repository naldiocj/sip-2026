import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader title="Definições" description="Configuração do sistema" />
      <PageContent>
        <p className="text-muted-foreground">Definições — a implementar conforme necessário.</p>
      </PageContent>
    </PageContainer>
  );
}
