'use client';

import {
  ArchiveBoxIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowsRightLeftIcon,
  ChartPieIcon,
  Cog8ToothIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideNavigation() {
  const pathName = usePathname();

  const navLinks = [
    {
      name: 'Home',
      href: '/',
      icon: <HomeIcon className="size-6" />,
    },
    {
      name: 'Items',
      href: '/items',
      icon: <ArchiveBoxIcon className="size-6" />,
    },

    {
      name: 'Transactions',
      href: '/transactions',
      icon: <ArrowsRightLeftIcon className="size-6" />,
    },

    {
      name: 'Reports',
      href: '/reports',
      icon: <ChartPieIcon className="size-6" />,
    },

    {
      name: 'Settings',
      href: '/settings',
      icon: <Cog8ToothIcon className="size-6" />,
    },
  ];

  return (
    <div className="mx-auto h-full w-full rounded-lg p-2">
      <ul className="col-span-1 mx-auto flex h-full flex-col items-start text-xs text-gray-900 sm:text-sm">
        {navLinks.map(link => (
          <li className="w-[100%]" key={link.name}>
            <Link
              href={link.href}
              className={`flex items-center justify-items-start gap-2 rounded-lg p-2 transition-all duration-300 hover:bg-neutral-100 hover:font-semibold ${pathName === link.href ? 'bg-neutral-100' : ''}`}
            >
              {link.icon}
              <div>{link.name}</div>
            </Link>
          </li>
        ))}

        <li className="mt-auto hover:font-semibold">
          <Link
            href="/"
            className="flex items-center justify-items-start gap-2 rounded-lg p-2 transition-all duration-300 hover:bg-neutral-100 hover:font-semibold"
          >
            <ArrowRightEndOnRectangleIcon className="size-6" />
            Sign out/ Account
          </Link>
        </li>
      </ul>
    </div>
  );
}
