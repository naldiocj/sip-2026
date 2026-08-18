"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { OrganizationalUnit, UnitCreate, UnitUpdate } from "@/lib/organization-types";
import { getUnitTypeMetadata } from "@/lib/organization-metadata";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const unitFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  short_name: z.string().max(100).optional().or(z.literal("")),
  code: z.string().max(50).optional().or(z.literal("")),
  type_id: z.string().min(1, "Tipo é obrigatório"),
  parent_id: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

type UnitFormValues = z.infer<typeof unitFormSchema>;

interface UnitFormProps {
  organizationId: string;
  units: OrganizationalUnit[];
  editingUnit?: OrganizationalUnit | null;
  defaultParentId?: string | null;
  open: boolean;
  onClose: () => void;
  onCreated: (unit: OrganizationalUnit) => void;
  onUpdated?: (unit: OrganizationalUnit) => void;
  createFn: (data: UnitCreate) => Promise<OrganizationalUnit>;
  updateFn?: (unitId: string, data: UnitUpdate) => Promise<OrganizationalUnit>;
}

function UnitFormContent({
  organizationId,
  units,
  editingUnit,
  defaultParentId,
  onClose,
  onCreated,
  onUpdated,
  createFn,
  updateFn,
}: Omit<UnitFormProps, "open">) {
  const isEditing = !!editingUnit;
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      name: editingUnit?.name ?? "",
      short_name: editingUnit?.short_name ?? "",
      code: editingUnit?.code ?? "",
      type_id: editingUnit?.type_id ?? "",
      parent_id: editingUnit?.parent_id ?? defaultParentId ?? "",
      description: editingUnit?.description ?? "",
    },
  });

  const typeId = watch("type_id");
  const parentId = watch("parent_id");
  const name = watch("name");

  useEffect(() => {
    if (defaultParentId) {
      setValue("parent_id", defaultParentId);
    }
  }, [defaultParentId, setValue]);

  const onSubmit = async (values: UnitFormValues) => {
    try {
      if (isEditing && updateFn) {
        const updated = await updateFn(editingUnit.id, {
          name: values.name,
          code: values.code || undefined,
          short_name: values.short_name || undefined,
          description: values.description || undefined,
          parent_id: values.parent_id || undefined,
        });
        onUpdated?.(updated);
      } else {
        const created = await createFn({
          organization_id: organizationId,
          type_id: values.type_id,
          name: values.name,
          code: values.code || undefined,
          parent_id: values.parent_id || undefined,
          short_name: values.short_name || undefined,
          description: values.description || undefined,
        });
        onCreated(created);
      }
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  const selectedTypeMeta = typeId ? getUnitTypeMetadata(typeId) : null;
  const parentUnit = parentId ? units.find((u) => u.id === parentId) : null;

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Identificação</h4>
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ex: Direcção de Investigação"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="short_name">Nome curto</Label>
            <Input
              id="short_name"
              {...register("short_name")}
              placeholder="Ex: DIR-INV"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Sigla / Código</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="Ex: DIR-001"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tipo *</Label>
          <Select
            value={typeId}
            onValueChange={(v) => setValue("type_id", v ?? "")}
            disabled={isEditing}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              {["DIRECTION", "DEPARTMENT", "SECTION", "UNIT", "PIQUETE", "OTHER"].map(
                (t) => {
                  const meta = getUnitTypeMetadata(t);
                  return (
                    <SelectItem key={t} value={t}>
                      {meta.label}
                    </SelectItem>
                  );
                },
              )}
            </SelectContent>
          </Select>
          {errors.type_id && (
            <p className="text-xs text-destructive">{errors.type_id.message}</p>
          )}
          {selectedTypeMeta && (
            <p className="text-xs text-muted-foreground">
              {selectedTypeMeta.description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Estrutura</h4>
        <div className="space-y-2">
          <Label>Unidade superior</Label>
          <Select
            value={parentId}
            onValueChange={(v) => setValue("parent_id", v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Nenhuma (nível superior)" />
            </SelectTrigger>
            <SelectContent>
              {units
                .filter((u) => u.is_active && u.id !== editingUnit?.id)
                .map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Configuração</h4>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrição da unidade organizacional"
            rows={3}
          />
        </div>
      </div>

      {(name || parentUnit) && (
        <div className="rounded-md border bg-muted/30 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Pré-visualização</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">SIC</span>
            {parentUnit && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{parentUnit.name}</span>
              </>
            )}
            {name && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">{name}</span>
              </>
            )}
          </div>
        </div>
      )}

      <DialogFooter className={isMobile ? "flex flex-col gap-2" : undefined}>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? "A guardar..."
              : "A criar..."
            : isEditing
              ? "Guardar"
              : "Criar Unidade"}
        </Button>
      </DialogFooter>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? "Editar Unidade" : "Nova Unidade Organizacional"}
            </SheetTitle>
          </SheetHeader>
          <div className="px-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Unidade" : "Nova Unidade Organizacional"}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

export function UnitForm(props: UnitFormProps) {
  if (!props.open) return null;
  return <UnitFormContent {...props} />;
}
