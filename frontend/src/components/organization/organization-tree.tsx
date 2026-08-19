"use client";

import { useState, useCallback, useMemo } from "react";
import type { UnitTreeNode } from "@/lib/organization-types";
import { getUnitTypeMetadata } from "@/lib/organization-metadata";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  MoveIcon,
  MoreHorizontalIcon,
  Building2Icon,
  LandmarkIcon,
  LayoutListIcon,
  BoxIcon,
  MapPinIcon,
  FolderIcon,
  PowerIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building: Building2Icon,
  Landmark: LandmarkIcon,
  Building2: Building2Icon,
  LayoutList: LayoutListIcon,
  Box: BoxIcon,
  MapPin: MapPinIcon,
  Folder: FolderIcon,
};

interface OrganizationTreeProps {
  tree: UnitTreeNode[];
  selectedUnitId: string | null;
  onSelectUnit: (unit: UnitTreeNode) => void;
  onAddChild?: (parentId: string) => void;
  onEditUnit?: (unit: UnitTreeNode) => void;
  onMoveUnit?: (unit: UnitTreeNode) => void;
  onDeactivateUnit?: (unit: UnitTreeNode) => void;
  canManage: boolean;
  className?: string;
}

interface TreeNodeProps {
  node: UnitTreeNode;
  selectedUnitId: string | null;
  onSelectUnit: (unit: UnitTreeNode) => void;
  onAddChild?: (parentId: string) => void;
  onEditUnit?: (unit: UnitTreeNode) => void;
  onMoveUnit?: (unit: UnitTreeNode) => void;
  onDeactivateUnit?: (unit: UnitTreeNode) => void;
  canManage: boolean;
  level: number;
}

function TreeNode({
  node,
  selectedUnitId,
  onSelectUnit,
  onAddChild,
  onEditUnit,
  onMoveUnit,
  onDeactivateUnit,
  canManage,
  level,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const metadata = getUnitTypeMetadata(node.type_id);
  const IconComponent = ICON_MAP[metadata.icon.name] ?? FolderIcon;
  const isSelected = selectedUnitId === node.id;
  const hasChildren = node.children.length > 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelectUnit(node);
      }
      if (e.key === "ArrowRight" && hasChildren && !expanded) {
        setExpanded(true);
      }
      if (e.key === "ArrowLeft" && hasChildren && expanded) {
        setExpanded(false);
      }
    },
    [node, onSelectUnit, hasChildren, expanded],
  );

  return (
    <div role="treeitem" aria-expanded={hasChildren ? expanded : undefined} aria-selected={isSelected}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors cursor-pointer",
          "hover:bg-muted/80",
          isSelected && "bg-primary/10 text-primary font-medium",
          !node.is_active && "opacity-50",
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectUnit(node)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
      >
        {hasChildren ? (
          <button
            className="flex size-4 shrink-0 items-center justify-center rounded-sm hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? (
              <ChevronDownIcon className="size-3.5" />
            ) : (
              <ChevronRightIcon className="size-3.5" />
            )}
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}

        <IconComponent className={cn("size-4 shrink-0", metadata.color)} />

        <span className="flex-1 truncate">{node.name}</span>

        <Badge variant={metadata.badgeVariant} className="hidden text-xs sm:inline-flex">
          {metadata.label}
        </Badge>

        {node.code && (
          <span className="hidden rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground md:inline-block">
            {node.code}
          </span>
        )}

        {canManage && (
          <div className="hidden group-hover:block">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                }
              >
                <MoreHorizontalIcon className="size-3.5" />
                <span className="sr-only">Ações</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditUnit?.(node)}>
                  <PencilIcon className="mr-2 size-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddChild?.(node.id)}>
                  <PlusIcon className="mr-2 size-3.5" />
                  Adicionar sub-unidade
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveUnit?.(node)}>
                  <MoveIcon className="mr-2 size-3.5" />
                  Mover
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  disabled={!node.is_active}
                  onClick={() => onDeactivateUnit?.(node)}
                >
                  <PowerIcon className="mr-2 size-3.5" />
                  Desativar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            selectedUnitId={selectedUnitId}
            onSelectUnit={onSelectUnit}
            onAddChild={onAddChild}
            onEditUnit={onEditUnit}
            onMoveUnit={onMoveUnit}
            onDeactivateUnit={onDeactivateUnit}
            canManage={canManage}
            level={level + 1}
          />
        ))}
    </div>
  );
}

export function OrganizationTree({
  tree,
  selectedUnitId,
  onSelectUnit,
  onAddChild,
  onEditUnit,
  onMoveUnit,
  onDeactivateUnit,
  canManage,
  className,
}: OrganizationTreeProps) {
  const totalNodes = useMemo(() => {
    function count(nodes: UnitTreeNode[]): number {
      return nodes.reduce((acc, n) => acc + 1 + count(n.children), 0);
    }
    return count(tree);
  }, [tree]);

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Building2Icon className="mb-3 size-10 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          Nenhuma unidade encontrada
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Crie uma unidade de nível superior para começar.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-0.5", className)}
      role="tree"
      aria-label="Estrutura organizacional"
    >
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="text-xs text-muted-foreground">
          {totalNodes} {totalNodes === 1 ? "unidade" : "unidades"}
        </span>
      </div>
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          selectedUnitId={selectedUnitId}
          onSelectUnit={onSelectUnit}
          onAddChild={onAddChild}
          onEditUnit={onEditUnit}
          onMoveUnit={onMoveUnit}
          onDeactivateUnit={onDeactivateUnit}
          canManage={canManage}
          level={0}
        />
      ))}
    </div>
  );
}
