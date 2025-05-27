// app/ui/dashboard/nav-links.tsx
'use client';

import {
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export const navLinks = [
  { name: 'Trade Builder', href: '/dashboard', icon: HomeIcon },
  { name: 'Saved Trades', href: '/dashboard/saved', icon: DocumentDuplicateIcon },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {navLinks.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-700 border border-transparent hover:border-purple-200 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-purple-50 text-purple-700 border-purple-200": pathname === link.href,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}