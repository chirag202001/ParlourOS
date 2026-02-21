'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { createInvoiceSchema, paymentSchema, refundSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';
import { generateInvoiceNumber, computeGST } from '@/lib/utils';

export async function getInvoices() {
  const user = await requirePermission(PERMISSIONS.POS_VIEW);
  return prisma.invoice.findMany({
    where: { tenantId: user.tenantId },
    include: {
      customer: true,
      branch: { select: { id: true, name: true } },
      lineItems: true,
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function createInvoice(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.POS_CREATE);

  const rawItems = formData.get('lineItems') as string;
  let lineItems: any[] = [];
  try {
    lineItems = JSON.parse(rawItems);
  } catch {
    return { error: 'Invalid line items' };
  }

  const data = {
    branchId: formData.get('branchId') as string,
    customerId: (formData.get('customerId') as string) || undefined,
    type: (formData.get('type') as string) || 'TAX',
    discount: Number(formData.get('discount')) || 0,
    notes: (formData.get('notes') as string) || undefined,
    lineItems,
  };

  const parsed = createInvoiceSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Compute amounts
  let subtotal = 0;
  let totalTax = 0;
  const computedItems = parsed.data.lineItems.map((item) => {
    const lineAmount = item.qty * item.unitPrice;
    const gst = computeGST(lineAmount, item.gstRate);
    subtotal += lineAmount;
    totalTax += gst.totalTax;
    return {
      ...item,
      amount: lineAmount,
    };
  });

  const total = subtotal - parsed.data.discount + totalTax;
  const invoiceNumber = generateInvoiceNumber('INV');

  const invoice = await prisma.invoice.create({
    data: {
      tenantId: user.tenantId,
      branchId: parsed.data.branchId,
      customerId: parsed.data.customerId || null,
      number: invoiceNumber,
      type: parsed.data.type as any,
      status: 'UNPAID',
      subtotal,
      discount: parsed.data.discount,
      tax: totalTax,
      total,
      notes: parsed.data.notes || null,
      lineItems: {
        create: computedItems.map((item) => ({
          type: item.type as any,
          refId: item.refId || null,
          name: item.name,
          qty: item.qty,
          unitPrice: item.unitPrice,
          gstRate: item.gstRate,
          amount: item.amount,
        })),
      },
    },
    include: { lineItems: true },
  });

  // Reduce stock for product items
  for (const item of computedItems) {
    if (item.type === 'PRODUCT' && item.refId) {
      await prisma.stockLedger.create({
        data: {
          tenantId: user.tenantId,
          branchId: parsed.data.branchId,
          productId: item.refId,
          changeQty: -item.qty,
          reason: 'SALE',
          refId: invoice.id,
        },
      });
    }
  }

  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'CREATE',
    entity: 'Invoice',
    entityId: invoice.id,
    meta: { number: invoiceNumber, total },
  });

  revalidatePath('/app/pos');
  return { success: true, invoice };
}

export async function recordPayment(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.POS_CREATE);

  const data = {
    invoiceId: formData.get('invoiceId') as string,
    method: formData.get('method') as string,
    amount: Number(formData.get('amount')),
    txnRef: (formData.get('txnRef') as string) || undefined,
  };

  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  // Get invoice
  const invoice = await prisma.invoice.findFirst({
    where: { id: parsed.data.invoiceId, tenantId: user.tenantId },
    include: { payments: true },
  });

  if (!invoice) return { error: 'Invoice not found' };

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + parsed.data.amount;

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        invoiceId: parsed.data.invoiceId,
        method: parsed.data.method as any,
        amount: parsed.data.amount,
        txnRef: parsed.data.txnRef || null,
        status: 'SUCCESS',
      },
    }),
    prisma.invoice.update({
      where: { id: parsed.data.invoiceId },
      data: {
        status: totalPaid >= invoice.total ? 'PAID' : 'PARTIAL',
      },
    }),
  ]);

  revalidatePath('/app/pos');
  return { success: true };
}

export async function createRefund(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.POS_REFUND);

  const data = {
    invoiceId: formData.get('invoiceId') as string,
    amount: Number(formData.get('amount')),
    reason: (formData.get('reason') as string) || undefined,
    method: formData.get('method') as string,
  };

  const parsed = refundSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  await prisma.$transaction([
    prisma.refund.create({
      data: {
        invoiceId: parsed.data.invoiceId,
        amount: parsed.data.amount,
        reason: parsed.data.reason || null,
        method: parsed.data.method as any,
        status: 'PROCESSED',
      },
    }),
    prisma.invoice.update({
      where: { id: parsed.data.invoiceId },
      data: { status: 'REFUNDED' },
    }),
  ]);

  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    action: 'REFUND',
    entity: 'Invoice',
    entityId: parsed.data.invoiceId,
    meta: { amount: parsed.data.amount, reason: parsed.data.reason },
  });

  revalidatePath('/app/pos');
  return { success: true };
}

export async function getServicesForPOS() {
  const user = await requirePermission(PERMISSIONS.POS_VIEW);
  return prisma.service.findMany({
    where: { tenantId: user.tenantId, active: true },
    orderBy: { name: 'asc' },
  });
}

export async function getProductsForPOS() {
  const user = await requirePermission(PERMISSIONS.POS_VIEW);
  return prisma.product.findMany({
    where: { tenantId: user.tenantId, active: true, type: 'RETAIL' },
    orderBy: { name: 'asc' },
  });
}

export async function getCustomersForPOS() {
  const user = await requirePermission(PERMISSIONS.POS_VIEW);
  return prisma.customer.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true, name: true, phone: true },
    orderBy: { name: 'asc' },
    take: 200,
  });
}

export async function getBranchesForPOS() {
  const user = await requirePermission(PERMISSIONS.POS_VIEW);
  return prisma.branch.findMany({
    where: { tenantId: user.tenantId, active: true },
  });
}
