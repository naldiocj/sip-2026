export interface Person {
  id: string;
  person_number: string;
  full_name: string;
  preferred_name: string | null;
  birth_date: string | null;
  birth_place: string | null;
  nationality: string | null;
  gender: string | null;
  bi_number: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  employee_number: string | null;
  functional_category: string | null;
  job_title: string | null;
  admission_date: string | null;
  employment_status: string | null;
  professional_registration: string | null;
  notes: string | null;
  status: string;
  status_label: string;
  is_active: boolean;
}

export interface PersonListResponse {
  items: Person[];
  total: number;
  page: number;
  page_size: number;
}

export interface PersonCreate {
  full_name: string;
  preferred_name?: string | null;
  birth_date?: string | null;
  birth_place?: string | null;
  nationality?: string | null;
  gender?: string | null;
  bi_number?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  employee_number?: string | null;
  functional_category?: string | null;
  job_title?: string | null;
  admission_date?: string | null;
  employment_status?: string | null;
  professional_registration?: string | null;
  notes?: string | null;
}

export type PersonUpdate = Partial<PersonCreate>;

export interface PersonListParams {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}