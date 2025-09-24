
'use client';
import LoginPageClient from '@/components/login-page-client';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageClient />
    </Suspense>
  );
}
