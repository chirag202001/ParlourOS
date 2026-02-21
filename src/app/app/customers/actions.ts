'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { customerSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function getCustomers(search?: string) {
  const user = await requirePermission(PERMISSIONS.CUSTOMERS_VIEW);
  return prisma.customer.findMany({
    where: {
      tenantId: user.tenantId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { phone: { contains: search } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getCustomer(id: string) {
  const user = await requirePermission(PERMISSIONS.CUSTOMERS_VIEW);
  return prisma.customer.findFirst({
    where: { id, tenantId: user.tenantId },
    include: {
      appointments: { orderBy: { startAt: 'desc' }, take: 10 },
      invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      customerPackages: { include: { package: true } },
    },
  });
}

export async function createCustomer(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.CUSTOMERS_CREATE);

  const data = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || undefined,
    gender: (formData.get('gender') as string) || undefined,
    dob: (formData.get('dob') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    allergies: (formData.get('allergies') as string) || undefined,
    whatsappOptIn: formData.get('whatsappOptIn') === 'true',
    smsOptIn: formData.get('smsOptIn') === 'true',
    emailOptIn: formData.get('emailOptIn') === 'true',
  };

  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const customer = await prisma.customer.create({
    data: {
      tenantId: user.tenantId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      gender: parsed.data.gender as any,
      dob: parsed.data.dob ? new Date(parsed.data.dob) : null,
      notes: parsed.data.notes || null,
      allergies: parsed.data.allergies || null,
      whatsappOptIn: parsed.data.whatsappOptIn,
      smsOptIn: parsed.data.smsOptIn,
      emailOptIn: parsed.data.emailOptIn,
    },
  });

  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'CREATE',
    entity: 'Customer',
    entityId: customer.id,
  });

  revalidatePath('/app/customers');
  return { success: true, customer };
}

export async function updateCustomer(id: string, formData: FormData) {
  const user = await requirePermission(PERMISSIONS.CUSTOMERS_EDIT);

  const data = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: (formData.get('email') as string) || undefined,
    gender: (formData.get('gender') as string) || undefined,
    dob: (formData.get('dob') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    allergies: (formData.get('allergies') as string) || undefined,
    whatsappOptIn: formData.get('whatsappOptIn') === 'true',
    smsOptIn: formData.get('smsOptIn') === 'true',
    emailOptIn: formData.get('emailOptIn') === 'true',
  };

  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.customer.update({
    where: { id, tenantId: user.tenantId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      gender: parsed.data.gender as any,
      dob: parsed.data.dob ? new Date(parsed.data.dob) : null,
      notes: parsed.data.notes || null,
      allergies: parsed.data.allergies || null,
      whatsappOptIn: parsed.data.whatsappOptIn,
      smsOptIn: parsed.data.smsOptIn,
      emailOptIn: parsed.data.emailOptIn,
    },
  });

  revalidatePath('/app/customers');
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const user = await requirePermission(PERMISSIONS.CUSTOMERS_DELETE);
  await prisma.customer.delete({ where: { id, tenantId: user.tenantId } });
  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'DELETE',
    entity: 'Customer',
    entityId: id,
  });
  revalidatePath('/app/customers');
  return { success: true };
}
