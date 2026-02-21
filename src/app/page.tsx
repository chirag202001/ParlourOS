import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/rbac';

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect('/app/dashboard');
  }
  redirect('/login');
}
