import { apiClient } from "@/lib/api-client";

export interface UnitPathItem {
  id: string;
  name: string;
  type: string;
  type_label: string;
}

export interface UserAssignmentSummary {
  id: string;
  organizational_unit_id: string;
  assignment_type: string;
  is_primary: boolean;
  status: string;
  start_date: string | null;
  end_date: string | null;
  unit_name: string | null;
  unit_path: UnitPathItem[];
}

export interface ProfileSummary {
  id: string;
  code: string;
  name: string;
  label: string;
}

export interface UserListItem {
  id: string;
  username: string;
  full_name: string;
  email: string;
  employee_number: string | null;
  person_id: string | null;
  person_name: string | null;
  status: string;
  status_label: string;
  profiles: ProfileSummary[];
  last_login_at: string | null;
  created_at: string | null;
  primary_assignment: UserAssignmentSummary | null;
}

export interface UserListResponse {
  items: UserListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserListParams {
  search?: string;
  status?: string;
  profile_id?: string;
  unit_id?: string;
  page?: number;
  page_size?: number;
}

export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  employee_number?: string | null;
  password?: string;
  status?: string;
  profile_ids?: string[];
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
  employee_number?: string | null;
}

export interface ProfileListItem {
  id: string;
  code: string;
  name: string;
  label: string;
  is_active: boolean;
}

export interface ProfileListResponse {
  items: ProfileListItem[];
  total: number;
}

export interface AuditEventListItem {
  id: string;
  event_type: string;
  user_id: string | null;
  timestamp: string;
  ip_address: string | null;
  details: Record<string, unknown>;
}

export interface AuditEventListResponse {
  items: AuditEventListItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AuditListParams {
  user_id?: string;
  event_type?: string;
  page?: number;
  page_size?: number;
}

export const usersApi = {
  list(params: UserListParams = {}): Promise<UserListResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.profile_id) query.set("profile_id", params.profile_id);
    if (params.unit_id) query.set("unit_id", params.unit_id);
    if (params.page) query.set("page", String(params.page));
    if (params.page_size) query.set("page_size", String(params.page_size));
    const qs = query.toString();
    return apiClient.get<UserListResponse>(`/api/v1/users${qs ? `?${qs}` : ""}`);
  },

  get(userId: string): Promise<UserListItem> {
    return apiClient.get<UserListItem>(`/api/v1/users/${userId}`);
  },

  create(data: UserCreate): Promise<UserListItem> {
    return apiClient.post<UserListItem>("/api/v1/users", data);
  },

  update(userId: string, data: UserUpdate): Promise<UserListItem> {
    return apiClient.patch<UserListItem>(`/api/v1/users/${userId}`, data);
  },

  activate(userId: string): Promise<UserListItem> {
    return apiClient.post<UserListItem>(`/api/v1/users/${userId}/activate`);
  },

  deactivate(userId: string): Promise<UserListItem> {
    return apiClient.post<UserListItem>(`/api/v1/users/${userId}/deactivate`);
  },

  block(userId: string): Promise<UserListItem> {
    return apiClient.post<UserListItem>(`/api/v1/users/${userId}/block`);
  },

  unblock(userId: string): Promise<UserListItem> {
    return apiClient.post<UserListItem>(`/api/v1/users/${userId}/unblock`);
  },

  assignProfile(userId: string, profileId: string): Promise<UserListItem> {
    return apiClient.post<UserListItem>(`/api/v1/users/${userId}/profiles`, {
      profile_id: profileId,
    });
  },

  removeProfile(userId: string, profileId: string): Promise<UserListItem> {
    return apiClient.delete<UserListItem>(`/api/v1/users/${userId}/profiles/${profileId}`);
  },

  listProfiles(): Promise<ProfileListResponse> {
    return apiClient.get<ProfileListResponse>("/api/v1/profiles");
  },

  listAudit(params: AuditListParams = {}): Promise<AuditEventListResponse> {
    const query = new URLSearchParams();
    if (params.user_id) query.set("user_id", params.user_id);
    if (params.event_type) query.set("event_type", params.event_type);
    if (params.page) query.set("page", String(params.page));
    if (params.page_size) query.set("page_size", String(params.page_size));
    const qs = query.toString();
    return apiClient.get<AuditEventListResponse>(`/api/v1/audit${qs ? `?${qs}` : ""}`);
  },
};