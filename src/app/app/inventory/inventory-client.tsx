'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, AlertTriangle, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createProduct, createVendor, deleteProduct } from './actions';

export function InventoryClient({
  stockSummary,
  vendors,
}: {
  stockSummary: any[];
  vendors: any[];
}) {
  const router = useRouter();
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [vendorFormOpen, setVendorFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lowStockItems = stockSummary.filter((p) => p.lowStock);

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);
    if (result.error) setError(result.error);
    else { setProductFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  const handleCreateVendor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createVendor(formData);
    if (result.error) setError(result.error);
    else { setVendorFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Products, vendors, and stock management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setVendorFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
          <Button onClick={() => setProductFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {lowStockItems.length} product(s) below reorder level
            </span>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products ({stockSummary.length})</TabsTrigger>
          <TabsTrigger value="vendors">Vendors ({vendors.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Selling</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Reorder Lvl</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No products yet</TableCell>
                  </TableRow>
                ) : (
                  stockSummary.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant={p.type === 'RETAIL' ? 'default' : 'secondary'}>{p.type}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(p.costPrice)}</TableCell>
                      <TableCell>{formatCurrency(p.sellingPrice)}</TableCell>
                      <TableCell>
                        <span className={p.lowStock ? 'text-red-600 font-bold' : ''}>
                          {p.totalStock} {p.unit}
                        </span>
                      </TableCell>
                      <TableCell>{p.reorderLevel}</TableCell>
                      <TableCell>{p.vendor?.name || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          if (confirm('Delete?')) { await deleteProduct(p.id); router.refresh(); }
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No vendors yet</TableCell>
                  </TableRow>
                ) : (
                  vendors.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell>{v.phone || '-'}</TableCell>
                      <TableCell>{v.email || '-'}</TableCell>
                      <TableCell>{v.address || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Form */}
      <Dialog open={productFormOpen} onOpenChange={setProductFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Product</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateProduct} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select name="type" defaultValue="RETAIL">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RETAIL">Retail</SelectItem>
                    <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input name="unit" defaultValue="pcs" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cost Price</Label>
                <Input name="costPrice" type="number" min={0} defaultValue={0} />
              </div>
              <div className="space-y-2">
                <Label>Selling Price</Label>
                <Input name="sellingPrice" type="number" min={0} defaultValue={0} />
              </div>
              <div className="space-y-2">
                <Label>Reorder Level</Label>
                <Input name="reorderLevel" type="number" min={0} defaultValue={5} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProductFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Vendor Form */}
      <Dialog open={vendorFormOpen} onOpenChange={setVendorFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Vendor</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateVendor} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input name="name" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Phone</Label><Input name="phone" /></div>
              <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" /></div>
            </div>
            <div className="space-y-2"><Label>Address</Label><Input name="address" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setVendorFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
