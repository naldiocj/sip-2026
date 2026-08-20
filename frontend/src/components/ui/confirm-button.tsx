"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> {
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
  children: React.ReactNode;
}

export function ConfirmButton({
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  children,
  className,
  ...props
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    setOpen(false);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirm action failed:", error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
        {...props}
      >
        {children}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <AlertTriangle className="mb-2 size-5 text-destructive" aria-hidden="true" />
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button variant={variant === "destructive" ? "destructive" : "default"} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}