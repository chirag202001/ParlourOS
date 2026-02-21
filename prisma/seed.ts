import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ParlourOS database...\n');

  // ── 1. Tenant ──────────────────────────────────────────────────

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Glamour Studio',
      slug: 'glamour-studio',
      phone: '+919876543210',
      email: 'hello@glamourstudio.in',
      gstin: '27AABCU9603R1ZM',
      taxRate: 18,
      invoicePrefix: 'GS',
      invoiceFooter: 'Thank you for visiting Glamour Studio! We look forward to seeing you again.',
    },
  });

  console.log('✅ Tenant created:', tenant.name);

  // ── 2. Branches ────────────────────────────────────────────────

  const branch1 = await prisma.branch.create({
    data: {
      name: 'Glamour Studio – Andheri',
      address: 'Shop 12, Crystal Mall, Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400058',
      phone: '+919876543211',
      openTime: '10:00',
      closeTime: '21:00',
      tenantId: tenant.id,
    },
  });

  const branch2 = await prisma.branch.create({
    data: {
      name: 'Glamour Studio – Bandra',
      address: '45, Hill Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      phone: '+919876543212',
      openTime: '09:00',
      closeTime: '21:00',
      tenantId: tenant.id,
    },
  });

  console.log('✅ 2 branches created');

  // ── 3. Roles & Permissions ─────────────────────────────────────

  const permissionKeys = [
    'services:read', 'services:write',
    'customers:read', 'customers:write',
    'appointments:read', 'appointments:write',
    'billing:read', 'billing:write',
    'billing:refund',
    'inventory:read', 'inventory:write',
    'staff:read', 'staff:write',
    'reports:read',
    'marketing:read', 'marketing:write',
    'settings:read', 'settings:write',
    'subscription:read', 'subscription:write',
    'packages:read', 'packages:write',
    'audit:read',
  ];

  const permissions = await Promise.all(
    permissionKeys.map((key) =>
      prisma.permission.create({ data: { key, description: key.replace(':', ' – ') } })
    )
  );

  const pMap = new Map(permissions.map((p) => [p.key, p]));

  const roleConfigs: Record<string, string[]> = {
    OWNER: permissionKeys,
    MANAGER: permissionKeys.filter((k) => !k.startsWith('subscription:')),
    RECEPTION: [
      'services:read', 'customers:read', 'customers:write',
      'appointments:read', 'appointments:write',
      'billing:read', 'billing:write',
      'packages:read', 'packages:write',
    ],
    STAFF: [
      'services:read', 'customers:read',
      'appointments:read',
    ],
    ACCOUNTANT: [
      'billing:read', 'reports:read',
      'inventory:read', 'packages:read',
    ],
  };

  const roles: Record<string, any> = {};

  for (const [roleName, permKeys] of Object.entries(roleConfigs)) {
    const role = await prisma.role.create({
      data: { key: roleName.toLowerCase(), name: roleName, tenantId: tenant.id },
    });
    roles[roleName] = role;

    await Promise.all(
      permKeys.map((key) => {
        const perm = pMap.get(key);
        if (!perm) return Promise.resolve();
        return prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      })
    );
  }

  console.log('✅ 5 roles with permissions created');

  // ── 4. Users ───────────────────────────────────────────────────

  const hashedPw = await bcrypt.hash('password123', 12);

  const owner = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'owner@demo.com',
      phone: '+919876543210',
      passwordHash: hashedPw,
      tenantId: tenant.id,
      branches: { connect: [{ id: branch1.id }, { id: branch2.id }] },
    },
  });
  await prisma.userRole.create({
    data: { userId: owner.id, roleId: roles.OWNER.id },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'manager@demo.com',
      phone: '+919876543220',
      passwordHash: hashedPw,
      tenantId: tenant.id,
      branches: { connect: { id: branch1.id } },
    },
  });
  await prisma.userRole.create({
    data: { userId: manager.id, roleId: roles.MANAGER.id, branchId: branch1.id },
  });
  await prisma.staffProfile.create({
    data: { userId: manager.id, tenantId: tenant.id, designation: 'Branch Manager', joiningDate: new Date('2023-01-15'), baseSalary: 35000, commissionPct: 5 },
  });

  const stylist1 = await prisma.user.create({
    data: {
      name: 'Anjali Patel',
      email: 'anjali@demo.com',
      phone: '+919876543230',
      passwordHash: hashedPw,
      tenantId: tenant.id,
      branches: { connect: { id: branch1.id } },
    },
  });
  await prisma.userRole.create({ data: { userId: stylist1.id, roleId: roles.STAFF.id, branchId: branch1.id } });
  await prisma.staffProfile.create({
    data: { userId: stylist1.id, tenantId: tenant.id, designation: 'Senior Stylist', joiningDate: new Date('2023-03-10'), baseSalary: 25000, commissionPct: 10 },
  });

  const stylist2 = await prisma.user.create({
    data: {
      name: 'Meena Iyer',
      email: 'meena@demo.com',
      phone: '+919876543240',
      passwordHash: hashedPw,
      tenantId: tenant.id,
      branches: { connect: { id: branch1.id } },
    },
  });
  await prisma.userRole.create({ data: { userId: stylist2.id, roleId: roles.STAFF.id, branchId: branch1.id } });
  await prisma.staffProfile.create({
    data: { userId: stylist2.id, tenantId: tenant.id, designation: 'Stylist', joiningDate: new Date('2023-06-01'), baseSalary: 18000, commissionPct: 12 },
  });

  const receptionist = await prisma.user.create({
    data: {
      name: 'Neha Gupta',
      email: 'reception@demo.com',
      phone: '+919876543250',
      passwordHash: hashedPw,
      tenantId: tenant.id,
      branches: { connect: { id: branch1.id } },
    },
  });
  await prisma.userRole.create({ data: { userId: receptionist.id, roleId: roles.RECEPTION.id, branchId: branch1.id } });

  console.log('✅ 5 users created (all pw: password123)');

  // ── 5. Services ────────────────────────────────────────────────

  const services = await Promise.all([
    prisma.service.create({ data: { name: 'Women\'s Haircut', category: 'HAIR', durationMins: 45, price: 500, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Men\'s Haircut', category: 'HAIR', durationMins: 30, price: 300, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Hair Colour (Global)', category: 'HAIR', durationMins: 120, price: 3500, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Highlights / Balayage', category: 'HAIR', durationMins: 150, price: 5000, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Keratin Treatment', category: 'HAIR', durationMins: 180, price: 8000, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Classic Facial', category: 'SKIN', durationMins: 60, price: 1200, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Gold Facial', category: 'SKIN', durationMins: 75, price: 2500, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Cleanup', category: 'SKIN', durationMins: 30, price: 800, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Full Body Wax', category: 'HAIR_REMOVAL', durationMins: 90, price: 2000, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Eyebrow Threading', category: 'HAIR_REMOVAL', durationMins: 10, price: 50, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Manicure', category: 'NAILS', durationMins: 45, price: 800, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Pedicure', category: 'NAILS', durationMins: 50, price: 1000, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Bridal Makeup', category: 'MAKEUP', durationMins: 120, price: 15000, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Party Makeup', category: 'MAKEUP', durationMins: 60, price: 3000, gstRate: 18, tenantId: tenant.id } }),
    prisma.service.create({ data: { name: 'Head Massage', category: 'SPA', durationMins: 30, price: 500, gstRate: 18, tenantId: tenant.id } }),
  ]);

  console.log('✅ 15 services created');

  // ── 6. Customers ───────────────────────────────────────────────

  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Aditi Rao', phone: '+919900110011', email: 'aditi@example.com', gender: 'FEMALE', dob: new Date('1995-03-15'), tenantId: tenant.id } }),
    prisma.customer.create({ data: { name: 'Kavita Nair', phone: '+919900110022', gender: 'FEMALE', dob: new Date('1988-07-22'), tenantId: tenant.id } }),
    prisma.customer.create({ data: { name: 'Deepak Kumar', phone: '+919900110033', gender: 'MALE', tenantId: tenant.id } }),
    prisma.customer.create({ data: { name: 'Sneha Joshi', phone: '+919900110044', email: 'sneha@example.com', gender: 'FEMALE', dob: new Date('1992-11-05'), tenantId: tenant.id } }),
    prisma.customer.create({ data: { name: 'Rohan Mehta', phone: '+919900110055', gender: 'MALE', tenantId: tenant.id } }),
    prisma.customer.create({ data: { name: 'Lakshmi Iyer', phone: '+919900110066', gender: 'FEMALE', dob: new Date('1990-01-30'), tenantId: tenant.id } }),
    prisma.customer.create({ data: { name: 'Pooja Singh', phone: '+919900110077', email: 'pooja@example.com', gender: 'FEMALE', tenantId: tenant.id } }),
    prisma.customer.create({ data: { name: 'Arun Desai', phone: '+919900110088', gender: 'MALE', tenantId: tenant.id } }),
  ]);

  console.log('✅ 8 customers created');

  // ── 7. Products & Vendors ──────────────────────────────────────

  const vendor1 = await prisma.vendor.create({
    data: { name: 'L\'Oréal Professional', phone: '+911234567890', email: 'supply@loreal.in', tenantId: tenant.id },
  });
  const vendor2 = await prisma.vendor.create({
    data: { name: 'Schwarzkopf India', phone: '+911234567891', tenantId: tenant.id },
  });

  const products = await Promise.all([
    prisma.product.create({ data: { name: 'L\'Oréal Shampoo 500ml', type: 'RETAIL', unit: 'bottle', costPrice: 450, sellingPrice: 750, reorderLevel: 5, vendorId: vendor1.id, tenantId: tenant.id } }),
    prisma.product.create({ data: { name: 'Hair Colour Tube', type: 'CONSUMABLE', unit: 'tube', costPrice: 200, sellingPrice: 0, reorderLevel: 20, vendorId: vendor1.id, tenantId: tenant.id } }),
    prisma.product.create({ data: { name: 'Wax Strips Pack', type: 'CONSUMABLE', unit: 'pack', costPrice: 150, sellingPrice: 0, reorderLevel: 10, vendorId: vendor2.id, tenantId: tenant.id } }),
    prisma.product.create({ data: { name: 'Keratin Serum 100ml', type: 'RETAIL', unit: 'bottle', costPrice: 800, sellingPrice: 1400, reorderLevel: 3, vendorId: vendor1.id, tenantId: tenant.id } }),
    prisma.product.create({ data: { name: 'Nail Polish Set', type: 'RETAIL', unit: 'set', costPrice: 300, sellingPrice: 600, reorderLevel: 5, vendorId: vendor2.id, tenantId: tenant.id } }),
  ]);

  // Create initial stock ledger entries
  for (const product of products) {
    await prisma.stockLedger.create({
      data: {
        productId: product.id,
        branchId: branch1.id,
        reason: 'PURCHASE',
        changeQty: 20,
        notes: 'Opening stock',
        tenantId: tenant.id,
      },
    });
  }

  console.log('✅ 2 vendors, 5 products with opening stock created');

  // ── 8. Sample Appointments (today & upcoming) ──────────────────

  const today = new Date();
  const todayStr = (h: number, m: number) => {
    const d = new Date(today);
    d.setHours(h, m, 0, 0);
    return d;
  };

  await Promise.all([
    prisma.appointment.create({
      data: {
        customerId: customers[0].id, customerName: customers[0].name, customerPhone: customers[0].phone,
        staffUserId: stylist1.id, branchId: branch1.id, tenantId: tenant.id,
        startAt: todayStr(10, 0), endAt: todayStr(10, 45),
        status: 'CONFIRMED', source: 'WALKIN',
      },
    }),
    prisma.appointment.create({
      data: {
        customerId: customers[1].id, customerName: customers[1].name, customerPhone: customers[1].phone,
        staffUserId: stylist2.id, branchId: branch1.id, tenantId: tenant.id,
        startAt: todayStr(11, 0), endAt: todayStr(12, 0),
        status: 'CONFIRMED', source: 'PHONE',
      },
    }),
    prisma.appointment.create({
      data: {
        customerId: customers[3].id, customerName: customers[3].name, customerPhone: customers[3].phone,
        staffUserId: stylist1.id, branchId: branch1.id, tenantId: tenant.id,
        startAt: todayStr(14, 0), endAt: todayStr(16, 0),
        status: 'CONFIRMED', source: 'ONLINE',
      },
    }),
    prisma.appointment.create({
      data: {
        customerId: customers[4].id, customerName: customers[4].name, customerPhone: customers[4].phone,
        staffUserId: stylist2.id, branchId: branch1.id, tenantId: tenant.id,
        startAt: todayStr(15, 0), endAt: todayStr(15, 30),
        status: 'BOOKED', source: 'WALKIN',
      },
    }),
  ]);

  console.log('✅ 4 sample appointments created');

  // ── 9. Sample Invoices ─────────────────────────────────────────

  const inv1 = await prisma.invoice.create({
    data: {
      number: 'GS-0001',
      customerId: customers[0].id,
      branchId: branch1.id,
      tenantId: tenant.id,
      subtotal: 1500,
      discount: 100,
      tax: 252,
      total: 1652,
      status: 'PAID',
      lineItems: {
        create: [
          { name: 'Women\'s Haircut', type: 'SERVICE', refId: services[0].id, qty: 1, unitPrice: 500, amount: 500 },
          { name: 'Manicure', type: 'SERVICE', refId: services[10].id, qty: 1, unitPrice: 800, amount: 800 },
          { name: 'Eyebrow Threading', type: 'SERVICE', refId: services[9].id, qty: 1, unitPrice: 50, amount: 50 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      amount: 1652,
      method: 'UPI',
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      number: 'GS-0002',
      customerId: customers[1].id,
      branchId: branch1.id,
      tenantId: tenant.id,
      subtotal: 2500,
      discount: 0,
      tax: 450,
      total: 2950,
      status: 'PAID',
      lineItems: {
        create: [
          { name: 'Gold Facial', type: 'SERVICE', refId: services[6].id, qty: 1, unitPrice: 2500, amount: 2500 },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: inv2.id,
      amount: 2950,
      method: 'CARD',
    },
  });

  console.log('✅ 2 sample invoices with payments created');

  // ── 10. Package ────────────────────────────────────────────────

  const pkg = await prisma.package.create({
    data: {
      name: 'Monthly Hair Care',
      price: 2500,
      validityDays: 30,
      sessionsTotal: 5,
      includesJson: JSON.stringify([services[0].id, services[14].id]),
      tenantId: tenant.id,
    },
  });

  await prisma.customerPackage.create({
    data: {
      customerId: customers[0].id,
      packageId: pkg.id,
      branchId: branch1.id,
      purchasedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sessionsRemaining: 5,
      tenantId: tenant.id,
    },
  });

  console.log('✅ 1 package + 1 active membership created');

  // ── 11. Subscription ───────────────────────────────────────────

  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      planKey: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ PRO subscription activated');

  // ── 12. Message Template ───────────────────────────────────────

  await prisma.messageTemplate.create({
    data: {
      key: 'appointment_reminder',
      name: 'Appointment Reminder',
      channel: 'WHATSAPP',
      content: 'Hi {{name}}, reminder for your {{service}} appointment tomorrow at {{time}}. See you at Glamour Studio! 💇‍♀️',
      tenantId: tenant.id,
    },
  });

  await prisma.messageTemplate.create({
    data: {
      key: 'thank_you',
      name: 'Thank You',
      channel: 'SMS',
      content: 'Thanks for visiting Glamour Studio, {{name}}! Rate us: {{reviewLink}}',
      tenantId: tenant.id,
    },
  });

  console.log('✅ 2 message templates created');

  // ── 13. Review Links ───────────────────────────────────────────

  await prisma.reviewLink.create({
    data: {
      platform: 'Google',
      url: 'https://g.page/r/glamour-studio/review',
      branchId: branch1.id,
      tenantId: tenant.id,
    },
  });

  console.log('✅ 1 review link created');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log('  Owner:       owner@demo.com / password123');
  console.log('  Manager:     manager@demo.com / password123');
  console.log('  Receptionist: reception@demo.com / password123');
  console.log('  Stylist:     anjali@demo.com / password123');
  console.log('  Stylist:     meena@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
