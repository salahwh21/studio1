'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const LoadingSkeleton = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <Skeleton className="h-8 w-48 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  </div>
);

export function ProtectedRoute({ 
  children, 
  allowedRoles = [],
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      // إذا لم يكن المستخدم مسجل دخول، توجيهه لصفحة تسجيل الدخول
      if (!isAuthenticated) {
        const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
        router.push(redirectUrl);
        return;
      }

      // إذا كان هناك أدوار محددة، التحقق من صلاحية المستخدم
      if (allowedRoles.length > 0 && user) {
        if (!allowedRoles.includes(user.roleId)) {
          // توجيه المستخدم للصفحة المناسبة حسب دوره
          if (user.roleId === 'merchant') {
            router.push('/merchant');
          } else if (user.roleId === 'driver') {
            router.push('/dashboard/driver-app');
          } else if (user.roleId === 'admin') {
            router.push('/dashboard');
          } else {
            router.push(redirectTo);
          }
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname, redirectTo]);

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // إذا لم يكن مسجل دخول، لا تعرض المحتوى
  if (!isAuthenticated) {
    return <LoadingSkeleton />;
  }

  // إذا كان هناك أدوار محددة والمستخدم ليس لديه الصلاحية
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.roleId)) {
    return <LoadingSkeleton />;
  }

  // عرض المحتوى المحمي
  return <>{children}</>;
}
