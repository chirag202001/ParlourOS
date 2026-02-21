'use server';

import { prisma } from '@/lib/db';
import { requireAuth, requirePermission, getUserBranches } from '@/lib/rbac';

export async function getRevenueReport(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const user = await requirePermission('reports:read');
  const branches = await getUserBranches(user.id);
  const branchIds = branches.map((b) => b.id);

  const now = new Date();
  let start: Date;
  switch (period) {
    case 'day':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId: user.tenantId,
      branchId: { in: branchIds },
      createdAt: { gte: start },
      status: { in: ['PAID', 'PARTIAL'] },
    },
    include: { payments: true },
  });

  const totalRevenue = invoices.reduce((sum, inv) =>
    sum + inv.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const totalInvoices = invoices.length;
  const avgTicket = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
  const totalDiscount = invoices.reduce((sum, inv) => sum + inv.discount, 0);

  // Daily breakdown for the period
  const dailyMap = new Map<string, number>();
  invoices.forEach((inv) => {
    const key = inv.createdAt.toISOString().split('T')[0];
    dailyMap.set(key, (dailyMap.get(key) || 0) +
      inv.payments.reduce((ps, p) => ps + p.amount, 0));
  });

  const dailyBreakdown = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount }));

  return { totalRevenue, totalInvoices, avgTicket, totalTax, totalDiscount, dailyBreakdown };
}

export async function getServiceMixReport() {
  const user = await requirePermission('reports:read');
  const branches = await getUserBranches(user.id);
  const branchIds = branches.map((b) => b.id);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const lineItems = await prisma.invoiceLineItem.findMany({
    where: {
      invoice: {
        tenantId: user.tenantId,
        branchId: { in: branchIds },
        createdAt: { gte: thisMonth },
        status: { in: ['PAID', 'PARTIAL'] },
      },
      type: 'SERVICE',
    },
  });

  const serviceMap = new Map<string, { name: string; category: string; count: number; revenue: number }>();
  lineItems.forEach((li) => {
    const key = li.refId || li.name;
    const existing = serviceMap.get(key) || {
      name: li.name,
      category: 'SERVICE',
      count: 0,
      revenue: 0,
    };
    existing.count += li.qty;
    existing.revenue += li.amount;
    serviceMap.set(key, existing);
  });

  return Array.from(serviceMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getStaffPerformanceReport() {
  const user = await requirePermission('reports:read');
  const branches = await getUserBranches(user.id);
  const branchIds = branches.map((b) => b.id);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: user.tenantId,
      branchId: { in: branchIds },
      startAt: { gte: thisMonth },
      status: 'COMPLETED',
    },
    include: {
      staff: { select: { id: true, name: true } },
    },
  });

  const staffMap = new Map<string, { name: string; appointments: number; revenue: number }>();
  appointments.forEach((apt) => {
    if (!apt.staff) return;
    const existing = staffMap.get(apt.staff.id) || {
      name: apt.staff.name || 'Unknown',
      appointments: 0,
      revenue: 0,
    };
    existing.appointments += 1;
    existing.revenue += 0; // Revenue tracked via invoices, not appointments
    staffMap.set(apt.staff.id, existing);
  });

  return Array.from(staffMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getCustomerRetentionReport() {
  const user = await requirePermission('reports:read');

  const totalCustomers = await prisma.customer.count({
    where: { tenantId: user.tenantId },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const activeCustomers = await prisma.customer.count({
    where: {
      tenantId: user.tenantId,
      appointments: { some: { startAt: { gte: thirtyDaysAgo } } },
    },
  });

  const atRiskCustomers = await prisma.customer.count({
    where: {
      tenantId: user.tenantId,
      appointments: {
        some: { startAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        none: { startAt: { gte: thirtyDaysAgo } },
      },
    },
  });

  const lapsedCustomers = await prisma.customer.count({
    where: {
      tenantId: user.tenantId,
      OR: [
        { appointments: { every: { startAt: { lt: sixtyDaysAgo } } } },
        { appointments: { none: {} } },
      ],
    },
  });

  const newThisMonth = await prisma.customer.count({
    where: {
      tenantId: user.tenantId,
      createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  });

  return {
    totalCustomers,
    activeCustomers,
    atRiskCustomers,
    lapsedCustomers,
    newThisMonth,
    retentionRate: totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0,
  };
}

export async function getGSTSummary() {
  const user = await requirePermission('reports:read');
  const branches = await getUserBranches(user.id);
  const branchIds = branches.map((b) => b.id);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const invoices = await prisma.invoice.findMany({
    where: {
      tenantId: user.tenantId,
      branchId: { in: branchIds },
      createdAt: { gte: thisMonth },
      status: { in: ['PAID', 'PARTIAL'] },
    },
    select: {
      subtotal: true,
      tax: true,
      total: true,
    },
  });

  const totalTaxableValue = invoices.reduce((s, i) => s + i.subtotal, 0);
  const totalTax = invoices.reduce((s, i) => s + i.tax, 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const totalValue = invoices.reduce((s, i) => s + i.total, 0);

  return { totalTaxableValue, cgst, sgst, totalTax, totalValue, invoiceCount: invoices.length };
}

export async function exportReportCSV(reportType: string) {
  const user = await requirePermission('reports:read');

  // Build CSV content based on report type
  let csv = '';

  if (reportType === 'revenue') {
    const report = await getRevenueReport('month');
    csv = 'Date,Amount\n';
    report.dailyBreakdown.forEach((d) => {
      csv += `${d.date},${d.amount}\n`;
    });
  } else if (reportType === 'gst') {
    const report = await getGSTSummary();
    csv = 'Item,Amount\n';
    csv += `Taxable Value,${report.totalTaxableValue}\n`;
    csv += `CGST,${report.cgst}\n`;
    csv += `SGST,${report.sgst}\n`;
    csv += `Total Tax,${report.totalTax}\n`;
    csv += `Total Value,${report.totalValue}\n`;
  }

  return csv;
}
