'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { productSchema, vendorSchema, purchaseSchema } from '@/lib/validations';
import { createAuditLog } from '@/lib/audit';

export async function getProducts() {
  const user = await requirePermission(PERMISSIONS.INVENTORY_VIEW);
  return prisma.product.findMany({
    where: { tenantId: user.tenantId },
    include: { vendor: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function getProductStock(productId: string, branchId: string) {
  const user = await requirePermission(PERMISSIONS.INVENTORY_VIEW);
  const result = await prisma.stockLedger.aggregate({
    where: { tenantId: user.tenantId, branchId, productId },
    _sum: { changeQty: true },
  });
  return result._sum.changeQty || 0;
}

export async function getStockSummary() {
  const user = await requirePermission(PERMISSIONS.INVENTORY_VIEW);
  const branches = await prisma.branch.findMany({ where: { tenantId: user.tenantId, active: true } });
  const products = await prisma.product.findMany({ where: { tenantId: user.tenantId } });

  const stockData = await Promise.all(
    products.map(async (product) => {
      const stocks = await Promise.all(
        branches.map(async (branch) => {
          const result = await prisma.stockLedger.aggregate({
            where: { tenantId: user.tenantId, branchId: branch.id, productId: product.id },
            _sum: { changeQty: true },
          });
          return { branchId: branch.id, branchName: branch.name, qty: result._sum.changeQty || 0 };
        }),
      );
      const totalStock = stocks.reduce((sum, s) => sum + s.qty, 0);
      return { ...product, stocks, totalStock, lowStock: totalStock <= product.reorderLevel };
    }),
  );
  return stockData;
}

export async function createProduct(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.INVENTORY_MANAGE);
  const data = {
    name: formData.get('name') as string,
    type: (formData.get('type') as string) || 'RETAIL',
    unit: (formData.get('unit') as string) || 'pcs',
    costPrice: Number(formData.get('costPrice')) || 0,
    sellingPrice: Number(formData.get('sellingPrice')) || 0,
    gstRate: Number(formData.get('gstRate')) || 18,
    reorderLevel: Number(formData.get('reorderLevel')) || 5,
    vendorId: (formData.get('vendorId') as string) || undefined,
    trackExpiry: formData.get('trackExpiry') === 'true',
    active: true,
  };
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const product = await prisma.product.create({
    data: { ...parsed.data, tenantId: user.tenantId, vendorId: parsed.data.vendorId || null },
  });
  revalidatePath('/app/inventory');
  return { success: true, product };
}

export async function getVendors() {
  const user = await requirePermission(PERMISSIONS.INVENTORY_VIEW);
  return prisma.vendor.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { name: 'asc' },
  });
}

export async function createVendor(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.INVENTORY_MANAGE);
  const data = {
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
  };
  const parsed = vendorSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const vendor = await prisma.vendor.create({
    data: { tenantId: user.tenantId, name: parsed.data.name, phone: parsed.data.phone || '', email: parsed.data.email || null, address: parsed.data.address || '' },
  });
  revalidatePath('/app/inventory');
  return { success: true, vendor };
}

export async function createPurchase(formData: FormData) {
  const user = await requirePermission(PERMISSIONS.INVENTORY_MANAGE);
  const rawItems = formData.get('items') as string;
  let items: any[] = [];
  try { items = JSON.parse(rawItems); } catch { return { error: 'Invalid items' }; }

  const data = {
    branchId: formData.get('branchId') as string,
    vendorId: formData.get('vendorId') as string,
    invoiceNo: (formData.get('invoiceNo') as string) || undefined,
    items,
  };
  const parsed = purchaseSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const total = parsed.data.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);

  const purchase = await prisma.purchase.create({
    data: {
      tenantId: user.tenantId,
      branchId: parsed.data.branchId,
      vendorId: parsed.data.vendorId,
      invoiceNo: parsed.data.invoiceNo || null,
      total,
      items: {
        create: parsed.data.items.map((item) => ({
          productId: item.productId,
          qty: item.qty,
          unitCost: item.unitCost,
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          batchNo: item.batchNo || null,
        })),
      },
    },
  });

  // Add to stock ledger
  for (const item of parsed.data.items) {
    await prisma.stockLedger.create({
      data: {
        tenantId: user.tenantId,
        branchId: parsed.data.branchId,
        productId: item.productId,
        changeQty: item.qty,
        reason: 'PURCHASE',
        refId: purchase.id,
      },
    });
  }

  revalidatePath('/app/inventory');
  return { success: true, purchase };
}

export async function deleteProduct(id: string) {
  const user = await requirePermission(PERMISSIONS.INVENTORY_MANAGE);
  await prisma.product.delete({ where: { id, tenantId: user.tenantId } });
  revalidatePath('/app/inventory');
  return { success: true };
}
