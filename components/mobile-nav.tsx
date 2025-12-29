'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ClipboardList, PlusCircle, Bell, User } from 'lucide-react';

/**
 * Mobile Navigation Component
 *
 * Bottom navigation bar for mobile devices
 * Shows active state based on current route
 */

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Ana Sayfa',
    href: '/',
    icon: Home,
  },
  {
    label: 'Etkinlikler',
    href: '/',
    icon: ClipboardList,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: User,
  },
  {
    label: 'Profil',
    href: '/dashboard/profile',
    icon: User,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  // Don't show on login/auth pages
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/sifre-')
  ) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16 md:hidden" aria-hidden="true" />

      {/* Bottom Navigation */}
      <nav
        className="mobile-nav-bottom bg-white/90 backdrop-blur-md border-t border-gray-200/50 shadow-lg md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center
                  flex-1 h-full gap-1
                  transition-colors duration-200
                  ${isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'
                    }`}
                />
                <span
                  className={`text-xs font-medium ${isActive ? 'font-semibold' : ''
                    }`}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
