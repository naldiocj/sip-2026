"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Person, PersonCreate, PersonUpdate } from "@/lib/person-types";
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
import { Textarea } from "@/components/ui/textarea";
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
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const NATIONALITIES = [
  "Angolana",
  "Portuguesa",
  "Brasileira",
  "Cabo-verdiana",
  "Moçambicana",
  "Guineense",
  "São-tomense",
  "Estrangeira",
] as const;

const FUNCTIONAL_CATEGORIES = [
  "Técnico Superior",
  "Técnico Médio",
  "Auxiliar",
  "Agente",
  "Chefe de Departamento",
  "Director",
  "Instrutor",
  "Outra",
] as const;

const EMPLOYMENT_STATUSES = [
  { value: "EMPLOYED", label: "Empregado" },
  { value: "ON_LEAVE", label: "Licença" },
  { value: "SUSPENDED", label: "Suspenso" },
  { value: "TERMINATED", label: "Terminado" },
  { value: "NOT_APPLICABLE", label: "Não aplicável" },
] as const;

const personFormSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório").max(255),
  preferred_name: z.string().max(255).optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  birth_place: z.string().max(255).optional().or(z.literal("")),
  nationality: z.string().max(100).optional().or(z.literal("")),
  gender: z.string().max(30).optional().or(z.literal("")),
  bi_number: z.string().max(50).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  employee_number: z.string().max(50).optional().or(z.literal("")),
  functional_category: z.string().max(100).optional().or(z.literal("")),
  job_title: z.string().max(150).optional().or(z.literal("")),
  admission_date: z.string().optional().or(z.literal("")),
  employment_status: z.string().max(30).optional().or(z.literal("")),
  professional_registration: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type PersonFormValues = z.infer<typeof personFormSchema>;

interface PersonFormProps {
  editingPerson?: Person | null;
  open: boolean;
  onClose: () => void;
  onCreated: (person: Person) => void;
  onUpdated?: (person: Person) => void;
  createFn: (data: PersonCreate) => Promise<Person>;
  updateFn?: (personId: string, data: PersonUpdate) => Promise<Person>;
}

function ComboboxField({
  value,
  onChange,
  options,
  placeholder,
  emptyMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  emptyMessage: string;
}) {
  const [open, setOpen] = useState(false);

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
          >
            {value || placeholder}
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[--trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === option ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PersonFormContent({
  editingPerson,
  onClose,
  onCreated,
  onUpdated,
  createFn,
  updateFn,
}: Omit<PersonFormProps, "open">) {
  const isEditing = !!editingPerson;
  const isMobile = useIsMobile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      full_name: editingPerson?.full_name ?? "",
      preferred_name: editingPerson?.preferred_name ?? "",
      birth_date: editingPerson?.birth_date ?? "",
      birth_place: editingPerson?.birth_place ?? "",
      nationality: editingPerson?.nationality ?? "",
      gender: editingPerson?.gender ?? "",
      bi_number: editingPerson?.bi_number ?? "",
      phone: editingPerson?.phone ?? "",
      email: editingPerson?.email ?? "",
      address: editingPerson?.address ?? "",
      employee_number: editingPerson?.employee_number ?? "",
      functional_category: editingPerson?.functional_category ?? "",
      job_title: editingPerson?.job_title ?? "",
      admission_date: editingPerson?.admission_date ?? "",
      employment_status: editingPerson?.employment_status ?? "",
      professional_registration: editingPerson?.professional_registration ?? "",
      notes: editingPerson?.notes ?? "",
    },
  });

  const nationality = watch("nationality") ?? "";
  const functionalCategory = watch("functional_category") ?? "";
  const employmentStatus = watch("employment_status") ?? "";

  const onSubmit = async (values: PersonFormValues) => {
    try {
      const data: PersonCreate = {
        full_name: values.full_name,
        preferred_name: values.preferred_name || undefined,
        birth_date: values.birth_date || undefined,
        birth_place: values.birth_place || undefined,
        nationality: values.nationality || undefined,
        gender: values.gender || undefined,
        bi_number: values.bi_number || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        address: values.address || undefined,
        employee_number: values.employee_number || undefined,
        functional_category: values.functional_category || undefined,
        job_title: values.job_title || undefined,
        admission_date: values.admission_date || undefined,
        employment_status: values.employment_status || undefined,
        professional_registration: values.professional_registration || undefined,
        notes: values.notes || undefined,
      };
      if (isEditing && updateFn && editingPerson) {
        const updated = await updateFn(editingPerson.id, data);
        onUpdated?.(updated);
      } else {
        const created = await createFn(data);
        onCreated(created);
      }
      onClose();
    } catch {
      // Erro tratado pela mutação
    }
  };

  const formContent = (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Dados Pessoais</h4>
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo *</Label>
          <Input id="full_name" {...register("full_name")} placeholder="Ex: João Baptista dos Santos" />
          {errors.full_name && (
            <p className="text-xs text-destructive">{errors.full_name.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="preferred_name">Nome preferido</Label>
            <Input id="preferred_name" {...register("preferred_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de nascimento</Label>
            <Input id="birth_date" type="date" {...register("birth_date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_place">Local de nascimento</Label>
            <Input id="birth_place" {...register("birth_place")} />
          </div>
          <div className="space-y-2">
            <Label>Nacionalidade</Label>
            <ComboboxField
              value={nationality}
              onChange={(v) => setValue("nationality", v)}
              options={NATIONALITIES}
              placeholder="Selecionar nacionalidade"
              emptyMessage="Nacionalidade não encontrada"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Input id="gender" {...register("gender")} placeholder="Ex: Masculino" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bi_number">Nº BI</Label>
            <Input id="bi_number" {...register("bi_number")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Morada</Label>
          <Input id="address" {...register("address")} />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Dados Funcionais</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee_number">Nº de funcionário</Label>
            <Input id="employee_number" {...register("employee_number")} />
          </div>
          <div className="space-y-2">
            <Label>Categoria funcional</Label>
            <ComboboxField
              value={functionalCategory}
              onChange={(v) => setValue("functional_category", v)}
              options={FUNCTIONAL_CATEGORIES}
              placeholder="Selecionar categoria"
              emptyMessage="Categoria não encontrada"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="job_title">Cargo / Função</Label>
            <Input id="job_title" {...register("job_title")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admission_date">Data de admissão</Label>
            <Input id="admission_date" type="date" {...register("admission_date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employment_status">Estado de emprego</Label>
            <Select
              value={employmentStatus}
              onValueChange={(v) => setValue("employment_status", v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecionar estado" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="professional_registration">Registo profissional</Label>
            <Input id="professional_registration" {...register("professional_registration")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" {...register("notes")} rows={3} />
        </div>
      </div>

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
              : "Criar Pessoa"}
        </Button>
      </DialogFooter>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{isEditing ? "Editar Pessoa" : "Nova Pessoa"}</SheetTitle>
          </SheetHeader>
          <div className="px-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Pessoa" : "Nova Pessoa"}</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}

export function PersonForm(props: PersonFormProps) {
  if (!props.open) return null;
  return <PersonFormContent {...props} />;
}