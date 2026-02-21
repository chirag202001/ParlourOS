'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { appointmentSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function getAppointments(date?: string) {
  const user = await requirePermission(PERMISSIONS.APPOINTMENTS_VIEW);
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.appointment.findMany({
    where: {
      tenantId: user.tenantId,
      startAt: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      customer: true,
      staff: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true } },
    },
    orderBy: { startAt: 'asc' },
  });
}

export async function getAllAppointments() {
  const user = await requirePermission(PERMISSIONS.APPOINTMENTS_VIEW);
  return prisma.appointment.findMany({
    where: { tenantId: user.tenantId },
    include: {
      customer: true,
      staff: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true } },
    },
    orderBy: { startAt: 'desc' },
    take: 100,
  });
}

export async function createAppointment(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.APPOINTMENTS_CREATE);

  const data = {
    branchId: formData.get('branchId') as string,
    customerId: (formData.get('customerId') as string) || undefined,
    customerName: formData.get('customerName') as string,
    customerPhone: formData.get('customerPhone') as string,
    startAt: formData.get('startAt') as string,
    endAt: formData.get('endAt') as string,
    staffUserId: (formData.get('staffUserId') as string) || undefined,
    notes: (formData.get('notes') as string) || undefined,
    source: (formData.get('source') as string) || 'WALKIN',
    depositAmount: Number(formData.get('depositAmount')) || 0,
    status: 'BOOKED' as const,
  };

  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const appointment = await prisma.appointment.create({
    data: {
      tenantId: user.tenantId,
      branchId: parsed.data.branchId,
      customerId: parsed.data.customerId || null,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      staffUserId: parsed.data.staffUserId || null,
      notes: parsed.data.notes || null,
      source: parsed.data.source as any,
      depositAmount: parsed.data.depositAmount,
      status: 'BOOKED',
    },
  });

  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'CREATE',
    entity: 'Appointment',
    entityId: appointment.id,
  });

  revalidatePath('/app/appointments');
  return { success: true, appointment };
}

export async function updateAppointmentStatus(id: string, status: string) {
  const user = await requirePermission(PERMISSIONS.APPOINTMENTS_EDIT);

  await prisma.appointment.update({
    where: { id, tenantId: user.tenantId },
    data: { status: status as any },
  });

  revalidatePath('/app/appointments');
  return { success: true };
}

export async function deleteAppointment(id: string) {
  const user = await requirePermission(PERMISSIONS.APPOINTMENTS_DELETE);
  await prisma.appointment.delete({ where: { id, tenantId: user.tenantId } });
  revalidatePath('/app/appointments');
  return { success: true };
}

export async function getBranches() {
  const user = await requirePermission(PERMISSIONS.APPOINTMENTS_VIEW);
  return prisma.branch.findMany({ where: { tenantId: user.tenantId, active: true } });
}

export async function getStaff() {
  const user = await requirePermission(PERMISSIONS.APPOINTMENTS_VIEW);
  return prisma.user.findMany({
    where: { tenantId: user.tenantId, status: 'ACTIVE' },
    select: { id: true, name: true, email: true },
  });
}
