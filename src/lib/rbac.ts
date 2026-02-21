import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Permission keys
export const PERMISSIONS = {
  // Appointments
  APPOINTMENTS_VIEW: 'appointments:view',
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_EDIT: 'appointments:edit',
  APPOINTMENTS_DELETE: 'appointments:delete',

  // Customers
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_EDIT: 'customers:edit',
  CUSTOMERS_DELETE: 'customers:delete',

  // Services
  SERVICES_VIEW: 'services:view',
  SERVICES_MANAGE: 'services:manage',

  // Invoices / POS
  POS_VIEW: 'pos:view',
  POS_CREATE: 'pos:create',
  POS_REFUND: 'pos:refund',

  // Packages
  PACKAGES_VIEW: 'packages:view',
  PACKAGES_MANAGE: 'packages:manage',

  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',

  // Staff
  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',
  PAYROLL_VIEW: 'payroll:view',
  PAYROLL_MANAGE: 'payroll:manage',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Marketing
  MARKETING_VIEW: 'marketing:view',
  MARKETING_MANAGE: 'marketing:manage',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
  ROLES_MANAGE: 'roles:manage',
  SUBSCRIPTION_MANAGE: 'subscription:manage',
} as const;

// Role-permission mapping (default)
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: Object.values(PERMISSIONS),
  MANAGER: Object.values(PERMISSIONS).filter((p) => !p.startsWith('subscription:')),
  RECEPTION: [
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.APPOINTMENTS_CREATE,
    PERMISSIONS.APPOINTMENTS_EDIT,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.POS_VIEW,
    PERMISSIONS.POS_CREATE,
    PERMISSIONS.PACKAGES_VIEW,
    PERMISSIONS.SERVICES_VIEW,
    PERMISSIONS.MARKETING_VIEW,
  ],
  STAFF: [
    PERMISSIONS.APPOINTMENTS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.SERVICES_VIEW,
  ],
  ACCOUNTANT: [
    PERMISSIONS.POS_VIEW,
    PERMISSIONS.POS_CREATE,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  roles: Array<{
    key: string;
    name: string;
    branchId: string | null;
  }>;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}

export async function requirePermission(
  permissionKey: string,
  branchId?: string,
): Promise<SessionUser> {
  const user = await requireAuth();
  if (!user.tenantId) redirect('/onboarding');

  // Owner has all permissions
  const isOwner = user.roles.some((r) => r.key === 'OWNER');
  if (isOwner) return user;

  // Check if user has the permission through any of their roles
  const userRoleKeys = user.roles
    .filter((r) => !branchId || !r.branchId || r.branchId === branchId)
    .map((r) => r.key);

  const hasPermission = userRoleKeys.some((roleKey) => {
    const permissions = DEFAULT_ROLE_PERMISSIONS[roleKey] || [];
    return permissions.includes(permissionKey);
  });

  if (!hasPermission) {
    throw new Error('Forbidden: insufficient permissions');
  }

  return user;
}

export function hasPermission(user: SessionUser, permissionKey: string, branchId?: string): boolean {
  const isOwner = user.roles.some((r) => r.key === 'OWNER');
  if (isOwner) return true;

  const userRoleKeys = user.roles
    .filter((r) => !branchId || !r.branchId || r.branchId === branchId)
    .map((r) => r.key);

  return userRoleKeys.some((roleKey) => {
    const permissions = DEFAULT_ROLE_PERMISSIONS[roleKey] || [];
    return permissions.includes(permissionKey);
  });
}

export async function getUserBranches(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });
  if (!user?.tenantId) return [];
  const branches = await prisma.branch.findMany({
    where: { tenantId: user.tenantId, active: true },
  });
  return branches;
}
