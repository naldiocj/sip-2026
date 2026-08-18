"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Utilizador é obrigatório"),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps extends Omit<React.ComponentProps<"form">, "onSubmit"> {
  onSubmit?: (data: LoginFormData) => Promise<void>;
  error?: string | null;
  isSubmitting?: boolean;
}

export function LoginForm({
  className,
  onSubmit,
  error,
  isSubmitting = false,
  ...props
}: LoginFormProps) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function handleSubmit(data: LoginFormData) {
    await onSubmit?.(data);
  }

  const usernameError = form.formState.errors.username?.message;
  const passwordError = form.formState.errors.password?.message;

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(handleSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Entrar no SIP</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Insira as suas credenciais para aceder ao sistema
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Field>
          <FieldLabel htmlFor="username">Utilizador</FieldLabel>
          <Input
            id="username"
            type="text"
            placeholder="Nome de utilizador"
            autoComplete="username"
            disabled={isSubmitting}
            {...form.register("username")}
          />
          {usernameError && (
            <p className="text-sm text-destructive">{usernameError}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Palavra-passe</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Palavra-passe"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...form.register("password")}
          />
          {passwordError && (
            <p className="text-sm text-destructive">{passwordError}</p>
          )}
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A entrar...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </Field>

        <FieldDescription className="text-center text-xs">
          Sistema de Instrução Processual
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
