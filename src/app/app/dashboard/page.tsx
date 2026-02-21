import { requireAuth } from '@/lib/rbac';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  Users,
  Receipt,
  TrendingUp,
  Clock,
  IndianRupee,
  UserPlus,
  PackageCheck,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await requireAuth();
  const tenantId = user.tenantId!;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    todayAppointments,
    totalCustomers,
    monthRevenue,
    todayRevenue,
    recentInvoices,
    upcomingAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { tenantId, startAt: { gte: today, lt: tomorrow } },
    }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.invoice.aggregate({
      where: { tenantId, status: 'PAID', createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { tenantId, status: 'PAID', createdAt: { gte: today, lt: tomorrow } },
      _sum: { total: true },
    }),
    prisma.invoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: true },
    }),
    prisma.appointment.findMany({
      where: { tenantId, startAt: { gte: new Date() }, status: { in: ['BOOKED', 'CONFIRMED'] } },
      orderBy: { startAt: 'asc' },
      take: 5,
    }),
  ]);

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.toString(),
      icon: Calendar,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Total Customers',
      value: totalCustomers.toString(),
      icon: Users,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(todayRevenue._sum.total || 0),
      icon: IndianRupee,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(monthRevenue._sum.total || 0),
      icon: TrendingUp,
      color: 'text-pink-600 bg-pink-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{apt.customerName}</p>
                      <p className="text-sm text-muted-foreground">{apt.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(apt.startAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.startAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Receipt className="h-5 w-5" />
              Recent Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{inv.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {inv.customer?.name || 'Walk-in'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(inv.total)}</p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          inv.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : inv.status === 'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
