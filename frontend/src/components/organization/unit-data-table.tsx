"use client";

import { useMemo, useState } from "react";
import {
  useTable,
  flexRender,
  tableFeatures,
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  createFilteredRowModel,
  createSortedRowModel,
  createPaginatedRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type { OrganizationalUnit } from "@/lib/organization-types";
import { getUnitTypeMetadata, getStatusMetadata } from "@/lib/organization-metadata";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
  PencilIcon,
} from "lucide-react";

interface UnitDataTableProps {
  units: OrganizationalUnit[];
  selectedUnitId: string | null;
  onSelectUnit: (unit: OrganizationalUnit) => void;
  onEditUnit?: (unit: OrganizationalUnit) => void;
  canManage: boolean;
}

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
});

type TableFeatures = typeof features;
type UnitColumnDef = ColumnDef<TableFeatures, OrganizationalUnit, unknown>;

export function UnitDataTable({
  units,
  selectedUnitId,
  onSelectUnit,
  onEditUnit,
  canManage,
}: UnitDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const columns: UnitColumnDef[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Unidade</span>
            <ArrowUpDownIcon className="ml-2 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => {
          const meta = getUnitTypeMetadata(row.original.type_id);
          const Icon = meta.icon;
          return (
            <div className="flex items-center gap-2">
              <Icon className={cn("size-4 shrink-0", meta.color)} />
              <div className="min-w-0">
                <div className="truncate font-medium">{row.original.name}</div>
                {row.original.code && (
                  <div className="text-xs text-muted-foreground">{row.original.code}</div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type_id",
        header: "Tipo",
        cell: ({ row }) => {
          const meta = getUnitTypeMetadata(row.original.type_id);
          return (
            <Badge variant={meta.badgeVariant} className="text-xs">
              {meta.label}
            </Badge>
          );
        },
        filterFn: (row, _columnId, filterValue) => {
          if (filterValue === "all") return true;
          return row.original.type_id === filterValue;
        },
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const meta = getStatusMetadata(row.original.status);
          return (
            <Badge variant={meta.badgeVariant} className="text-xs">
              <meta.icon className="mr-1 size-3" />
              {meta.label}
            </Badge>
          );
        },
        filterFn: (row, _columnId, filterValue) => {
          if (filterValue === "all") return true;
          return row.original.status === filterValue;
        },
      },
      {
        accessorKey: "sort_order",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Ordem</span>
            <ArrowUpDownIcon className="ml-2 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.sort_order ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canManage ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditUnit?.(row.original);
              }}
            >
              <PencilIcon className="size-3.5" />
              <span className="sr-only">Editar</span>
            </Button>
          ) : null,
      },
    ],
    [canManage, onEditUnit],
  );

  const table = useTable({
    features,
    data: units,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: { pageIndex: 0, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
  });

  const activeFilters = columnFilters.filter((f) => f.value && f.value !== "all");

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar unidades..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={
              (table.getColumn("type_id")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table.getColumn("type_id")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="DIRECTION">Direcção</SelectItem>
              <SelectItem value="DEPARTMENT">Departamento</SelectItem>
              <SelectItem value="SECTION">Secção</SelectItem>
              <SelectItem value="UNIT">Unidade</SelectItem>
              <SelectItem value="PIQUETE">Piquete</SelectItem>
              <SelectItem value="OTHER">Outra</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table.getColumn("status")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filtros ativos:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              {filter.id === "type_id" ? "Tipo" : "Estado"}:{" "}
              {filter.id === "type_id"
                ? getUnitTypeMetadata(filter.value as string).label
                : getStatusMetadata(filter.value as string).label}
              <button
                onClick={() => table.getColumn(filter.id)?.setFilterValue("")}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <XIcon className="size-2.5" />
              </button>
            </Badge>
          ))}
          <button
            onClick={() => {
              table.resetColumnFilters();
              setGlobalFilter("");
            }}
            className="text-primary hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
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
                    <p className="text-sm text-muted-foreground">
                      Nenhuma unidade encontrada
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Tente alterar os filtros ou criar uma nova unidade.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.original.id === selectedUnitId ? "selected" : undefined}
                  className={cn(
                    "cursor-pointer",
                    row.original.id === selectedUnitId && "bg-muted/50",
                  )}
                  onClick={() => onSelectUnit(row.original)}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
          {table.getFilteredRowModel().rows.length}{" "}
          {table.getFilteredRowModel().rows.length === 1 ? "unidade" : "unidades"}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="size-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {table.state.pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
