export interface UserProfile {
  id: string;
  code: string;
  name: string;
  label: string | null;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  employee_number: string | null;
  status: string;
  status_label: string;
  profiles: UserProfile[];
  permissions: string[];
  organization_scope: string[];
  organizations?: Organization[];
}

export interface Organization {
  id: string;
  name: string;
  type: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    full_name: string;
    email: string;
    profiles: UserProfile[];
  };
}

export interface ApiErrorDetail {
  field: string | null;
  message: string;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details: ApiErrorDetail[];
}

export interface MeResponse {
  id: string;
  username: string;
  email: string;
  full_name: string;
  employee_number: string | null;
  status: string;
  status_label: string;
  profiles: UserProfile[];
  permissions: string[];
  organization_scope: string[];
}
