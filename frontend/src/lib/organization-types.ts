export interface Organization {
  id: string;
  code: string;
  name: string;
  short_name: string | null;
  description: string | null;
  status: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrganizationalUnit {
  id: string;
  organization_id: string;
  parent_id: string | null;
  type_id: string;
  code: string | null;
  name: string;
  short_name: string | null;
  description: string | null;
  status: string;
  is_active: boolean;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface UnitTreeNode {
  id: string;
  organization_id: string;
  parent_id: string | null;
  type_id: string;
  code: string | null;
  name: string;
  short_name: string | null;
  status: string;
  is_active: boolean;
  sort_order: number | null;
  children: UnitTreeNode[];
  children_count: number;
}

export interface UnitTypeItem {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface UserAssignment {
  id: string;
  user_id: string;
  organizational_unit_id: string;
  assignment_type: string;
  is_primary: boolean;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserAssignmentWithDetails {
  id: string;
  user_id: string;
  username: string;
  user_full_name: string;
  organizational_unit_id: string;
  unit_name: string;
  unit_type_id: string;
  assignment_type: string;
  is_primary: boolean;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface OrganizationContext {
  organization: Organization | null;
  primary_unit: OrganizationalUnit | null;
  units: OrganizationalUnit[];
  responsibility_scopes: string[];
}

export interface UnitCreate {
  organization_id: string;
  type_id: string;
  name: string;
  code?: string;
  parent_id?: string;
  short_name?: string;
  description?: string;
}

export interface UnitUpdate {
  name?: string;
  code?: string;
  parent_id?: string;
  short_name?: string;
  description?: string;
  status?: string;
}

export interface OrganizationCreate {
  code: string;
  name: string;
  short_name?: string;
  description?: string;
}

export interface UserAssignmentCreate {
  organizational_unit_id: string;
  assignment_type: string;
  is_primary: boolean;
  start_date?: string;
  end_date?: string;
}
