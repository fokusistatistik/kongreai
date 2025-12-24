import type { Metadata } from 'next';
import './globals.css';
import { ToastContainer } from '@/components/toast-container';
import { ConfirmDialogContainer } from '@/components/confirm-dialog';
import Chatbot from '@/components/chatbot';
import { Providers } from '@/components/providers';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import MobileNav from '@/components/mobile-nav';

export const metadata: Metadata = {
  title: 'Kongre Yönetim Sistemi',
  description: 'Bilimsel Kongre ve Etkinlik Yönetim Platformu - Online başvuru, bildiri gönderimi ve etkinlik takibi',
  keywords: [
    'kongre',
    'bilimsel etkinlik',
    'sempozyum',
    'bildiri',
    'akademik kongre',
    'etkinlik yönetimi',
  ],
  authors: [{ name: 'Congress Management Team' }],
  creator: 'Congress Management System',
  publisher: 'Congress Management Platform',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="Kongre Yönetim Sistemi" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KongreAI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon.png" />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Providers>
          <SiteHeader />
          <main className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <MobileNav />
          <ToastContainer />
          <ConfirmDialogContainer />
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
