import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Next.js Middleware with NextAuth - Congress Management System
 *
 * Bu middleware:
 * 1. Public sayfaları herkese açık bırakır (/, /events/*, /auth/register, /hakkimizda, /gizlilik-politikasi)
 * 2. /dashboard rotalarını tüm giriş yapmış kullanıcılara açar
 * 3. /admin rotalarını sadece ADMIN rolüne sahip kullanıcılara açar
 * 4. Yetkisiz erişim denemelerinde uygun sayfaya yönlendirir
 */

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin login sayfası herkese açık - kontrol etme
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // İlk giriş şifre değiştirme kontrolü
    const firstLoginPasswordChangePath = '/auth/change-password-first-login';

    // Kullanıcı ilk girişini yapmışsa ve şifre değiştirme sayfasında değilse, yönlendir
    if (token?.ilk_giris === true && path !== firstLoginPasswordChangePath) {
      return NextResponse.redirect(new URL(firstLoginPasswordChangePath, req.url));
    }

    // Kullanıcı şifresini zaten değiştirmişse, şifre değiştirme sayfasına erişemesin
    if (token?.ilk_giris === false && path === firstLoginPasswordChangePath) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Admin sayfalarına erişim kontrolü (admin/login hariç)
    if (path.startsWith('/admin')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'SUPER_ADMIN' && token?.role !== 'HAKEM' && token?.role !== 'ORGANIZATOR') {
        // Yetkili değilse dashboard'a yönlendir
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Public paths - authentication gerektirmez
        const publicPaths = [
          '/',
          '/login',
          '/auth/register',
          '/admin/login',
          '/hakkimizda',
          '/gizlilik-politikasi',
        ];

        // Exact match için kontrol
        if (publicPaths.includes(path)) {
          return true;
        }

        // Pattern match için kontrol
        if (path.startsWith('/events/')) {
          return true;
        }

        // API routes
        if (path.startsWith('/api/auth') || path === '/api/auth/register') {
          return true;
        }

        // Diğer tüm rotalar için authentication gerekli
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, *.png, *.jpg, *.svg (image files)
     * - manifest.json (PWA manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|manifest.json).*)',
  ],
};
