export type UserRole = "ADMIN" | "SALES_MANAGER" | "BUSINESS_DEVELOPMENT" | "READ_ONLY_ANALYST";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export const PERMISSIONS = {
  ADMIN: {
    canManageUsers: true,
    canManageSettings: true,
    canManageCompetitors: true,
    canEditCompanies: true,
    canDeleteCompanies: true,
    canMovePipeline: true,
    canExportData: true,
    canImportData: true,
    canLogActivities: true,
  },
  SALES_MANAGER: {
    canManageUsers: false,
    canManageSettings: false,
    canManageCompetitors: true,
    canEditCompanies: true,
    canDeleteCompanies: true,
    canMovePipeline: true,
    canExportData: true,
    canImportData: true,
    canLogActivities: true,
  },
  BUSINESS_DEVELOPMENT: {
    canManageUsers: false,
    canManageSettings: false,
    canManageCompetitors: false,
    canEditCompanies: true,
    canDeleteCompanies: false,
    canMovePipeline: true,
    canExportData: true,
    canImportData: false,
    canLogActivities: true,
  },
  READ_ONLY_ANALYST: {
    canManageUsers: false,
    canManageSettings: false,
    canManageCompetitors: false,
    canEditCompanies: false,
    canDeleteCompanies: false,
    canMovePipeline: false,
    canExportData: true,
    canImportData: false,
    canLogActivities: false,
  },
};

export function hasPermission(role: UserRole, permission: keyof typeof PERMISSIONS["ADMIN"]): boolean {
  return PERMISSIONS[role]?.[permission] ?? false;
}
