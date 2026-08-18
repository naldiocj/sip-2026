import type { LucideIcon } from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: LucideIcon;
  description?: string;
  requiredPermission?: string;
  requiredRoles?: string[];
  scope?: string[];
  children?: NavigationItem[];
  badge?: NavigationBadge;
  featureFlag?: string;
  isSeparator?: boolean;
}

export interface NavigationBadge {
  count?: number;
  variant?: "default" | "secondary" | "destructive" | "outline";
  tooltip?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
  requiredPermission?: string;
}
