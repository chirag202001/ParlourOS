'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requirePermission, getUserBranches } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function getStaffMembers() {
  const user = await requireAuth();
  const branches = await getUserBranches(user.id);
  const branchIds = branches.map((b) => b.id);

  const staff = await prisma.user.findMany({
    where: {
      tenantId: user.tenantId,
      branches: { some: { id: { in: branchIds } } },
    },
    include: {
      staffProfile: true,
      branches: { select: { id: true, name: true } },
      userRoles: { include: { role: true } },
    },
    orderBy: { name: 'asc' },
  });

  return staff;
}

export async function getStaffMember(id: string) {
  const user = await requireAuth();
  return prisma.user.findFirst({
    where: { id, tenantId: user.tenantId },
    include: {
      staffProfile: true,
      branches: true,
      userRoles: { include: { role: true } },
    },
  });
}

export async function createStaffMember(formData: FormData) {
  const user = await requirePermission('staff:write');
  const bcrypt = await import('bcryptjs');

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const role = (formData.get('role') as string) || 'STAFF';
  const branchId = formData.get('branchId') as string;
  const designation = formData.get('designation') as string;
  const joiningDate = formData.get('joiningDate') as string;
  const baseSalary = parseFloat(formData.get('baseSalary') as string) || 0;
  const commissionPct = parseFloat(formData.get('commissionPct') as string) || 0;

  if (!name || !email) return { error: 'Name and email are required' };

  try {
    const existing = await prisma.user.findFirst({
      where: { email, tenantId: user.tenantId },
    });
    if (existing) return { error: 'A user with this email already exists' };

    const hashedPassword = await bcrypt.hash('password123', 12);

    const roleRecord = await prisma.role.findFirst({
      where: { tenantId: user.tenantId, name: role },
    });

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        tenantId: user.tenantId,
        branches: branchId ? { connect: { id: branchId } } : undefined,
        staffProfile: {
          create: {
            designation: designation || role,
            joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
            baseSalary,
            commissionPct,
            tenantId: user.tenantId,
          },
        },
        userRoles: roleRecord
          ? {
              create: {
                roleId: roleRecord.id,
                branchId: branchId || undefined,
              },
            }
          : undefined,
      },
    });

    revalidatePath('/app/staff');
    return { success: true, id: newUser.id };
  } catch (err) {
    return { error: 'Failed to create staff member' };
  }
}

export async function updateStaffProfile(formData: FormData) {
  const user = await requirePermission('staff:write');
  const userId = formData.get('userId') as string;
  const designation = formData.get('designation') as string;
  const baseSalary = parseFloat(formData.get('baseSalary') as string) || 0;
  const commissionPct = parseFloat(formData.get('commissionPct') as string) || 0;

  try {
    await prisma.staffProfile.updateMany({
      where: { userId, tenantId: user.tenantId },
      data: { designation, baseSalary, commissionPct },
    });
    revalidatePath('/app/staff');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to update staff profile' };
  }
}

export async function getAttendance(date?: string) {
  const user = await requireAuth();
  const branches = await getUserBranches(user.id);
  const branchIds = branches.map((b) => b.id);
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  return prisma.attendance.findMany({
    where: {
      tenantId: user.tenantId,
      branchId: { in: branchIds },
      date: { gte: startOfDay, lte: endOfDay },
    },
    include: { staff: { select: { id: true, name: true, email: true } } },
    orderBy: { date: 'desc' },
  });
}

export async function markAttendance(formData: FormData) {
  const user = await requirePermission('staff:write');
  const userId = formData.get('userId') as string;
  const branchId = formData.get('branchId') as string;
  const status = formData.get('status') as string;
  const date = formData.get('date') as string;

  try {
    const targetDate = date ? new Date(date) : new Date();

    const existing = await prisma.attendance.findFirst({
      where: {
        staffUserId: userId,
        tenantId: user.tenantId,
        date: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lte: new Date(targetDate.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existing) {
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: status as any, checkIn: new Date() },
      });
    } else {
      await prisma.attendance.create({
        data: {
          staffUserId: userId,
          branchId,
          tenantId: user.tenantId,
          date: new Date(),
          status: status as any,
          checkIn: status === 'PRESENT' || status === 'HALF_DAY' ? new Date() : null,
        },
      });
    }

    revalidatePath('/app/staff');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to mark attendance' };
  }
}

export async function deleteStaffMember(id: string) {
  const user = await requirePermission('staff:write');
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/app/staff');
    return { success: true };
  } catch (err) {
    return { error: 'Cannot delete staff member with existing records' };
  }
}

export async function getBranches() {
  const user = await requireAuth();
  return getUserBranches(user.id);
}

export async function getRoles() {
  const user = await requireAuth();
  return prisma.role.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  });
}
