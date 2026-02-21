'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requirePermission, getUserBranches } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function getMessageTemplates() {
  const user = await requireAuth();
  return prisma.messageTemplate.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function createMessageTemplate(formData: FormData) {
  const user = await requirePermission('marketing:write');
  const name = formData.get('name') as string;
  const channel = formData.get('channel') as string;
  const content = formData.get('body') as string;

  if (!name || !content) return { error: 'Name and content are required' };

  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');

  try {
    await prisma.messageTemplate.create({
      data: {
        key,
        name,
        channel: channel as any,
        content,
        tenantId: user.tenantId,
      },
    });
    revalidatePath('/app/marketing');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to create template' };
  }
}

export async function deleteTemplate(id: string) {
  const user = await requirePermission('marketing:write');
  try {
    await prisma.messageTemplate.delete({ where: { id } });
    revalidatePath('/app/marketing');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to delete template' };
  }
}

export async function getCampaigns() {
  const user = await requireAuth();
  return prisma.campaign.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createCampaign(formData: FormData) {
  const user = await requirePermission('marketing:write');
  const name = formData.get('name') as string;
  const channel = formData.get('channel') as string;
  const segmentKey = formData.get('audience') as string;
  const scheduledAt = formData.get('scheduledAt') as string;

  if (!name || !channel) return { error: 'Name and channel are required' };

  try {
    await prisma.campaign.create({
      data: {
        name,
        channel: channel as any,
        segmentKey: segmentKey || 'all',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'DRAFT',
        tenantId: user.tenantId,
      },
    });
    revalidatePath('/app/marketing');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to create campaign' };
  }
}

export async function getReviewLinks() {
  const user = await requireAuth();
  return prisma.reviewLink.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { platform: 'asc' },
  });
}

export async function createReviewLink(formData: FormData) {
  const user = await requirePermission('marketing:write');
  const platform = formData.get('platform') as string;
  const url = formData.get('url') as string;
  const branchId = formData.get('branchId') as string;

  if (!platform || !url || !branchId) return { error: 'Platform, URL and branch are required' };

  try {
    await prisma.reviewLink.create({
      data: {
        platform,
        url,
        branchId,
        tenantId: user.tenantId,
      },
    });
    revalidatePath('/app/marketing');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to create review link' };
  }
}

export async function deleteReviewLink(id: string) {
  const user = await requirePermission('marketing:write');
  try {
    await prisma.reviewLink.delete({ where: { id } });
    revalidatePath('/app/marketing');
    return { success: true };
  } catch (err) {
    return { error: 'Failed to delete' };
  }
}
