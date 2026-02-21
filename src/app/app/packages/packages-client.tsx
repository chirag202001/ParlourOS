'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Package, Gift } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createPackage, deletePackage } from './actions';

export function PackagesClient({
  packages,
  customerPackages,
}: {
  packages: any[];
  customerPackages: any[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createPackage(formData);
    if (result.error) setError(result.error);
    else { setFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packages & Memberships</h1>
          <p className="text-muted-foreground">Manage prepaid packages and customer memberships</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Package
        </Button>
      </div>

      {/* Package Templates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  {pkg.name}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={async () => {
                  if (confirm('Delete?')) { await deletePackage(pkg.id); router.refresh(); }
                }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-lg">{formatCurrency(pkg.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions</span>
                  <span>{pkg.sessionsTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validity</span>
                  <span>{pkg.validityDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto Renew</span>
                  <Badge variant={pkg.autoRenew ? 'success' : 'secondary'}>
                    {pkg.autoRenew ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {packages.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No packages yet. Create your first package template.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Active Customer Packages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" /> Active Memberships
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Sessions Left</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerPackages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No active memberships
                  </TableCell>
                </TableRow>
              ) : (
                customerPackages.map((cp) => (
                  <TableRow key={cp.id}>
                    <TableCell className="font-medium">{cp.customer?.name}</TableCell>
                    <TableCell>{cp.package?.name}</TableCell>
                    <TableCell>{cp.branch?.name}</TableCell>
                    <TableCell>{cp.sessionsRemaining}</TableCell>
                    <TableCell>{formatDate(cp.expiresAt)}</TableCell>
                    <TableCell>
                      <Badge variant={cp.status === 'ACTIVE' ? 'success' : cp.status === 'EXPIRED' ? 'destructive' : 'secondary'}>
                        {cp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Package Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label>Package Name</Label>
              <Input name="name" placeholder="Gold Membership" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input name="price" type="number" min={0} required />
              </div>
              <div className="space-y-2">
                <Label>Sessions</Label>
                <Input name="sessionsTotal" type="number" min={1} defaultValue={10} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Validity (days)</Label>
                <Input name="validityDays" type="number" min={1} defaultValue={365} />
              </div>
              <div className="space-y-2">
                <Label>Auto Renew</Label>
                <select name="autoRenew" className="flex h-10 w-full rounded-md border px-3 py-2 text-sm">
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
