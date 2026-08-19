import { apiClient } from "@/lib/api-client";

export interface UserAssignmentUpdate {
  assignment_type?: string;
  is_primary?: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

export interface AssignmentRecord {
  id: string;
  user_id: string;
  organizational_unit_id: string;
  assignment_type: string;
  is_primary: boolean;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface ResponsibilityRecord {
  id: string;
  user_id: string;
  scope: string;
  organizational_unit_id: string | null;
  resource_type: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  is_active: boolean;
}

export interface ResponsibilityCreate {
  user_id: string;
  scope: string;
  organizational_unit_id?: string | null;
  resource_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface DelegationRecord {
  id: string;
  delegator_user_id: string;
  delegate_user_id: string;
  scope: string;
  organizational_unit_id: string | null;
  start_date: string | null;
  end_date: string | null;
  reason: string | null;
  status: string;
  is_active: boolean;
}

export interface DelegationCreate {
  delegator_user_id: string;
  delegate_user_id: string;
  scope: string;
  organizational_unit_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  reason?: string | null;
}

export const managementApi = {
  listUserAssignments(userId: string): Promise<AssignmentRecord[]> {
    return apiClient.get<AssignmentRecord[]>(`/api/v1/users/${userId}/assignments`);
  },

  updateUserAssignment(
    userId: string,
    assignmentId: string,
    data: UserAssignmentUpdate,
  ): Promise<AssignmentRecord> {
    return apiClient.patch<AssignmentRecord>(
      `/api/v1/users/${userId}/assignments/${assignmentId}`,
      data,
    );
  },

  endUserAssignment(userId: string, assignmentId: string): Promise<AssignmentRecord> {
    return apiClient.post<AssignmentRecord>(
      `/api/v1/users/${userId}/assignments/${assignmentId}/end`,
    );
  },

  listResponsibilities(userId?: string): Promise<ResponsibilityRecord[]> {
    const qs = userId ? `?user_id=${userId}` : "";
    return apiClient.get<ResponsibilityRecord[]>(`/api/v1/responsibilities${qs}`);
  },

  createResponsibility(data: ResponsibilityCreate): Promise<ResponsibilityRecord> {
    return apiClient.post<ResponsibilityRecord>("/api/v1/responsibilities", data);
  },

  endResponsibility(responsibilityId: string): Promise<ResponsibilityRecord> {
    return apiClient.post<ResponsibilityRecord>(
      `/api/v1/responsibilities/${responsibilityId}/end`,
    );
  },

  listDelegations(userId?: string): Promise<DelegationRecord[]> {
    const qs = userId ? `?user_id=${userId}` : "";
    return apiClient.get<DelegationRecord[]>(`/api/v1/delegations${qs}`);
  },

  createDelegation(data: DelegationCreate): Promise<DelegationRecord> {
    return apiClient.post<DelegationRecord>("/api/v1/delegations", data);
  },

  revokeDelegation(delegationId: string): Promise<DelegationRecord> {
    return apiClient.post<DelegationRecord>(`/api/v1/delegations/${delegationId}/revoke`);
  },
};