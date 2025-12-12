'use client';

import { AppLayout } from '@/components/app-layout';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // صفحة الطلبات لا تحتاج AppLayout - استغلال كامل للمساحة
  if (pathname === '/dashboard/orders') {
    return <>{children}</>;
  }
  
  return <AppLayout>{children}</AppLayout>;
}
