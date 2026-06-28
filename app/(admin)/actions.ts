'use server';

import { logoutAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  await logoutAdmin();
  redirect('/login');
}
