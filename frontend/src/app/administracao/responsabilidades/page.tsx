"use client";

import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-components";
import { ShieldIcon } from "lucide-react";

function ResponsabilidadesContent() {
  return (
    <PageContainer>
      <PageHeader
        title="Responsabilidades"
        description="Funções e âmbitos de responsabilidade dos utilizadores"
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            <EmptyState
              icon={ShieldIcon}
              title="Gestão de responsabilidades"
              description="A gestão de responsabilidades será implementada em breve."
            />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

export default function ResponsabilidadesPage() {
  return (
    <ProtectedRoute>
      <ResponsabilidadesContent />
    </ProtectedRoute>
  );
}