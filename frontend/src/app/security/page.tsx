import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";

export default function SecurityPage() {
  return (
    <PageContainer>
      <PageHeader title="Segurança" description="Autenticação e autorização" />
      <PageContent>
        <p className="text-muted-foreground">Identidade e acesso — a implementar na Fase 01.</p>
      </PageContent>
    </PageContainer>
  );
}
