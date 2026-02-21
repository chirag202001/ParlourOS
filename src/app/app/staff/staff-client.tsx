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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, UserCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createStaffMember, markAttendance, deleteStaffMember } from './actions';

export function StaffClient({
  staffMembers,
  attendance,
  branches,
  roles,
}: {
  staffMembers: any[];
  attendance: any[];
  branches: any[];
  roles: any[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateStaff = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createStaffMember(formData);
    if (result.error) setError(result.error);
    else { setFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  const handleMarkAttendance = async (userId: string, status: string) => {
    const formData = new FormData();
    formData.set('userId', userId);
    formData.set('status', status);
    if (branches[0]) formData.set('branchId', branches[0].id);
    await markAttendance(formData);
    router.refresh();
  };

  const attendedIds = new Set(attendance.map((a: any) => a.staffUserId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">Manage team, attendance &amp; commissions</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Staff</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{staffMembers.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendance.filter((a: any) => a.status === 'PRESENT').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {attendance.filter((a: any) => a.status === 'ABSENT').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team ({staffMembers.length})</TabsTrigger>
          <TabsTrigger value="attendance">Today&apos;s Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Commission %</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No staff members yet</TableCell>
                  </TableRow>
                ) : (
                  staffMembers.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {s.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {s.userRoles?.[0]?.role?.name ? (
                          <Badge variant="secondary">{s.userRoles[0].role.name}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{s.phone || '-'}</TableCell>
                      <TableCell>{s.staffProfile?.designation || '-'}</TableCell>
                      <TableCell>{s.staffProfile?.commissionPct ?? 0}%</TableCell>
                      <TableCell>{formatCurrency(s.staffProfile?.baseSalary ?? 0)}</TableCell>
                      <TableCell>
                        {s.branches?.map((b: any) => b.name).join(', ') || '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={async () => {
                          if (confirm('Delete this staff member?')) { await deleteStaffMember(s.id); router.refresh(); }
                        }}>
                          <UserCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((s) => {
                  const att = attendance.find((a: any) => a.staffUserId === s.id);
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        {att ? (
                          <Badge variant={att.status === 'PRESENT' ? 'default' : att.status === 'ABSENT' ? 'destructive' : 'secondary'}>
                            {att.status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not marked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-green-600"
                            onClick={() => handleMarkAttendance(s.id, 'PRESENT')}>
                            Present
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600"
                            onClick={() => handleMarkAttendance(s.id, 'ABSENT')}>
                            Absent
                          </Button>
                          <Button size="sm" variant="outline" className="text-yellow-600"
                            onClick={() => handleMarkAttendance(s.id, 'HALF_DAY')}>
                            Half Day
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Staff Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Staff Member</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateStaff} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2"><Label>Full Name</Label><Input name="name" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Email</Label><Input name="email" type="email" required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input name="phone" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select name="role" defaultValue="STAFF">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select name="branchId">
                  <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Designation</Label><Input name="designation" placeholder="e.g. Senior Stylist" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base Salary</Label>
                <Input name="baseSalary" type="number" min={0} defaultValue={0} />
              </div>
              <div className="space-y-2">
                <Label>Commission %</Label>
                <Input name="commissionPct" type="number" min={0} max={100} defaultValue={0} />
              </div>
              <div className="space-y-2">
                <Label>Joining Date</Label>
                <Input name="joiningDate" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
