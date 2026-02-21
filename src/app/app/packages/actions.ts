'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { packageSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function getPackages() {
  const user = await requirePermission(PERMISSIONS.PACKAGES_VIEW);
  return prisma.package.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function createPackage(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.PACKAGES_MANAGE);
  const data = {
    name: formData.get('name') as string,
    price: Number(formData.get('price')),
    validityDays: Number(formData.get('validityDays')) || 365,
    sessionsTotal: Number(formData.get('sessionsTotal')) || 10,
    includesJson: (formData.get('includesJson') as string) || '[]',
    autoRenew: formData.get('autoRenew') === 'true',
    active: true,
  };
  const parsed = packageSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const pkg = await prisma.package.create({
    data: { ...parsed.data, tenantId: user.tenantId },
  });
  revalidatePath('/app/packages');
  return { success: true, package: pkg };
}

export async function getCustomerPackages() {
  const user = await requirePermission(PERMISSIONS.PACKAGES_VIEW);
  return prisma.customerPackage.findMany({
    where: { tenantId: user.tenantId },
    include: { customer: true, package: true, branch: true },
    orderBy: { purchasedAt: 'desc' },
  });
}

export async function sellPackage(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.PACKAGES_MANAGE);
  const branchId = formData.get('branchId') as string;
  const customerId = formData.get('customerId') as string;
  const packageId = formData.get('packageId') as string;

  const pkg = await prisma.package.findFirst({ where: { id: packageId, tenantId: user.tenantId } });
  if (!pkg) return { error: 'Package not found' };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + pkg.validityDays);

  const cp = await prisma.customerPackage.create({
    data: {
      tenantId: user.tenantId,
      branchId,
      customerId,
      packageId,
      expiresAt,
      sessionsRemaining: pkg.sessionsTotal,
      status: 'ACTIVE',
    },
  });
  revalidatePath('/app/packages');
  return { success: true, customerPackage: cp };
}

export async function deletePackage(id: string) {
  const user = await requirePermission(PERMISSIONS.PACKAGES_MANAGE);
  await prisma.package.delete({ where: { id, tenantId: user.tenantId } });
  revalidatePath('/app/packages');
  return { success: true };
}
