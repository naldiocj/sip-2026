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
import type { Person } from "@/lib/person-types";
import { humanizePersonStatus } from "@/lib/humanize";
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
  IdCardIcon,
} from "lucide-react";

interface PersonDataTableProps {
  persons: Person[];
  onSelectPerson: (person: Person) => void;
  onEditPerson?: (person: Person) => void;
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
type PersonColumnDef = ColumnDef<TableFeatures, Person, unknown>;

export function PersonDataTable({
  persons,
  onSelectPerson,
  onEditPerson,
  canManage,
}: PersonDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(20);

  const columns: PersonColumnDef[] = useMemo(
    () => [
      {
        accessorKey: "person_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Nº</span>
            <ArrowUpDownIcon className="ml-2 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.person_number}
          </span>
        ),
      },
      {
        accessorKey: "full_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Nome</span>
            <ArrowUpDownIcon className="ml-2 size-3.5" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.full_name}</div>
            {row.original.preferred_name && (
              <div className="text-xs text-muted-foreground">
                {row.original.preferred_name}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "functional_category",
        header: "Categoria Funcional",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.functional_category ?? "—"}
          </span>
        ),
        filterFn: (row, _columnId, filterValue) => {
          if (filterValue === "all") return true;
          return row.original.functional_category === filterValue;
        },
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "default" : "secondary"} className="text-xs">
            {humanizePersonStatus(row.original.status)}
          </Badge>
        ),
        filterFn: (row, _columnId, filterValue) => {
          if (filterValue === "all") return true;
          return row.original.status === filterValue;
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canManage ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Editar pessoa"
              onClick={(e) => {
                e.stopPropagation();
                onEditPerson?.(row.original);
              }}
            >
              <PencilIcon className="size-3.5" />
            </Button>
          ) : null,
      },
    ],
    [canManage, onEditPerson],
  );

  const table = useTable({
    features,
    data: persons,
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
            placeholder="Pesquisar pessoas..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onValueChange={(value) => table.getColumn("status")?.setFilterValue(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="INACTIVE">Inactivo</SelectItem>
              <SelectItem value="RETIRED">Reformado</SelectItem>
              <SelectItem value="DECEASED">Falecido</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={
              (table.getColumn("functional_category")?.getFilterValue() as string) ?? "all"
            }
            onValueChange={(value) =>
              table.getColumn("functional_category")?.setFilterValue(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="Técnico Superior">Técnico Superior</SelectItem>
              <SelectItem value="Técnico Médio">Técnico Médio</SelectItem>
              <SelectItem value="Auxiliar">Auxiliar</SelectItem>
              <SelectItem value="Agente">Agente</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
              <SelectItem value="Instrutor">Instrutor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filtros ativos:</span>
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="gap-1">
              {filter.id === "status" ? "Estado" : "Categoria"}:{" "}
              {filter.id === "status"
                ? humanizePersonStatus(filter.value as string)
                : (filter.value as string)}
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
                    <IdCardIcon className="mb-2 size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Nenhuma pessoa encontrada</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      Tente alterar os filtros ou criar uma nova pessoa.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => onSelectPerson(row.original)}
                >
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
          {table.getFilteredRowModel().rows.length}{" "}
          {table.getFilteredRowModel().rows.length === 1 ? "pessoa" : "pessoas"}
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