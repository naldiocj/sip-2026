"use client";

import { useMemo } from "react";
import { useTable, flexRender, tableFeatures, type ColumnDef } from "@tanstack/react-table";
import type { ProfileListItem, UserListItem } from "@/lib/users-api";
import { humanizeAssignmentType, humanizeUserStatus } from "@/lib/humanize";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";

export interface UserActionHandlers {
  onEdit: (user: UserListItem) => void;
  onView: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
  onToggleBlock: (user: UserListItem) => void;
  onManageProfiles: (user: UserListItem) => void;
}

export interface UserTablePermissions {
  canUpdate: boolean;
  canManageProfiles: boolean;
}

interface UserDataTableProps {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  profileFilter: string;
  profiles: ProfileListItem[];
  permissions: UserTablePermissions;
  actions: UserActionHandlers;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onProfileFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  emptyLabel?: string;
}

const features = tableFeatures({});

type TableFeatures = typeof features;
type UserColumnDef = ColumnDef<TableFeatures, UserListItem, unknown>;

function pathItem(
  user: UserListItem,
  unitType: string,
): string | null {
  return (
    user.primary_assignment?.unit_path.find((item) => item.type === unitType)?.name ?? null
  );
}

function userLabel(user: UserListItem): string {
  return user.person_name ?? user.full_name;
}

export function UserDataTable({
  items,
  total,
  page,
  pageSize,
  search,
  statusFilter,
  profileFilter,
  profiles,
  permissions,
  actions,
  onSearchChange,
  onStatusFilterChange,
  onProfileFilterChange,
  onPageChange,
  onPageSizeChange,
  emptyLabel = "Nenhum utilizador encontrado",
}: UserDataTableProps) {
  const columns: UserColumnDef[] = useMemo(
    () => [
      {
        accessorKey: "username",
        header: "Utilizador",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.username}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.employee_number ?? ""}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "full_name",
        header: "Nome",
        cell: ({ row }) => <span className="truncate">{userLabel(row.original)}</span>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="truncate text-sm text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        id: "profiles",
        header: "Perfis",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.profiles.map((profile) => (
              <Badge key={profile.id} variant="outline" className="text-xs">
                {profile.label}
              </Badge>
            ))}
            {row.original.profiles.length === 0 && (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>
        ),
      },
      {
        id: "direction",
        header: "Direcção",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {pathItem(row.original, "DIRECTION") ?? "—"}
          </span>
        ),
      },
      {
        id: "department",
        header: "Departamento",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {pathItem(row.original, "DEPARTMENT") ?? "—"}
          </span>
        ),
      },
      {
        id: "section",
        header: "Secção",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {pathItem(row.original, "SECTION") ?? "—"}
          </span>
        ),
      },
      {
        id: "unit",
        header: "Unidade",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.primary_assignment
              ? humanizeAssignmentType(row.original.primary_assignment.assignment_type)
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "ACTIVE" ? "default" : "secondary"}
            className="text-xs"
          >
            {row.original.status_label ?? humanizeUserStatus(row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: "last_login_at",
        header: "Último acesso",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.last_login_at
              ? new Date(row.original.last_login_at).toLocaleDateString("pt-PT")
              : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Ações do utilizador">
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{userLabel(row.original)}</DropdownMenuLabel>
                <DropdownMenuSeparator />
              </DropdownMenuGroup>
              <DropdownMenuItem onClick={() => actions.onView(row.original)}>
                Ver detalhe
              </DropdownMenuItem>
              {permissions.canUpdate && (
                <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
                  Editar
                </DropdownMenuItem>
              )}
              {permissions.canUpdate && (
                <DropdownMenuItem onClick={() => actions.onToggleStatus(row.original)}>
                  {row.original.status === "ACTIVE" ? "Desactivar" : "Activar"}
                </DropdownMenuItem>
              )}
              {permissions.canUpdate && (
                <DropdownMenuItem onClick={() => actions.onToggleBlock(row.original)}>
                  {row.original.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}
                </DropdownMenuItem>
              )}
              {permissions.canManageProfiles && (
                <DropdownMenuItem onClick={() => actions.onManageProfiles(row.original)}>
                  Gerir perfis
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [permissions.canUpdate, permissions.canManageProfiles, actions],
  );

  const table = useTable({
    features,
    data: items,
    columns,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Pesquisar utilizadores..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            aria-label="Pesquisar utilizadores"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => onStatusFilterChange(value ?? "all")}>
            <SelectTrigger className="w-[140px]" aria-label="Filtrar por estado">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
              <SelectItem value="BLOCKED">Bloqueado</SelectItem>
              <SelectItem value="SUSPENDED">Suspenso</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
            </SelectContent>
          </Select>
          <Select value={profileFilter} onValueChange={(value) => onProfileFilterChange(value ?? "all")}>
            <SelectTrigger className="w-[190px]" aria-label="Filtrar por perfil">
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <UsersIcon className="mb-2 size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">{emptyLabel}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? "utilizador" : "utilizadores"}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value ?? pageSize))}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Página anterior"
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Página seguinte"
            >
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}