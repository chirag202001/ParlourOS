'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, CreditCard, Receipt, IndianRupee } from 'lucide-react';
import { formatCurrency, computeGST } from '@/lib/utils';
import { createInvoice, recordPayment } from './actions';

type LineItem = {
  type: 'SERVICE' | 'PRODUCT';
  refId?: string;
  name: string;
  qty: number;
  unitPrice: number;
  gstRate: number;
};

export function POSClient({
  services,
  products,
  customers,
  branches,
  invoices,
}: {
  services: any[];
  products: any[];
  customers: any[];
  branches: any[];
  invoices: any[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || '');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentModal, setPaymentModal] = useState<any>(null);

  const addService = (service: any) => {
    setItems([...items, {
      type: 'SERVICE',
      refId: service.id,
      name: service.name,
      qty: 1,
      unitPrice: service.price,
      gstRate: service.gstRate,
    }]);
  };

  const addProduct = (product: any) => {
    setItems([...items, {
      type: 'PRODUCT',
      refId: product.id,
      name: product.name,
      qty: 1,
      unitPrice: product.sellingPrice,
      gstRate: product.gstRate,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateQty = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].qty = Math.max(1, qty);
    setItems(updated);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const totalTax = items.reduce((sum, item) => {
    const gst = computeGST(item.qty * item.unitPrice, item.gstRate);
    return sum + gst.totalTax;
  }, 0);
  const grandTotal = subtotal - discount + totalTax;

  const handleCreateInvoice = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.set('branchId', selectedBranch);
    formData.set('customerId', selectedCustomer);
    formData.set('type', 'TAX');
    formData.set('discount', discount.toString());
    formData.set('lineItems', JSON.stringify(items));

    try {
      const result = await createInvoice(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setItems([]);
        setDiscount(0);
        setSelectedCustomer('');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoiceId: string, method: string, amount: number) => {
    const formData = new FormData();
    formData.set('invoiceId', invoiceId);
    formData.set('method', method);
    formData.set('amount', amount.toString());

    const result = await recordPayment(formData);
    if (result.success) {
      setPaymentModal(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing / POS</h1>
        <p className="text-muted-foreground">Create invoices and collect payments</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invoice Builder */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New Invoice</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {branches.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger><SelectValue placeholder="Walk-in" /></SelectTrigger>
                    <SelectContent>
                      {customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Items */}
              <div className="space-y-2">
                <Label>Add Services</Label>
                <div className="flex flex-wrap gap-2">
                  {services.map((s: any) => (
                    <Button key={s.id} variant="outline" size="sm" onClick={() => addService(s)}>
                      <Plus className="mr-1 h-3 w-3" /> {s.name} ({formatCurrency(s.price)})
                    </Button>
                  ))}
                </div>
              </div>

              {products.length > 0 && (
                <div className="space-y-2">
                  <Label>Add Products</Label>
                  <div className="flex flex-wrap gap-2">
                    {products.map((p: any) => (
                      <Button key={p.id} variant="outline" size="sm" onClick={() => addProduct(p)}>
                        <Plus className="mr-1 h-3 w-3" /> {p.name} ({formatCurrency(p.sellingPrice)})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Line Items */}
              {items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>GST</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.type === 'SERVICE' ? 'default' : 'secondary'} className="text-xs">
                              {item.type === 'SERVICE' ? 'SVC' : 'PRD'}
                            </Badge>
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input type="number" className="w-16 h-8" value={item.qty} min={1}
                            onChange={(e) => updateQty(i, parseInt(e.target.value))} />
                        </TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{item.gstRate}%</TableCell>
                        <TableCell>{formatCurrency(item.qty * item.unitPrice)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeItem(i)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Totals */}
              {items.length > 0 && (
                <div className="space-y-2 rounded-lg bg-muted p-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Discount</span>
                    <Input type="number" className="w-24 h-8" value={discount} min={0}
                      onChange={(e) => setDiscount(Number(e.target.value))} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>GST</span>
                    <span>{formatCurrency(totalTax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                  <Button className="w-full mt-2" onClick={handleCreateInvoice} disabled={loading}>
                    <Receipt className="mr-2 h-4 w-4" />
                    {loading ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoices.slice(0, 10).map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">{inv.customer?.name || 'Walk-in'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(inv.total)}</p>
                      <div className="flex items-center gap-1">
                        <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                          inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          inv.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {inv.status}
                        </span>
                        {inv.status !== 'PAID' && inv.status !== 'REFUNDED' && (
                          <Button variant="ghost" size="sm" className="h-6 text-xs"
                            onClick={() => setPaymentModal(inv)}>
                            <CreditCard className="mr-1 h-3 w-3" /> Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <Dialog open={!!paymentModal} onOpenChange={() => setPaymentModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment — {paymentModal.number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm">
                Total: <strong>{formatCurrency(paymentModal.total)}</strong>
                {' | '}Paid: <strong>{formatCurrency(paymentModal.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0)}</strong>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['UPI', 'CASH', 'CARD', 'ONLINE'].map((method) => (
                  <Button key={method} variant="outline"
                    onClick={() => handlePayment(
                      paymentModal.id,
                      method,
                      paymentModal.total - (paymentModal.payments?.reduce((s: number, p: any) => s + p.amount, 0) || 0),
                    )}>
                    <IndianRupee className="mr-1 h-4 w-4" /> {method}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
