import { useState } from "react";
import { useUsers } from "@/hooks/use-users";
import type { UserListItem } from "@/lib/users-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FieldGroup, FieldLabel } from "@/components/ui/field";

interface UserPickerProps {
  value: string | null;
  onChange: (user: UserListItem | null) => void;
  label?: string;
  placeholder?: string;
}

export function UserPicker({
  value,
  onChange,
  label = "Utilizador",
  placeholder = "Selecionar utilizador",
}: UserPickerProps) {
  const [search, setSearch] = useState("");
  const { data } = useUsers({ search: search || undefined, status: "ACTIVE" });

  const users = data?.items ?? [];
  const selected = users.find((u) => u.id === value) ?? null;

  return (
    <FieldGroup>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou utilizador..."
          aria-label={`Pesquisar ${label.toLowerCase()}`}
          className="h-8"
        />
        <Select
          value={value ?? ""}
          onValueChange={(v) => {
            const user = users.find((u) => u.id === v) ?? null;
            onChange(user);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.person_name ?? user.full_name} ({user.username})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selected && (
        <p className="text-xs text-muted-foreground">
          Selecionado: {selected.person_name ?? selected.full_name} ({selected.username})
        </p>
      )}
    </FieldGroup>
  );
}