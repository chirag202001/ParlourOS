'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Phone, Mail } from 'lucide-react';
import { CustomerForm } from './customer-form';
import { deleteCustomer } from './actions';
import { formatDate } from '@/lib/utils';

export function CustomersList({ customers: initialCustomers }: { customers: any[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');

  const customers = search
    ? initialCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.phone.includes(search),
      )
    : initialCustomers;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">{initialCustomers.length} total customers</p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Loyalty Pts</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {search ? 'No customers match your search' : 'No customers yet'}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      {customer.email && (
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.gender || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {customer.whatsappOptIn && <Badge variant="success" className="text-xs">WA</Badge>}
                      {customer.smsOptIn && <Badge variant="secondary" className="text-xs">SMS</Badge>}
                      {customer.emailOptIn && <Badge variant="outline" className="text-xs">Email</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{customer.loyaltyPoints}</TableCell>
                  <TableCell>{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCustomer(customer); setFormOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={async () => {
                        if (confirm('Delete this customer?')) {
                          await deleteCustomer(customer.id);
                          router.refresh();
                        }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerForm open={formOpen} onOpenChange={setFormOpen} customer={editingCustomer} />
    </div>
  );
}
