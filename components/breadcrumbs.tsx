'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb Component
 *
 * Usage:
 * <Breadcrumbs items={[
 *   { label: 'Admin', href: '/admin' },
 *   { label: 'Etkinlikler', href: '/admin/events' },
 *   { label: 'Düzenle' }
 * ]} />
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {showHome && (
          <>
            <li>
              <Link
                href="/"
                className="hover:text-blue-600 transition-colors flex items-center"
                aria-label="Ana Sayfa"
              >
                <Home className="w-4 h-4" />
              </Link>
            </li>
            {items.length > 0 && (
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </li>
            )}
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {!isLast && item.href ? (
                <>
                  <Link
                    href={item.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" aria-hidden="true" />
                </>
              ) : (
                <span
                  className="font-medium text-gray-900"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
