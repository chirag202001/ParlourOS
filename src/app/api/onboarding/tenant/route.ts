import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createTenantSchema } from '@/lib/validations';
import { slugify } from '@/lib/utils';
import { DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTenantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, ownerName, email, password, phone } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const slug = slugify(name) + '-' + Date.now().toString(36);

    // Create tenant, owner user, default roles, and permissions in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: { name, slug },
      });

      // 2. Create user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          phone: phone || null,
          passwordHash,
          name: ownerName,
          status: 'ACTIVE',
        },
      });

      // 3. Create default roles
      const roleKeys = ['OWNER', 'MANAGER', 'RECEPTION', 'STAFF', 'ACCOUNTANT'];
      const roles = await Promise.all(
        roleKeys.map((key) =>
          tx.role.create({
            data: {
              tenantId: tenant.id,
              key,
              name: key.charAt(0) + key.slice(1).toLowerCase(),
            },
          }),
        ),
      );

      // 4. Create permissions (global, not tenant-specific)
      const allPermKeys = Object.values(PERMISSIONS);
      for (const permKey of allPermKeys) {
        await tx.permission.upsert({
          where: { key: permKey },
          update: {},
          create: {
            key: permKey,
            description: permKey.replace(':', ' ').replace(/_/g, ' '),
            module: permKey.split(':')[0],
          },
        });
      }

      // 5. Create role-permission mappings
      for (const role of roles) {
        const perms = DEFAULT_ROLE_PERMISSIONS[role.key] || [];
        for (const permKey of perms) {
          const perm = await tx.permission.findUnique({ where: { key: permKey } });
          if (perm) {
            await tx.rolePermission.create({
              data: { roleId: role.id, permissionId: perm.id },
            });
          }
        }
      }

      // 6. Assign OWNER role to user
      const ownerRole = roles.find((r) => r.key === 'OWNER')!;
      await tx.userRole.create({
        data: {
          userId: user.id,
          roleId: ownerRole.id,
          branchId: null,
        },
      });

      // 7. Create subscription (trial)
      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planKey: 'STARTER',
          status: 'TRIALING',
          provider: 'razorpay',
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
      });

      return { tenantId: tenant.id, userId: user.id };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
