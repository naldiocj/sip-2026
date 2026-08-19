"use client";

import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { AssignmentsSection } from "@/components/management/assignments-section";

function AtribuicoesContent() {
  return (
    <PageContainer>
      <PageHeader
        title="Atribuições"
        description="Lotação de utilizadores em unidades organizacionais"
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            <AssignmentsSection />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

export default function AtribuicoesPage() {
  return (
    <ProtectedRoute>
      <AtribuicoesContent />
    </ProtectedRoute>
  );
}