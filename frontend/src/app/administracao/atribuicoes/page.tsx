"use client";

import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state-components";
import { CalendarClockIcon } from "lucide-react";

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
            <EmptyState
              icon={CalendarClockIcon}
              title="Gestão de atribuições"
              description="A gestão de atribuições de utilizadores a unidades será implementada em breve."
            />
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