'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createCustomer, updateCustomer } from './actions';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any;
}

export function CustomerForm({ open, onOpenChange, customer }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!customer;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);

    try {
      const result = isEditing
        ? await updateCustomer(customer.id, formData)
        : await createCustomer(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={customer?.name || ''} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" defaultValue={customer?.phone || ''} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={customer?.email || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select name="gender" defaultValue={customer?.gender || ''}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" name="dob" type="date" defaultValue={customer?.dob ? new Date(customer.dob).toISOString().split('T')[0] : ''} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies / Sensitivities</Label>
            <Input id="allergies" name="allergies" defaultValue={customer?.allergies || ''} placeholder="e.g., Ammonia, Latex" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={customer?.notes || ''} rows={2} />
          </div>
          <div className="space-y-3">
            <Label>Communication Consent</Label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="hidden" name="whatsappOptIn" value="false" />
                <input type="checkbox" name="whatsappOptIn" value="true" defaultChecked={customer?.whatsappOptIn} className="h-4 w-4" />
                WhatsApp
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="hidden" name="smsOptIn" value="false" />
                <input type="checkbox" name="smsOptIn" value="true" defaultChecked={customer?.smsOptIn} className="h-4 w-4" />
                SMS
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="hidden" name="emailOptIn" value="false" />
                <input type="checkbox" name="emailOptIn" value="true" defaultChecked={customer?.emailOptIn} className="h-4 w-4" />
                Email
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
