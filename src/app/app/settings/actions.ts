'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requirePermission, getUserBranches } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';
import { PLANS } from '@/lib/plans';

// ── Tenant / Business Settings ──────────────────────────────────

export async function getTenantSettings() {
  const user = await requirePermission('settings:read');
  return prisma.tenant.findUnique({
    where: { id: user.tenantId },
    include: {
      branches: { orderBy: { name: 'asc' } },
      subscriptions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
}

export async function updateTenantSettings(formData: FormData) {
  const user = await requirePermission('settings:write');
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const gstin = formData.get('gstin') as string;
  const taxRate = parseFloat(formData.get('taxRate') as string) || 18;

  try {
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { name, phone, email, gstin, taxRate },
    });
    revalidatePath('/app/settings');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to update settings' };
  }
}

// ── Branch Management ───────────────────────────────────────────

export async function createBranch(formData: FormData) {
  const user = await requirePermission('settings:write');
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const phone = formData.get('phone') as string;
  const openTime = formData.get('openTime') as string;
  const closeTime = formData.get('closeTime') as string;

  if (!name) return { error: 'Branch name is required' };

  // Check plan limits
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    include: { subscriptions: { orderBy: { createdAt: 'desc' as const }, take: 1 }, branches: true },
  });

  const subscription = tenant?.subscriptions?.[0];
  if (subscription) {
    const plan = PLANS[subscription.planKey as keyof typeof PLANS];
    if (plan && tenant.branches.length >= plan.maxBranches) {
      return { error: `Your plan allows max ${plan.maxBranches} branch(es). Upgrade to add more.` };
    }
  }

  try {
    await prisma.branch.create({
      data: {
        name,
        address: address || '',
        city: city || '',
        phone: phone || '',
        openTime: openTime || '09:00',
        closeTime: closeTime || '21:00',
        tenantId: user.tenantId,
      },
    });
    revalidatePath('/app/settings');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to create branch' };
  }
}

export async function updateBranch(formData: FormData) {
  const user = await requirePermission('settings:write');
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const city = formData.get('city') as string;
  const phone = formData.get('phone') as string;
  const openTime = formData.get('openTime') as string;
  const closeTime = formData.get('closeTime') as string;

  try {
    await prisma.branch.updateMany({
      where: { id, tenantId: user.tenantId },
      data: { name, address, city, phone, openTime, closeTime },
    });
    revalidatePath('/app/settings');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to update branch' };
  }
}

export async function deleteBranch(id: string) {
  const user = await requirePermission('settings:write');
  try {
    await prisma.branch.delete({ where: { id } });
    revalidatePath('/app/settings');
    return { success: true };
  } catch (err) {
    return { error: 'Cannot delete branch with existing data' };
  }
}

// ── Role Management ─────────────────────────────────────────────

export async function getRoles() {
  const user = await requireAuth();
  return prisma.role.findMany({
    where: { tenantId: user.tenantId },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { userRoles: true } },
    },
    orderBy: { name: 'asc' },
  });
}

// ── Subscription ────────────────────────────────────────────────

export async function getSubscription() {
  const user = await requireAuth();
  const sub = await prisma.subscription.findFirst({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
  });
  return sub;
}

export async function updateSubscriptionPlan(plan: string) {
  const user = await requirePermission('subscription:write');
  try {
    const sub = await prisma.subscription.findFirst({
      where: { tenantId: user.tenantId },
    });

    if (sub) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          planKey: plan,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          tenantId: user.tenantId,
          planKey: plan,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    revalidatePath('/app/settings');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to update subscription' };
  }
}

// ── Invoice Settings ────────────────────────────────────────────

export async function updateInvoiceSettings(formData: FormData) {
  const user = await requirePermission('settings:write');
  const invoicePrefix = formData.get('invoicePrefix') as string;
  const invoiceFooter = formData.get('invoiceFooter') as string;

  try {
    await prisma.tenant.update({
      where: { id: user.tenantId },
      data: { invoicePrefix, invoiceFooter },
    });
    revalidatePath('/app/settings');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to update invoice settings' };
  }
}
