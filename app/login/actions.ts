'use server';

import { verifyPassword, loginAdmin } from '@/lib/auth';

export interface LoginState {
  error: string;
  success: boolean;
}

export async function loginAction(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get('password') as string;

  if (!password) {
    return { error: 'Password is required', success: false };
  }

  const isValid = await verifyPassword(password);
  if (!isValid) {
    return { error: 'Incorrect password', success: false };
  }

  await loginAdmin();
  return { error: '', success: true };
}
