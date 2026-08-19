"use client";

import { useState } from "react";
import type { OrganizationalUnit, UnitTreeNode } from "@/lib/organization-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoveIcon } from "lucide-react";

interface MoveUnitDialogProps {
  unit: UnitTreeNode;
  units: OrganizationalUnit[];
  onClose: () => void;
  onMoved: (unitId: string, parentId: string | null) => Promise<unknown>;
}

function collectDescendants(nodes: UnitTreeNode[], acc: Set<string>): Set<string> {
  for (const node of nodes) {
    acc.add(node.id);
    collectDescendants(node.children, acc);
  }
  return acc;
}

export function MoveUnitDialog({ unit, units, onClose, onMoved }: MoveUnitDialogProps) {
  const [parentId, setParentId] = useState<string>(unit.parent_id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const descendants = collectDescendants(unit.children, new Set([unit.id]));
  const candidates = units.filter((u) => u.is_active && !descendants.has(u.id));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onMoved(unit.id, parentId || null);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveIcon className="size-4" />
            Mover Unidade
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">Unidade a mover</p>
            <p className="text-sm font-medium">{unit.name}</p>
          </div>
          <div className="space-y-2">
            <Label>Nova unidade superior</Label>
            <Select value={parentId} onValueChange={(v) => setParentId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Nenhuma (nível superior)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma (nível superior)</SelectItem>
                {candidates.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A unidade e as suas subunidades serão movidas em conjunto.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "A mover..." : "Mover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}