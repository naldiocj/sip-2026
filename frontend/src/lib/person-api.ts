import { apiClient } from "@/lib/api-client";
import type {
  Person,
  PersonCreate,
  PersonListParams,
  PersonListResponse,
  PersonUpdate,
} from "@/lib/person-types";

export const personApi = {
  list(params: PersonListParams = {}): Promise<PersonListResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.page_size) query.set("page_size", String(params.page_size));
    const qs = query.toString();
    return apiClient.get<PersonListResponse>(`/api/v1/persons${qs ? `?${qs}` : ""}`);
  },

  get(personId: string): Promise<Person> {
    return apiClient.get<Person>(`/api/v1/persons/${personId}`);
  },

  create(data: PersonCreate): Promise<Person> {
    return apiClient.post<Person>("/api/v1/persons", data);
  },

  update(personId: string, data: PersonUpdate): Promise<Person> {
    return apiClient.patch<Person>(`/api/v1/persons/${personId}`, data);
  },

  deactivate(personId: string): Promise<Person> {
    return apiClient.post<Person>(`/api/v1/persons/${personId}/deactivate`);
  },
};