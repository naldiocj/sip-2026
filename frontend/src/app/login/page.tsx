"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, FileText, Users, Lock } from "lucide-react";

const features = [
  { icon: FileText, text: "Gestão documental inteligente" },
  { icon: Lock, text: "Segurança e auditoria completa" },
  { icon: Users, text: "Controlo de acesso por perfis" },
] as const;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  async function handleSubmit(data: { username: string; password: string }) {
    setError(null);
    setIsSubmitting(true);

    try {
      await login(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Credenciais inválidas. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Branding — lado esquerdo */}
      <div className="relative hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-16">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Shield className="size-7" />
            </div>
            <span className="text-4xl font-bold tracking-tight">SIP</span>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              Sistema de Instrução Processual
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Plataforma integrada de gestão processual, documental e de segurança para organizações
              modernas.
            </p>
          </div>

          <Separator className="w-16" />

          <ul className="flex flex-col gap-4 text-left" role="list">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <span className="text-muted-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form — lado direito */}
      <div className="flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="size-5" />
            </div>
            <span className="text-xl font-bold">SIP</span>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardContent>
              <LoginForm onSubmit={handleSubmit} error={error} isSubmitting={isSubmitting} />
            </CardContent>
            <CardFooter className="flex justify-center border-t py-4">
              <p className="text-xs text-muted-foreground">
                <Link
                  href="/forgot-password"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Esqueceu a palavra-passe?
                </Link>
              </p>
            </CardFooter>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Sistema de Instrução Processual
          </p>
        </div>
      </div>
    </div>
  );
}
