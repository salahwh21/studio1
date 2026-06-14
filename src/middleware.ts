import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth check is now always active regardless of environment

  const token = request.cookies.get('auth_token')?.value;

  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (!isPublicRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && token && (pathname === '/' || pathname === '/login')) {
    // نوجّه حسب الدور المخزّن في الـ JWT payload
    // الـ middleware لا يستطيع فك الـ JWT بدون secret فنوجّه للـ dashboard
    // والـ AuthContext سيُعيد التوجيه الصحيح بعد جلب بيانات المستخدم
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // منع التاجر من الوصول للـ dashboard والعكس
  if (token) {
    if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/driver-app')) {
      // لا نحجب هنا — ProtectedRoute في الكلاينت يتولى التوجيه الصحيح
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)',
  ],
};
