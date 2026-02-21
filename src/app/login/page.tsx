'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/app/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Scissors className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to ParlourOS</CardTitle>
          <CardDescription>Sign in to manage your salon</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@salon.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/onboarding" className="text-primary hover:underline">
              Get Started
            </Link>
          </div>

          {/* Demo Quick Login Buttons */}
          <div className="mt-5 border-t pt-4">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '👑 Owner', email: 'owner@demo.com', color: 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200' },
                { label: '📋 Manager', email: 'manager@demo.com', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200' },
                { label: '💇 Stylist', email: 'anjali@demo.com', color: 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200' },
                { label: '🖥️ Reception', email: 'reception@demo.com', color: 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${demo.color}`}
                  onClick={() => {
                    setEmail(demo.email);
                    setPassword('password123');
                  }}
                >
                  {demo.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Click a role above, then press Sign In • Password: password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
