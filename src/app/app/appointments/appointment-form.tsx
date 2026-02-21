'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { createAppointment } from './actions';

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Array<{ id: string; name: string }>;
  staff: Array<{ id: string; name: string }>;
}

export function AppointmentForm({ open, onOpenChange, branches, staff }: AppointmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createAppointment(formData);
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

  // Default start time to next hour
  const now = new Date();
  now.setMinutes(0);
  now.setSeconds(0);
  now.setHours(now.getHours() + 1);
  const defaultStart = now.toISOString().slice(0, 16);
  const end = new Date(now.getTime() + 30 * 60 * 1000);
  const defaultEnd = end.toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <div className="space-y-2">
            <Label>Branch *</Label>
            <Select name="branchId" defaultValue={branches[0]?.id}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input id="customerName" name="customerName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone *</Label>
              <Input id="customerPhone" name="customerPhone" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Start Time *</Label>
              <Input id="startAt" name="startAt" type="datetime-local" defaultValue={defaultStart} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">End Time *</Label>
              <Input id="endAt" name="endAt" type="datetime-local" defaultValue={defaultEnd} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Staff</Label>
              <Select name="staffUserId">
                <SelectTrigger><SelectValue placeholder="Assign staff" /></SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select name="source" defaultValue="WALKIN">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALKIN">Walk-in</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="depositAmount">Deposit Amount (₹)</Label>
            <Input id="depositAmount" name="depositAmount" type="number" min={0} defaultValue={0} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Book Appointment'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
