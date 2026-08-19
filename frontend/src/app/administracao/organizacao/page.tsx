"use client";

import { useState, useMemo, useCallback } from "react";
import { PageContainer, PageHeader, PageContent } from "@/components/layout/page-container";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import {
  useOrganizations,
  useOrganizationTree,
  useOrganizationUnits,
  useUnitAssignments,
  useCreateUnit,
  useUpdateUnit,
  useMoveUnit,
  useDeactivateUnit,
} from "@/hooks/use-organization";
import type { UnitTreeNode, OrganizationalUnit } from "@/lib/organization-types";
import { OrganizationTree } from "@/components/organization/organization-tree";
import { UnitDataTable } from "@/components/organization/unit-data-table";
import { UnitDetails } from "@/components/organization/unit-details";
import { UnitForm } from "@/components/organization/unit-form";
import { MoveUnitDialog } from "@/components/organization/move-unit-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state-components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusIcon,
  Building2Icon,
  LandmarkIcon,
  LayoutListIcon,
  UsersIcon,
  HistoryIcon,
} from "lucide-react";
import {
  useQueryClient,
} from "@tanstack/react-query";
import { organizationKeys } from "@/hooks/use-organization";
import { toast } from "sonner";

function OrganizationContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManage = user?.permissions.includes("organization.manage") ?? false;

  const { data: organizations, isLoading: orgsLoading, error: orgsError, refetch: refetchOrgs } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const orgId = useMemo(() => {
    if (selectedOrgId) return selectedOrgId;
    if (organizations && organizations.length > 0) return organizations[0].id;
    return null;
  }, [selectedOrgId, organizations]);

  const { data: tree, isLoading: treeLoading, error: treeError, refetch: refetchTree } = useOrganizationTree(orgId);
  const { data: units, isLoading: unitsLoading, error: unitsError, refetch: refetchUnits } = useOrganizationUnits(orgId);

  const [selectedUnit, setSelectedUnit] = useState<UnitTreeNode | OrganizationalUnit | null>(null);
  const [activeTab, setActiveTab] = useState("estrutura");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<OrganizationalUnit | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [movingUnit, setMovingUnit] = useState<UnitTreeNode | null>(null);
  const [deactivatingUnit, setDeactivatingUnit] = useState<UnitTreeNode | null>(null);

  const selectedUnitId = selectedUnit?.id ?? null;

  const { data: unitAssignments } = useUnitAssignments(selectedUnitId);

  const createUnitMutation = useCreateUnit();
  const updateUnitMutation = useUpdateUnit(orgId ?? "");
  const moveUnitMutation = useMoveUnit(orgId ?? "");
  const deactivateUnitMutation = useDeactivateUnit(orgId ?? "");

  const handleSelectTreeNode = useCallback((node: UnitTreeNode) => {
    setSelectedUnit(node);
  }, []);

  const handleSelectTableUnit = useCallback((unit: OrganizationalUnit) => {
    setSelectedUnit(unit);
  }, []);

  const handleAddChild = useCallback((parentId: string) => {
    setDefaultParentId(parentId);
    setEditingUnit(null);
    setShowCreateForm(true);
  }, []);

  const handleEditUnit = useCallback((unit: UnitTreeNode | OrganizationalUnit) => {
    setEditingUnit(unit as OrganizationalUnit);
    setDefaultParentId(null);
    setShowCreateForm(true);
  }, []);

  const handleCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: organizationKeys.tree(orgId ?? "") });
    queryClient.invalidateQueries({ queryKey: organizationKeys.units(orgId ?? "") });
    setShowCreateForm(false);
  }, [queryClient, orgId]);

  const handleUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: organizationKeys.tree(orgId ?? "") });
    queryClient.invalidateQueries({ queryKey: organizationKeys.units(orgId ?? "") });
    setShowCreateForm(false);
    setEditingUnit(null);
  }, [queryClient, orgId]);

  const selectedOrg = organizations?.find((o) => o.id === orgId);

  if (orgsLoading) {
    return (
      <PageContainer>
        <PageHeader title="Organização" description="Estrutura organizacional do SIP" />
        <PageContent>
          <LoadingState />
        </PageContent>
      </PageContainer>
    );
  }

  if (orgsError) {
    return (
      <PageContainer>
        <PageHeader title="Organização" description="Estrutura organizacional do SIP" />
        <PageContent>
          <ErrorState onRetry={() => refetchOrgs()} />
        </PageContent>
      </PageContainer>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Organização" description="Estrutura organizacional do SIP" />
        <PageContent>
          <EmptyState
            icon={Building2Icon}
            title="Nenhuma organização encontrada"
            description="Crie uma organização para começar a gerir a estrutura."
          />
        </PageContent>
      </PageContainer>
    );
  }

  const stats = units
    ? {
        directions: units.filter((u) => u.type_id === "DIRECTION").length,
        departments: units.filter((u) => u.type_id === "DEPARTMENT").length,
        sections: units.filter((u) => u.type_id === "SECTION").length,
        units: units.filter((u) => u.type_id === "UNIT").length,
      }
    : { directions: 0, departments: 0, sections: 0, units: 0 };

  return (
    <PageContainer>
      <PageHeader
        title="Organização"
        description={selectedOrg ? selectedOrg.name : "Estrutura organizacional do SIP"}
        actions={
          canManage ? (
            <Button onClick={() => { setEditingUnit(null); setDefaultParentId(null); setShowCreateForm(true); }}>
              <PlusIcon className="mr-2 size-4" />
              Nova Unidade
            </Button>
          ) : undefined
        }
      />
      <PageContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-3">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <LandmarkIcon className="size-8 text-indigo-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.directions}</p>
                    <p className="text-xs text-muted-foreground">Direcções</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <Building2Icon className="size-8 text-violet-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.departments}</p>
                    <p className="text-xs text-muted-foreground">Departamentos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <LayoutListIcon className="size-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.sections}</p>
                    <p className="text-xs text-muted-foreground">Secções</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <UsersIcon className="size-8 text-teal-600" />
                  <div>
                    <p className="text-2xl font-bold">{units?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total unidades</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line">
            <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
            <TabsTrigger value="unidades">Unidades</TabsTrigger>
            <TabsTrigger value="pessoas">Pessoas</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="estrutura" className="mt-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Árvore Organizacional</CardTitle>
                </CardHeader>
                <CardContent>
                  {treeLoading ? (
                    <LoadingState rows={3} />
                  ) : treeError ? (
                    <ErrorState onRetry={() => refetchTree()} />
                  ) : (
                    <OrganizationTree
                      tree={tree ?? []}
                      selectedUnitId={selectedUnitId}
                      onSelectUnit={handleSelectTreeNode}
                      onAddChild={canManage ? handleAddChild : undefined}
                      onEditUnit={canManage ? handleEditUnit : undefined}
                      onMoveUnit={canManage ? setMovingUnit : undefined}
                      onDeactivateUnit={canManage ? setDeactivatingUnit : undefined}
                      canManage={canManage}
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detalhes</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUnit ? (
                    <ScrollArea className="max-h-[500px]">
                      <UnitDetails
                        unit={
                          "description" in selectedUnit
                            ? (selectedUnit as OrganizationalUnit)
                            : {
                                id: selectedUnit.id,
                                organization_id: selectedUnit.organization_id,
                                parent_id: selectedUnit.parent_id,
                                type_id: selectedUnit.type_id,
                                code: selectedUnit.code,
                                name: selectedUnit.name,
                                short_name: selectedUnit.short_name,
                                description: null,
                                status: selectedUnit.status,
                                is_active: selectedUnit.is_active,
                                sort_order: selectedUnit.sort_order,
                                created_at: null,
                                updated_at: null,
                              }
                        }
                        assignments={unitAssignments ?? []}
                        onEdit={canManage ? handleEditUnit : undefined}
                        canManage={canManage}
                      />
                    </ScrollArea>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Building2Icon className="mb-3 size-10 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        Selecione uma unidade na árvore para ver os detalhes.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="unidades" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {unitsLoading ? (
                  <LoadingState />
                ) : unitsError ? (
                  <ErrorState onRetry={() => refetchUnits()} />
                ) : (
                  <UnitDataTable
                    units={units ?? []}
                    selectedUnitId={selectedUnitId}
                    onSelectUnit={handleSelectTableUnit}
                    onEditUnit={canManage ? handleEditUnit : undefined}
                    canManage={canManage}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pessoas" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <EmptyState
                  icon={UsersIcon}
                  title="Gestão de pessoas"
                  description="A gestão de pessoas e atribuições será implementada em breve."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <EmptyState
                  icon={HistoryIcon}
                  title="Histórico de alterações"
                  description="O registo de alterações organizacionais será implementado em breve."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showCreateForm && orgId && (
          <UnitForm
            organizationId={orgId}
            units={units ?? []}
            editingUnit={editingUnit}
            defaultParentId={defaultParentId}
            open={showCreateForm}
            onClose={() => { setShowCreateForm(false); setEditingUnit(null); }}
            onCreated={handleCreated}
            onUpdated={handleUpdated}
            createFn={createUnitMutation.mutateAsync}
            updateFn={(unitId, data) => updateUnitMutation.mutateAsync({ unitId, data })}
          />
        )}

        {movingUnit && (
          <MoveUnitDialog
            unit={movingUnit}
            units={units ?? []}
            onClose={() => setMovingUnit(null)}
            onMoved={async (unitId, parentId) => {
              await moveUnitMutation.mutateAsync({ unitId, parentId });
              toast.success("Unidade movida com sucesso");
            }}
          />
        )}

        <Dialog open={!!deactivatingUnit} onOpenChange={() => setDeactivatingUnit(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Desativar unidade</DialogTitle>
              <DialogDescription>
                Tem a certeza que pretende desativar a unidade{" "}
                <span className="font-medium">{deactivatingUnit?.name}</span>? A
                unidade ficará inativa, mas o histórico será preservado.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeactivatingUnit(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deactivateUnitMutation.isPending}
                onClick={async () => {
                  if (!deactivatingUnit) return;
                  try {
                    await deactivateUnitMutation.mutateAsync(deactivatingUnit.id);
                    toast.success("Unidade desativada com sucesso");
                    setDeactivatingUnit(null);
                  } catch {
                    toast.error("Não foi possível desativar a unidade");
                  }
                }}
              >
                {deactivateUnitMutation.isPending ? "A desativar..." : "Desativar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {movingUnit && (
          <MoveUnitDialog
            unit={movingUnit}
            units={units ?? []}
            onClose={() => setMovingUnit(null)}
            onMoved={async (unitId, parentId) => {
              await moveUnitMutation.mutateAsync({ unitId, parentId });
              toast.success("Unidade movida com sucesso");
            }}
          />
        )}

        <Dialog open={!!deactivatingUnit} onOpenChange={() => setDeactivatingUnit(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Desativar unidade</DialogTitle>
              <DialogDescription>
                Tem a certeza que pretende desativar a unidade{" "}
                <span className="font-medium">{deactivatingUnit?.name}</span>? A
                unidade ficará inativa, mas o histórico será preservado.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeactivatingUnit(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deactivateUnitMutation.isPending}
                onClick={async () => {
                  if (!deactivatingUnit) return;
                  try {
                    await deactivateUnitMutation.mutateAsync(deactivatingUnit.id);
                    toast.success("Unidade desativada com sucesso");
                    setDeactivatingUnit(null);
                  } catch {
                    toast.error("Não foi possível desativar a unidade");
                  }
                }}
              >
                {deactivateUnitMutation.isPending ? "A desativar..." : "Desativar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContent>
    </PageContainer>
  );
}

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <OrganizationContent />
    </ProtectedRoute>
  );
}
