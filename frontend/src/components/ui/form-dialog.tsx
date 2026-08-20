"use client";

import { useState, useEffect } from "react";
import { useForm, FieldValues, SubmitHandler, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AsyncButton } from "@/components/ui/async-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface FormDialogProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: z.ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (values: T) => Promise<void> | void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  showDirtyWarning?: boolean;
  dirtyMessage?: string;
  children: React.ReactNode;
}

interface FormDialogState {
  isSubmitting: boolean;
  isDirty: boolean;
  submitError: string | null;
}

export function FormDialog<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  submitText = "Salvar",
  cancelText = "Cancelar",
  size = "md",
  isLoading = false,
  showDirtyWarning = true,
  dirtyMessage = "Existem alterações não salvas. Tem a certeza que deseja sair?",
  children,
}: FormDialogProps<T>) {
  const [state, setState] = useState<FormDialogState>({
    isSubmitting: false,
    isDirty: false,
    submitError: null,
  });

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T> | undefined,
    mode: "onChange",
  });

  const { formState } = form;

  // Track dirty state
  useEffect(() => {
    if (showDirtyWarning) {
      setState(prev => ({ ...prev, isDirty: formState.isDirty }));
    }
  }, [formState.isDirty, showDirtyWarning]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset(defaultValues as DefaultValues<T> | undefined);
      setState({
        isSubmitting: false,
        isDirty: false,
        submitError: null,
      });
    }
  }, [open, form, defaultValues]);

  // Handle unsaved changes warning on close
  const handleClose = () => {
    if (form.formState.isDirty) {
      if (window.confirm("Existem alterações não salvas. Tem a certeza que deseja sair?")) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit: SubmitHandler<T> = async (values: T) => {
    setState(prev => ({ ...prev, isSubmitting: true, submitError: null }));
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar. Tente novamente.";
      setState(prev => ({ ...prev, submitError: message }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size={size as any} stickyFooter>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {state.submitError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="size-4 flex-shrink-0" />
              <span>{state.submitError}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setState(prev => ({ ...prev, submitError: null }))}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {children}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Cancelar
            </Button>
            <AsyncButton
              type="submit"
              onClick={() => form.handleSubmit(handleSubmit)()}
              loadingText="A guardar..."
            >
              <Save className="mr-2 size-4" />
              Salvar
            </AsyncButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}