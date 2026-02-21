'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Calendar, Clock, User } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { AppointmentForm } from './appointment-form';
import { updateAppointmentStatus } from './actions';

const statusColors: Record<string, string> = {
  BOOKED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
};

export function AppointmentsList({
  appointments,
  branches,
  staff,
}: {
  appointments: any[];
  branches: any[];
  staff: any[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);

  const handleStatusChange = async (id: string, status: string) => {
    await updateAppointmentStatus(id, status);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">{appointments.length} appointments</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{apt.customerName}</p>
                      <p className="text-xs text-muted-foreground">{apt.customerPhone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{formatDateTime(apt.startAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{apt.staff?.name || '-'}</TableCell>
                  <TableCell>{apt.branch?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{apt.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[apt.status] || ''}`}>
                      {apt.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={apt.status}
                      onValueChange={(val) => handleStatusChange(apt.id, val)}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOOKED">Booked</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="NO_SHOW">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AppointmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        branches={branches}
        staff={staff}
      />
    </div>
  );
}
