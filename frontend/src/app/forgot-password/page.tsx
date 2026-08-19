"use client";

import Link from "next/link";
import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Recuperar palavra-passe"
        description="Instruções para recuperação de palavra-passe"
      />
      <PageContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Funcionalidade de recuperação de palavra-passe — a implementar.
          </p>
          <Link href="/login" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeftIcon className="mr-2 size-4" />
            Voltar ao login
          </Link>
        </div>
      </PageContent>
    </PageContainer>
  );
}