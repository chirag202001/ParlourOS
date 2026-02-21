'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Building2, Crown, Trash2, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PLANS } from '@/lib/plans';
import {
  updateTenantSettings, createBranch, deleteBranch,
  updateSubscriptionPlan, updateInvoiceSettings,
} from './actions';

export function SettingsClient({
  tenant,
  roles,
  subscription,
}: {
  tenant: any;
  roles: any[];
  subscription: any;
}) {
  const router = useRouter();
  const [branchFormOpen, setBranchFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPlan = subscription?.planKey || 'STARTER';
  const planConfig = PLANS[currentPlan as keyof typeof PLANS] || PLANS.STARTER;

  const handleUpdateBusiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const formData = new FormData(e.currentTarget);
    const result = await updateTenantSettings(formData);
    if (result.error) setError(result.error);
    else setSuccess('Business settings updated');
    setLoading(false);
    router.refresh();
  };

  const handleCreateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createBranch(formData);
    if (result.error) setError(result.error);
    else { setBranchFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  const handleUpdateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateInvoiceSettings(formData);
    if (result.error) setError(result.error);
    else setSuccess('Invoice settings updated');
    setLoading(false);
    router.refresh();
  };

  const handleUpgrade = async (plan: string) => {
    setLoading(true);
    const result = await updateSubscriptionPlan(plan);
    if (result.error) setError(result.error);
    else { setSuccess(`Upgraded to ${plan}`); router.refresh(); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Business profile, branches, billing &amp; configuration</p>
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">{success}</div>}

      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        {/* Business Tab */}
        <TabsContent value="business" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Update your salon details</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateBusiness}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Business Name</Label><Input name="name" defaultValue={tenant?.name || ''} required /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input name="phone" defaultValue={tenant?.phone || ''} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" defaultValue={tenant?.email || ''} /></div>
                  <div className="space-y-2"><Label>GSTIN</Label><Input name="gstin" defaultValue={tenant?.gstin || ''} placeholder="22AAAAA0000A1Z5" /></div>
                </div>
                <div className="space-y-2"><Label>Tax Rate (%)</Label><Input name="taxRate" type="number" min={0} max={100} defaultValue={tenant?.taxRate || 18} /></div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setBranchFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Branch
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {tenant?.branches?.map((b: any) => (
              <Card key={b.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4" /> {b.name}
                    </CardTitle>
                    {tenant.branches.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={async () => {
                        if (confirm('Delete this branch?')) { await deleteBranch(b.id); router.refresh(); }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {b.address && <p>{b.address}</p>}
                  {b.city && <p>{b.city}</p>}
                  {b.phone && <p>📞 {b.phone}</p>}
                  <p>🕐 {b.openTime} – {b.closeTime}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Invoice Tab */}
        <TabsContent value="invoice" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Customize your invoice format</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateInvoice}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Invoice Prefix</Label>
                  <Input name="invoicePrefix" defaultValue={tenant?.invoicePrefix || 'INV'} placeholder="INV" />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Footer</Label>
                  <Textarea name="invoiceFooter" defaultValue={tenant?.invoiceFooter || ''} placeholder="Thank you for choosing us!" rows={3} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r._count?.userRoles || 0}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {r.rolePermissions?.slice(0, 5).map((p: any) => (
                          <Badge key={p.id} variant="secondary" className="text-xs">{p.permission?.key}</Badge>
                        ))}
                        {r.rolePermissions?.length > 5 && (
                          <Badge variant="secondary" className="text-xs">+{r.rolePermissions.length - 5} more</Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="mt-4 space-y-6">
          {subscription && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Current Plan: {currentPlan}
                </CardTitle>
                <CardDescription>
                  Status: <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>{subscription.status}</Badge>
                  {subscription.currentPeriodEnd && (
                    <> · Renews: {formatDate(subscription.currentPeriodEnd)}</>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card key={key} className={key === currentPlan ? 'border-2 border-primary' : ''}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>/month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Up to {plan.maxBranches} branch(es)</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />Up to {plan.maxStaff} staff</li>
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" />{f}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {key === currentPlan ? (
                    <Button className="w-full" disabled>Current Plan</Button>
                  ) : (
                    <Button className="w-full" variant="outline" onClick={() => handleUpgrade(key)} disabled={loading}>
                      {loading ? 'Processing...' : 'Upgrade'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Branch Form Dialog */}
      <Dialog open={branchFormOpen} onOpenChange={setBranchFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Branch</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateBranch} className="space-y-4">
            <div className="space-y-2"><Label>Branch Name</Label><Input name="name" required /></div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>City</Label><Input name="city" /></div>
              <div className="space-y-2"><Label>Phone</Label><Input name="phone" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Open Time</Label><Input name="openTime" type="time" defaultValue="09:00" /></div>
              <div className="space-y-2"><Label>Close Time</Label><Input name="closeTime" type="time" defaultValue="21:00" /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBranchFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
