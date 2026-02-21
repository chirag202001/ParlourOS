import { prisma } from '@/lib/db';

type AuditAction = string;

export async function createAuditLog(params: {
  tenantId: string;
  userId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      tenantId: params.tenantId,
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metaJson: params.meta ? JSON.stringify(params.meta) : null,
    },
  });
}
