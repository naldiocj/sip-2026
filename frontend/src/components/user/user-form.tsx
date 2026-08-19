"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { UserCreate, UserListItem } from "@/lib/users-api";
import { humanizeAssignmentType, humanizeUnitType } from "@/lib/humanize";
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
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOrganizations, useUnitsByParent } from "@/hooks/use-organization";
import { useProfiles } from "@/hooks/use-users";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import type { OrganizationalUnit } from "@/lib/organization-types";

const userFormSchema = z.object({
  username: z
    .string()
    .min(3, "Utilizador deve ter pelo menos 3 caracteres")
    .max(50)
    .regex(/^[a-z0-9_.-]+$/, "Apenas minúsculas, números, ponto, traço e sublinhado"),
  full_name: z.string().min(1, "Nome completo é obrigatório").max(255),
  email: z.string().email("Email inválido"),
  employee_number: z.string().max(50).optional().or(z.literal("")),
  password: z.string().min(8, "Password deve ter pelo menos 8 caracteres").optional().or(z.literal("")),
  status: z.string().max(30),
  profile_ids: z.array(z.string()),
  is_primary: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  editingUser?: UserListItem | null;
  onCreate: (data: UserCreate) => Promise<UserListItem>;
  onUpdate?: (userId: string, data: { full_name?: string; email?: string; employee_number?: string | null }) => Promise<UserListItem>;
  onCreateAssignment?: (userId: string, unitId: string, isPrimary: boolean) => Promise<unknown>;
}

interface UnitLevel {
  key: string;
  label: string;
  typeId?: string;
}

const UNIT_LEVELS: UnitLevel[] = [
  { key: "direction", label: "Direcção", typeId: "DIRECTION" },
  { key: "department", label: "Departamento", typeId: "DEPARTMENT" },
  { key: "section", label: "Secção", typeId: "SECTION" },
  { key: "unit", label: "Unidade", typeId: "UNIT" },
];

function UnitCombobox({
  value,
  onChange,
  options,
  placeholder,
  loading,
  hasError,
  onRetry,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  options: OrganizationalUnit[];
  placeholder: string;
  loading: boolean;
  hasError: boolean;
  onRetry: () => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((unit) => unit.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={loading}
          >
            {loading ? "A carregar..." : selected ? selected.name : placeholder}
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[--trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            {hasError ? (
              <div className="flex flex-col items-center gap-2 p-4 text-center">
                <p className="text-xs text-destructive">Não foi possível carregar as unidades.</p>
                <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {value ? "Sem unidades disponíveis neste nível" : "Selecione primeiro o nível superior"}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((unit) => (
                    <CommandItem
                      key={unit.id}
                      value={unit.name}
                      onSelect={() => {
                        onChange(unit.id);
                        setOpen(false);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 size-4",
                          value === unit.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{unit.name}</span>
                      {unit.code && (
                        <span className="ml-2 text-xs text-muted-foreground">{unit.code}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function UserFormContent({
  onClose,
  editingUser,
  onCreate,
  onUpdate,
  onCreateAssignment,
}: Omit<UserFormProps, "open">) {
  const isEditing = !!editingUser;
  const isMobile = useIsMobile();
  const { data: organizations } = useOrganizations();
  const { data: profilesData } = useProfiles();
  const organizationId = organizations?.[0]?.id ?? null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: editingUser?.username ?? "",
      full_name: editingUser?.full_name ?? "",
      email: editingUser?.email ?? "",
      employee_number: editingUser?.employee_number ?? "",
      password: "",
      status: editingUser?.status ?? "PENDING",
      profile_ids: editingUser?.profiles.map((p) => p.id) ?? [],
      is_primary: true,
    },
  });

  const profileIds = watch("profile_ids") ?? [];
  const isPrimary = watch("is_primary") ?? false;
  const status = watch("status") ?? "PENDING";

  const [directionId, setDirectionId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [unitId, setUnitId] = useState<string | null>(null);

  const directionsQuery = useUnitsByParent(organizationId, null, "DIRECTION");
  const departmentsQuery = useUnitsByParent(organizationId, directionId, "DEPARTMENT");
  const sectionsQuery = useUnitsByParent(organizationId, departmentId, "SECTION");
  const unitsQuery = useUnitsByParent(organizationId, sectionId, "UNIT");

  useEffect(() => {
    if (isEditing) return;
    if (!unitId && sectionsQuery.data?.length === 0 && sectionId) {
      setUnitId(sectionId);
    }
  }, [sectionsQuery.data, sectionId, unitId, isEditing]);

  const selectedPath = useMemo(() => {
    const nodes: Array<{ type: string; name: string }> = [];
    const direction = directionsQuery.data?.find((u) => u.id === directionId);
    const department = departmentsQuery.data?.find((u) => u.id === departmentId);
    const section = sectionsQuery.data?.find((u) => u.id === sectionId);
    const unit = unitsQuery.data?.find((u) => u.id === unitId);
    if (direction) nodes.push({ type: "DIRECTION", name: direction.name });
    if (department) nodes.push({ type: "DEPARTMENT", name: department.name });
    if (section) nodes.push({ type: "SECTION", name: section.name });
    if (unit) nodes.push({ type: "UNIT", name: unit.name });
    return nodes;
  }, [
    directionId,
    departmentId,
    sectionId,
    unitId,
    directionsQuery.data,
    departmentsQuery.data,
    sectionsQuery.data,
    unitsQuery.data,
  ]);

  const targetUnitId = unitId ?? sectionId ?? departmentId ?? directionId;

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing && editingUser && onUpdate) {
        await onUpdate(editingUser.id, {
          full_name: values.full_name,
          email: values.email,
          employee_number: values.employee_number || null,
        });
      } else {
        const created = await onCreate({
          username: values.username,
          full_name: values.full_name,
          email: values.email,
          employee_number: values.employee_number || undefined,
          password: values.password || undefined,
          status: values.status,
          profile_ids: values.profile_ids,
        });
        if (targetUnitId && onCreateAssignment) {
          await onCreateAssignment(created.id, targetUnitId, values.is_primary);
        }
      }
      onClose();
    } catch {
      // erro tratado pelas mutações do chamador
    }
  };

  const formContent = (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Dados da Conta</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username">Utilizador *</Label>
            <Input id="username" {...register("username")} disabled={isEditing} placeholder="Ex: jose.lopes" />
            {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee_number">Nº de funcionário</Label>
            <Input id="employee_number" {...register("employee_number")} placeholder="Ex: F-1001" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="full_name">Nome completo *</Label>
            <Input id="full_name" {...register("full_name")} placeholder="Ex: José Lopes" />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="Ex: jose.lopes@exemplo.gov" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          {!isEditing && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" {...register("password")} placeholder="Mínimo 8 caracteres" />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Perfil</h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(profilesData?.items ?? []).map((profile) => {
            const checked = profileIds.includes(profile.id);
            return (
              <label
                key={profile.id}
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm transition-colors",
                  checked ? "border-primary/40 bg-primary/5" : "hover:bg-muted/50",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? profileIds.filter((id) => id !== profile.id)
                      : [...profileIds, profile.id];
                    setValue("profile_ids", next);
                  }}
                  className="mt-0.5 size-4 accent-primary"
                  aria-label={profile.label}
                />
                <span className="font-medium">{profile.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {!isEditing && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Contexto Organizacional</h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Direcção</Label>
              <UnitCombobox
                value={directionId}
                onChange={(value) => {
                  setDirectionId(value);
                  setDepartmentId(null);
                  setSectionId(null);
                  setUnitId(null);
                }}
                options={directionsQuery.data ?? []}
                placeholder="Selecionar direcção"
                loading={directionsQuery.isLoading}
                hasError={directionsQuery.isError}
                onRetry={() => void directionsQuery.refetch()}
              />
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <UnitCombobox
                value={departmentId}
                onChange={(value) => {
                  setDepartmentId(value);
                  setSectionId(null);
                  setUnitId(null);
                }}
                options={departmentsQuery.data ?? []}
                placeholder="Selecionar departamento"
                loading={departmentsQuery.isLoading}
                hasError={departmentsQuery.isError}
                onRetry={() => void departmentsQuery.refetch()}
              />
            </div>
            <div className="space-y-2">
              <Label>Secção</Label>
              <UnitCombobox
                value={sectionId}
                onChange={(value) => {
                  setSectionId(value);
                  setUnitId(null);
                }}
                options={sectionsQuery.data ?? []}
                placeholder="Selecionar secção"
                loading={sectionsQuery.isLoading}
                hasError={sectionsQuery.isError}
                onRetry={() => void sectionsQuery.refetch()}
              />
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <UnitCombobox
                value={unitId}
                onChange={setUnitId}
                options={unitsQuery.data ?? []}
                placeholder="Selecionar unidade"
                loading={unitsQuery.isLoading}
                hasError={unitsQuery.isError}
                onRetry={() => void unitsQuery.refetch()}
              />
            </div>
          </div>
          {selectedPath.length > 0 && (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Caminho: {selectedPath.map((node) => node.name).join(" / ")}
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setValue("is_primary", e.target.checked)}
              className="size-4 accent-primary"
              aria-label="Atribuição principal"
            />
            Atribuição principal
          </label>
        </div>
      )}

      {!isEditing && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">Segurança</h4>
          <div className="space-y-2">
            <Label htmlFor="status">Estado da conta</Label>
            <Select value={status} onValueChange={(value) => setValue("status", value ?? "PENDING")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
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
              : "Criar Utilizador"}
        </Button>
      </DialogFooter>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Editar Utilizador" : "Novo Utilizador"}</SheetTitle>
          </SheetHeader>
          <div className="px-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Utilizador" : "Novo Utilizador"}</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

export function UserForm(props: UserFormProps) {
  if (!props.open) return null;
  return <UserFormContent {...props} />;
}