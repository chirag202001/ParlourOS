'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { requirePermission } from '@/lib/rbac';
import { validateImportData, IMPORT_SCHEMAS, type ValidationResult } from '@/lib/import-utils';
import bcrypt from 'bcryptjs';

// ─── Helper ─────────────────────────────────────────────────────────────────────

async function getSessionContext() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Not authenticated');
  const user = session.user as any;
  return {
    userId: user.id as string,
    tenantId: user.tenantId as string,
  };
}

// ─── Validate (preview before import) ───────────────────────────────────────────

export async function validateImport(
  type: string,
  rows: Record<string, string>[],
): Promise<ValidationResult> {
  await requirePermission('settings:write');
  return validateImportData(type, rows);
}

// ─── Import Customers ───────────────────────────────────────────────────────────

async function importCustomers(tenantId: string, data: Record<string, any>[]) {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of data) {
    try {
      // Check for existing customer by phone
      const existing = await prisma.customer.findFirst({
        where: { tenantId, phone: row.phone },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.customer.create({
        data: {
          tenantId,
          name: row.name,
          phone: row.phone,
          email: row.email || null,
          gender: row.gender || null,
          dob: row.dob || null,
          notes: row.notes || null,
          allergies: row.allergies || null,
          whatsappOptIn: row.whatsappOptIn ?? false,
        },
      });
      created++;
    } catch (err: any) {
      errors.push(`Customer "${row.name}": ${err.message}`);
    }
  }

  return { created, skipped, errors };
}

// ─── Import Services ────────────────────────────────────────────────────────────

async function importServices(tenantId: string, data: Record<string, any>[]) {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of data) {
    try {
      // Check for duplicate by name + category
      const existing = await prisma.service.findFirst({
        where: { tenantId, name: row.name, category: row.category || 'General' },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.service.create({
        data: {
          tenantId,
          name: row.name,
          category: row.category || 'General',
          durationMins: row.durationMins ?? 30,
          price: row.price,
          gstRate: row.gstRate ?? 18,
          active: row.active ?? true,
        },
      });
      created++;
    } catch (err: any) {
      errors.push(`Service "${row.name}": ${err.message}`);
    }
  }

  return { created, skipped, errors };
}

// ─── Import Products ────────────────────────────────────────────────────────────

async function importProducts(tenantId: string, data: Record<string, any>[]) {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of data) {
    try {
      const existing = await prisma.product.findFirst({
        where: { tenantId, name: row.name },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.product.create({
        data: {
          tenantId,
          name: row.name,
          type: row.type || 'RETAIL',
          unit: row.unit || 'pcs',
          costPrice: row.costPrice ?? 0,
          sellingPrice: row.sellingPrice,
          gstRate: row.gstRate ?? 18,
          reorderLevel: row.reorderLevel ?? 5,
          active: row.active ?? true,
        },
      });
      created++;
    } catch (err: any) {
      errors.push(`Product "${row.name}": ${err.message}`);
    }
  }

  return { created, skipped, errors };
}

// ─── Import Vendors ─────────────────────────────────────────────────────────────

async function importVendors(tenantId: string, data: Record<string, any>[]) {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of data) {
    try {
      const existing = await prisma.vendor.findFirst({
        where: { tenantId, name: row.name },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.vendor.create({
        data: {
          tenantId,
          name: row.name,
          phone: row.phone || '',
          email: row.email || null,
          address: row.address || '',
          active: row.active ?? true,
        },
      });
      created++;
    } catch (err: any) {
      errors.push(`Vendor "${row.name}": ${err.message}`);
    }
  }

  return { created, skipped, errors };
}

// ─── Import Staff ───────────────────────────────────────────────────────────────

async function importStaff(tenantId: string, data: Record<string, any>[]) {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  // Default password for imported staff — they should change it on first login
  const defaultPassword = await bcrypt.hash('Welcome@123', 12);

  for (const row of data) {
    try {
      // Check for existing user by email
      const existing = await prisma.user.findFirst({
        where: { email: row.email.toLowerCase() },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Find the role
      const roleKey = (row.role || 'STAFF').toLowerCase();
      const role = await prisma.role.findFirst({
        where: { tenantId, key: roleKey },
      });

      // Create user + staff profile in a transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            tenantId,
            email: row.email.toLowerCase(),
            phone: row.phone || null,
            passwordHash: defaultPassword,
            name: row.name,
            status: 'ACTIVE',
          },
        });

        await tx.staffProfile.create({
          data: {
            userId: user.id,
            tenantId,
            designation: row.designation || '',
            baseSalary: row.baseSalary ?? 0,
            commissionPct: row.commissionPct ?? 0,
          },
        });

        // Assign role if found
        if (role) {
          await tx.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id,
              branchId: null,
            },
          });
        }
      });

      created++;
    } catch (err: any) {
      errors.push(`Staff "${row.name}" (${row.email}): ${err.message}`);
    }
  }

  return { created, skipped, errors };
}

// ─── Main Import Action ─────────────────────────────────────────────────────────

export interface ImportResult {
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
  message: string;
}

export async function executeImport(
  type: string,
  validatedData: Record<string, any>[],
): Promise<ImportResult> {
  await requirePermission('settings:write');
  const { tenantId } = await getSessionContext();

  if (!IMPORT_SCHEMAS[type]) {
    return { success: false, created: 0, skipped: 0, errors: [`Unknown import type: ${type}`], message: 'Invalid import type' };
  }

  if (validatedData.length === 0) {
    return { success: false, created: 0, skipped: 0, errors: ['No valid data to import'], message: 'No data' };
  }

  let result: { created: number; skipped: number; errors: string[] };

  switch (type) {
    case 'customers':
      result = await importCustomers(tenantId, validatedData);
      break;
    case 'services':
      result = await importServices(tenantId, validatedData);
      break;
    case 'products':
      result = await importProducts(tenantId, validatedData);
      break;
    case 'vendors':
      result = await importVendors(tenantId, validatedData);
      break;
    case 'staff':
      result = await importStaff(tenantId, validatedData);
      break;
    default:
      return { success: false, created: 0, skipped: 0, errors: [`Unknown type: ${type}`], message: 'Invalid type' };
  }

  const parts: string[] = [];
  if (result.created > 0) parts.push(`${result.created} ${IMPORT_SCHEMAS[type].label.toLowerCase()} imported`);
  if (result.skipped > 0) parts.push(`${result.skipped} duplicates skipped`);
  if (result.errors.length > 0) parts.push(`${result.errors.length} errors`);

  return {
    success: result.errors.length === 0,
    created: result.created,
    skipped: result.skipped,
    errors: result.errors,
    message: parts.join(', ') || 'Import completed',
  };
}

// ─── Get Import History (optional future feature placeholder) ────────────────────

export async function getImportStats() {
  await requirePermission('settings:read');
  const { tenantId } = await getSessionContext();

  const [customers, services, products, vendors, staff] = await Promise.all([
    prisma.customer.count({ where: { tenantId } }),
    prisma.service.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.vendor.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId } }),
  ]);

  return { customers, services, products, vendors, staff };
}
