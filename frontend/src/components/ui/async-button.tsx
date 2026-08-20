"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface AsyncButtonProps extends Omit<ButtonProps, "onClick" | "disabled"> {
  onClick: () => Promise<void> | void;
  loadingText?: string;
  disabled?: boolean;
}

export function AsyncButton({
  onClick,
  loadingText = "A processar...",
  disabled = false,
  children,
  className,
  ...props
}: AsyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}