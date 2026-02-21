'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors, ArrowRight, Building2, User, Sparkles } from 'lucide-react';

type Step = 'business' | 'branch' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('business');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Business details
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Branch details
  const [branchName, setBranchName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  const [tenantId, setTenantId] = useState('');

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: businessName, ownerName, email, password, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create business');

      setTenantId(data.tenantId);
      setBranchName(businessName + ' - Main');
      setStep('branch');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding/branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          name: branchName,
          city,
          address,
          phone: branchPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create branch');

      setStep('complete');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = async () => {
    const { signIn } = await import('next-auth/react');
    await signIn('credentials', { email, password, redirect: false });
    router.push('/app/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'business' ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>1</div>
          <div className="h-0.5 w-8 bg-primary/20" />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'branch' ? 'bg-primary text-white' : step === 'complete' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>2</div>
          <div className="h-0.5 w-8 bg-primary/20" />
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'complete' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>3</div>
        </div>

        {step === 'business' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Create Your Salon Account</CardTitle>
              <CardDescription>Set up your business in under 2 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBusiness} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" placeholder="Glamour Beauty Salon" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Your Name</Label>
                  <Input id="ownerName" placeholder="Priya Sharma" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="priya@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Continue'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'branch' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Add Your First Branch</CardTitle>
              <CardDescription>Where is your salon located?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateBranch} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="branchName">Branch Name</Label>
                  <Input id="branchName" placeholder="Main Branch" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branchPhone">Branch Phone</Label>
                    <Input id="branchPhone" placeholder="022-12345678" value={branchPhone} onChange={(e) => setBranchPhone(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Shop No 5, ABC Mall, Andheri West" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Branch'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>You&apos;re All Set! 🎉</CardTitle>
              <CardDescription>
                Your salon is ready. Start adding services, staff, and take bookings.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleGoToDashboard} className="w-full" size="lg">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
