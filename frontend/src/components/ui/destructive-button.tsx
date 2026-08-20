"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";

interface DestructiveButtonProps extends Omit<ButtonProps, "variant" | "onClick" | "children"> {
  onClick?: () => Promise<void> | void;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

export function DestructiveButton({
  onClick,
  confirmTitle = "Confirmar ação destrutiva",
  confirmDescription = "Esta ação não pode ser desfeita. Tem a certeza que deseja continuar?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  children,
  className,
  ...props
}: DestructiveButtonProps) {
  if (onClick) {
    const confirmVariant = "destructive";
    return (
      <ConfirmButton
        onConfirm={onClick}
        title={confirmTitle}
        description={confirmDescription}
        confirmText={confirmText}
        cancelText={cancelText}
        variant={confirmVariant} // @ts-expect-error - TypeScript incorrectly infers ButtonPrimitive variant type for ConfirmButton
        className={className}
      >
        {children}
      </ConfirmButton>
    );
  }

  // Extract only the props that Button accepts, excluding variant
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _variant, ...buttonProps } = props as Record<string, unknown>;
  return <Button variant="destructive" className={className} {...(buttonProps as ButtonProps)}>{children}</Button>;
}