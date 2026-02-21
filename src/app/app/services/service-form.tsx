'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createService, updateService } from './actions';

const categories = ['Hair', 'Skin', 'Nails', 'Spa', 'Makeup', 'Bridal', 'General'];

interface ServiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: {
    id: string;
    name: string;
    category: string;
    durationMins: number;
    price: number;
    gstRate: number;
    active: boolean;
  } | null;
}

export function ServiceForm({ open, onOpenChange, service }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!service;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    try {
      const result = isEditing
        ? await updateService(service!.id, formData)
        : await createService(formData);

      if (result.error) {
        setError(result.error);
      } else {
        onOpenChange(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Haircut"
              defaultValue={service?.name || ''}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={service?.category || 'General'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationMins">Duration (mins)</Label>
              <Input
                id="durationMins"
                name="durationMins"
                type="number"
                min={5}
                defaultValue={service?.durationMins || 30}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={service?.price || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gstRate">GST Rate (%)</Label>
              <Input
                id="gstRate"
                name="gstRate"
                type="number"
                min={0}
                max={100}
                defaultValue={service?.gstRate || 18}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
