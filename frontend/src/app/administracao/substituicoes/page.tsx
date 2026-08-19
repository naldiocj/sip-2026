"use client";

import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { SubstitutionsSection } from "@/components/management/substitutions-section";

function SubstituicoesContent() {
  return (
    <PageContainer>
      <PageHeader
        title="Substituições"
        description="Exercício temporário de funções por outros utilizadores"
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            <SubstitutionsSection />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

export default function SubstituicoesPage() {
  return (
    <ProtectedRoute>
      <SubstituicoesContent />
    </ProtectedRoute>
  );
}