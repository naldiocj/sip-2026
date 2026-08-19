import { apiClient } from "@/lib/api-client";
import type {
  Organization,
  OrganizationContext,
  OrganizationalUnit,
  OrganizationCreate,
  UnitCreate,
  UnitTreeNode,
  UnitTypeItem,
  UnitUpdate,
  UserAssignment,
  UserAssignmentCreate,
  UserAssignmentWithDetails,
} from "@/lib/organization-types";

export const organizationApi = {
  listOrganizations(): Promise<Organization[]> {
    return apiClient.get<Organization[]>("/api/v1/organizations");
  },

  createOrganization(data: OrganizationCreate): Promise<Organization> {
    return apiClient.post<Organization>("/api/v1/organizations", data);
  },

  listAllUnits(organizationId: string): Promise<OrganizationalUnit[]> {
    return apiClient.get<OrganizationalUnit[]>(
      `/api/v1/units?organization_id=${organizationId}`,
    );
  },

  getUnitTree(organizationId: string): Promise<UnitTreeNode[]> {
    return apiClient.get<UnitTreeNode[]>(
      `/api/v1/units/tree?organization_id=${organizationId}`,
    );
  },

  getUnit(unitId: string): Promise<OrganizationalUnit> {
    return apiClient.get<OrganizationalUnit>(`/api/v1/units/${unitId}`);
  },

  createUnit(data: UnitCreate): Promise<OrganizationalUnit> {
    return apiClient.post<OrganizationalUnit>("/api/v1/units", data);
  },

  updateUnit(unitId: string, data: UnitUpdate): Promise<OrganizationalUnit> {
    return apiClient.patch<OrganizationalUnit>(`/api/v1/units/${unitId}`, data);
  },

  moveUnit(unitId: string, parentId: string | null): Promise<OrganizationalUnit> {
    return apiClient.patch<OrganizationalUnit>(`/api/v1/units/${unitId}`, {
      parent_id: parentId,
    });
  },

  deactivateUnit(unitId: string): Promise<OrganizationalUnit> {
    return apiClient.post<OrganizationalUnit>(`/api/v1/units/${unitId}/deactivate`);
  },

  getUnitAssignments(unitId: string): Promise<UserAssignmentWithDetails[]> {
    return apiClient.get<UserAssignmentWithDetails[]>(
      `/api/v1/units/${unitId}/assignments`,
    );
  },

  getUnitTypes(): Promise<UnitTypeItem[]> {
    return apiClient.get<UnitTypeItem[]>("/api/v1/unit-types");
  },

  listUserAssignments(userId: string): Promise<UserAssignment[]> {
    return apiClient.get<UserAssignment[]>(`/api/v1/users/${userId}/assignments`);
  },

  createUserAssignment(
    userId: string,
    data: UserAssignmentCreate,
  ): Promise<UserAssignment> {
    return apiClient.post<UserAssignment>(
      `/api/v1/users/${userId}/assignments`,
      data,
    );
  },

  getOrganizationContext(): Promise<OrganizationContext> {
    return apiClient.get<OrganizationContext>("/api/v1/me/organization-context");
  },
};
