'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ServiceForm } from './service-form';
import { deleteService } from './actions';
import { useRouter } from 'next/navigation';

type Service = {
  id: string;
  name: string;
  category: string;
  durationMins: number;
  price: number;
  gstRate: number;
  active: boolean;
};

export function ServicesList({ services }: { services: Service[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    await deleteService(id);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">Manage your service catalog</p>
        </div>
        <Button
          onClick={() => {
            setEditingService(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No services yet. Add your first service to get started.
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>{service.durationMins} min</TableCell>
                  <TableCell>{formatCurrency(service.price)}</TableCell>
                  <TableCell>{service.gstRate}%</TableCell>
                  <TableCell>
                    <Badge variant={service.active ? 'success' : 'secondary'}>
                      {service.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id)}
                      >
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

      <ServiceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editingService}
      />
    </div>
  );
}
