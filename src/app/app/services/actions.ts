'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { serviceSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function getServices() {
  const user = await requirePermission(PERMISSIONS.SERVICES_VIEW);
  return prisma.service.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function createService(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.SERVICES_MANAGE);

  const data = {
    name: formData.get('name') as string,
    category: formData.get('category') as string || 'General',
    durationMins: Number(formData.get('durationMins')) || 30,
    price: Number(formData.get('price')) || 0,
    gstRate: Number(formData.get('gstRate')) || 18,
    active: formData.get('active') !== 'false',
  };

  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const service = await prisma.service.create({
    data: { ...parsed.data, tenantId: user.tenantId },
  });

  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'CREATE',
    entity: 'Service',
    entityId: service.id,
  });

  revalidatePath('/app/services');
  return { success: true, service };
}

export async function updateService(id: string, formData: FormData) {
  const user = await requirePermission(PERMISSIONS.SERVICES_MANAGE);

  const data = {
    name: formData.get('name') as string,
    category: formData.get('category') as string || 'General',
    durationMins: Number(formData.get('durationMins')) || 30,
    price: Number(formData.get('price')) || 0,
    gstRate: Number(formData.get('gstRate')) || 18,
    active: formData.get('active') !== 'false',
  };

  const parsed = serviceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.service.update({
    where: { id, tenantId: user.tenantId },
    data: parsed.data,
  });

  revalidatePath('/app/services');
  return { success: true };
}

export async function deleteService(id: string) {
  const user = await requirePermission(PERMISSIONS.SERVICES_MANAGE);

  await prisma.service.delete({
    where: { id, tenantId: user.tenantId },
  });

  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'DELETE',
    entity: 'Service',
    entityId: id,
  });

  revalidatePath('/app/services');
  return { success: true };
}
