'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Receipt,
  Users,
  Package,
  Warehouse,
  UserCog,
  BarChart3,
  Megaphone,
  Settings,
  Scissors,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useMemo } from 'react';

// Each nav item maps to the permission needed to see it
const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null }, // visible to all
  { href: '/app/appointments', label: 'Appointments', icon: Calendar, permission: 'appointments' },
  { href: '/app/services', label: 'Services', icon: Scissors, permission: 'services' },
  { href: '/app/pos', label: 'Billing / POS', icon: Receipt, permission: 'billing' },
  { href: '/app/customers', label: 'Customers', icon: Users, permission: 'customers' },
  { href: '/app/packages', label: 'Packages', icon: Package, permission: 'packages' },
  { href: '/app/inventory', label: 'Inventory', icon: Warehouse, permission: 'inventory' },
  { href: '/app/staff', label: 'Staff', icon: UserCog, permission: 'staff' },
  { href: '/app/reports', label: 'Reports', icon: BarChart3, permission: 'reports' },
  { href: '/app/marketing', label: 'Marketing', icon: Megaphone, permission: 'marketing' },
  { href: '/app/settings', label: 'Settings', icon: Settings, permission: 'settings' },
];

// Which modules each role can access
const ROLE_ACCESS: Record<string, Set<string | null>> = {
  OWNER: new Set([null, 'appointments', 'services', 'billing', 'customers', 'packages', 'inventory', 'staff', 'reports', 'marketing', 'settings']),
  MANAGER: new Set([null, 'appointments', 'services', 'billing', 'customers', 'packages', 'inventory', 'staff', 'reports', 'marketing', 'settings']),
  RECEPTION: new Set([null, 'appointments', 'services', 'billing', 'customers', 'packages']),
  STAFF: new Set([null, 'appointments', 'services', 'customers']),
  ACCOUNTANT: new Set([null, 'billing', 'reports', 'inventory', 'settings']),
};

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  OWNER: { label: 'Owner', color: 'bg-purple-100 text-purple-700' },
  MANAGER: { label: 'Manager', color: 'bg-blue-100 text-blue-700' },
  RECEPTION: { label: 'Receptionist', color: 'bg-green-100 text-green-700' },
  STAFF: { label: 'Stylist', color: 'bg-pink-100 text-pink-700' },
  ACCOUNTANT: { label: 'Accountant', color: 'bg-amber-100 text-amber-700' },
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRoles: Array<{ key: string; name: string; branchId: string | null }> =
    (session?.user as any)?.roles || [];
  const primaryRoleKey = userRoles[0]?.key?.toUpperCase() || 'STAFF';
  const roleInfo = ROLE_LABELS[primaryRoleKey] || { label: primaryRoleKey, color: 'bg-gray-100 text-gray-700' };

  // Filter nav items based on role
  const visibleNavItems = useMemo(() => {
    const access = ROLE_ACCESS[primaryRoleKey] || ROLE_ACCESS.STAFF;
    return navItems.filter((item) => access.has(item.permission));
  }, [primaryRoleKey]);

  const initials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Scissors className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">ParlourOS</span>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium">{session?.user?.name || 'User'}</span>
                <span className={cn('mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', roleInfo.color)}>
                  {roleInfo.label}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/app/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
        {sidebarContent}
      </aside>
    </>
  );
}
