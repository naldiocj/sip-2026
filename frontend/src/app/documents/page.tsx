import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";

export default function DocumentsPage() {
  return (
    <PageContainer>
      <PageHeader title="Documentos" description="Gestão de templates e documentos processuais" />
      <PageContent>
        <p className="text-muted-foreground">Motor documental — a implementar na Fase 04.</p>
      </PageContent>
    </PageContainer>
  );
}
