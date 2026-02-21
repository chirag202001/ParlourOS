'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, Trash2, Send, Star, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  createMessageTemplate, deleteTemplate,
  createCampaign, createReviewLink, deleteReviewLink,
} from './actions';

export function MarketingClient({
  templates,
  campaigns,
  reviewLinks,
}: {
  templates: any[];
  campaigns: any[];
  reviewLinks: any[];
}) {
  const router = useRouter();
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [campaignFormOpen, setCampaignFormOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createMessageTemplate(formData);
    if (result.error) setError(result.error);
    else { setTemplateFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  const handleCreateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createCampaign(formData);
    if (result.error) setError(result.error);
    else { setCampaignFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  const handleCreateReviewLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await createReviewLink(formData);
    if (result.error) setError(result.error);
    else { setReviewFormOpen(false); router.refresh(); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground">Templates, campaigns &amp; reviews</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{templates.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Campaigns</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{campaigns.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Review Links</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{reviewLinks.length}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setTemplateFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Template
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                  No templates yet. Create one to start.
                </CardContent>
              </Card>
            ) : (
              templates.map((t) => (
                <Card key={t.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{t.name}</CardTitle>
                      <Badge>{t.channel}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3 text-sm text-muted-foreground line-clamp-3">{t.content}</p>
                    <Button variant="ghost" size="sm" className="text-destructive"
                      onClick={async () => { if (confirm('Delete?')) { await deleteTemplate(t.id); router.refresh(); } }}>
                      <Trash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setCampaignFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No campaigns yet</TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.channel}</Badge>
                      </TableCell>
                      <TableCell>{c.segmentKey}</TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'COMPLETED' ? 'default' : 'secondary'}>{c.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(c.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-4">
          <div className="mb-4 flex justify-end">
            <Button onClick={() => setReviewFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Review Link
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviewLinks.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Star className="mx-auto mb-2 h-8 w-8" />
                  Add your Google/Yelp review links to share with customers.
                </CardContent>
              </Card>
            ) : (
              reviewLinks.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{r.platform}</CardTitle>
                      <Button variant="ghost" size="icon" onClick={async () => {
                        if (confirm('Delete?')) { await deleteReviewLink(r.id); router.refresh(); }
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary underline break-all">
                      {r.url}
                    </a>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Form */}
      <Dialog open={templateFormOpen} onOpenChange={setTemplateFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Message Template</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2"><Label>Template Name</Label><Input name="name" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select name="channel" defaultValue="WHATSAPP">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Subject (email)</Label><Input name="subject" /></div>
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea name="body" rows={5} required
                placeholder="Use {{name}}, {{date}}, {{service}} as placeholders" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTemplateFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Campaign Form */}
      <Dialog open={campaignFormOpen} onOpenChange={setCampaignFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="space-y-2"><Label>Campaign Name</Label><Input name="name" required /></div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select name="templateId">
                <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.channel})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select name="audience" defaultValue="ALL">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Customers</SelectItem>
                    <SelectItem value="ACTIVE">Active Customers</SelectItem>
                    <SelectItem value="INACTIVE_30">Inactive 30+ Days</SelectItem>
                    <SelectItem value="BIRTHDAY">Upcoming Birthdays</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Schedule (optional)</Label>
                <Input name="scheduledAt" type="datetime-local" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCampaignFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Link Form */}
      <Dialog open={reviewFormOpen} onOpenChange={setReviewFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Review Link</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateReviewLink} className="space-y-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select name="platform" defaultValue="Google">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Yelp">Yelp</SelectItem>
                  <SelectItem value="JustDial">JustDial</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Review URL</Label><Input name="url" type="url" required /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReviewFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
