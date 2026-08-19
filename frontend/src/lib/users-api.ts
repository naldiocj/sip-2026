import { apiClient } from "@/lib/api-client";

export interface UserListItem {
  id: string;
  username: string;
  full_name: string;
  email: string;
  employee_number: string | null;
  person_id: string | null;
  person_name: string | null;
  status: string;
}

export interface UserListResponse {
  items: UserListItem[];
  total: number;
}

export const usersApi = {
  list(search?: string): Promise<UserListResponse> {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get<UserListResponse>(`/api/v1/users${qs}`);
  },

  get(userId: string): Promise<UserListItem> {
    return apiClient.get<UserListItem>(`/api/v1/users/${userId}`);
  },
};