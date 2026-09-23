import { redirect } from 'next/navigation';
import { checkIsAuthenticated } from '@/lib/auth';

export default async function HomePage() {
  const isAuthenticated = await checkIsAuthenticated();
  if (isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/find-table');
  }
}
