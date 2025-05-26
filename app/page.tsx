// app/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

export default async function Page() {
  const session = await auth();
  
  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }
  
  // If not logged in, redirect to login
  redirect('/login');
}