'use client';

import { AppLayout } from '@/components/app-layout';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  return <AppLayout>{children}</AppLayout>;
}
