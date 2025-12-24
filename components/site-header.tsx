'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LogOut,
  User,
  Menu,
  X,
  Calendar,
  FileText,
  Home,
  GraduationCap,
  UserCircle
} from 'lucide-react';

export default function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Don't show on auth pages
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/admin/login')
  ) {
    return null;
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const user = session?.user as any;
  const isLoggedIn = !!session;

  // Public navigation items
  const publicNavItems = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Etkinlikler', href: '/#etkinlikler', icon: Calendar },
    { name: 'Hakkımızda', href: '/hakkimizda', icon: FileText },
  ];

  // User dashboard navigation (only for logged in users)
  const userNavItems = isLoggedIn ? [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Başvurularım', href: '/dashboard/applications', icon: FileText },
  ] : [];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto">
          <div className="flex h-16 items-center justify-between px-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Kongre Yönetim</h1>
                <p className="text-xs text-gray-500">Congress Management</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === item.href ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}

              {/* User Navigation (if logged in) */}
              {userNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${
                    pathname === item.href || pathname.startsWith(item.href)
                      ? 'text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side - Auth Buttons */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  {/* User Info (Desktop) */}
                  <div className="hidden md:flex items-center gap-3 border-l pl-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.name || 'Kullanıcı'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.role === 'ADMIN' ? 'Yönetici' :
                         user?.role === 'HAKEM' ? 'Hakem' : 'Katılımcı'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Çıkış Yap"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                  >
                    {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <UserCircle className="h-4 w-4" />
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Üye Ol
                  </Link>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                  >
                    {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t bg-white py-4 px-4 space-y-3">
              {publicNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}

              {isLoggedIn ? (
                <>
                  <div className="border-t pt-3 mt-3">
                    {userNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowMobileMenu(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          pathname.startsWith(item.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="px-3 py-2 mb-2">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {user?.role === 'ADMIN' ? 'Yönetici' :
                         user?.role === 'HAKEM' ? 'Hakem' : 'Katılımcı'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Çıkış Yap</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-3 mt-3 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserCircle className="h-5 w-5" />
                    <span className="font-medium">Giriş Yap</span>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="font-medium">Üye Ol</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Çıkış Yap</h3>
            <p className="text-gray-600 mb-6">
              Sistemden çıkış yapmak istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
