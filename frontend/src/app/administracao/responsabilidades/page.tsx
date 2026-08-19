"use client";

import {
  PageContainer,
  PageHeader,
  PageContent,
} from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsibilitiesSection } from "@/components/management/responsibilities-section";

function ResponsabilidadesContent() {
  return (
    <PageContainer>
      <PageHeader
        title="Responsabilidades"
        description="Âmbitos de responsabilidade por utilizador"
      />
      <PageContent>
        <Card>
          <CardContent className="p-4">
            <ResponsibilitiesSection />
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