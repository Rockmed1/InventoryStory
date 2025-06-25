"use client";

import {
  ArchiveBoxIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowsRightLeftIcon,
  ChartPieIcon,
  Cog8ToothIcon,
  HomeIcon,
  PuzzlePieceIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNavigation() {
  const pathName = usePathname();

  const navLinks = {
    top: [
      {
        name: "Home",
        href: "/",
        icon: <HomeIcon className="" />,
      },
      {
        name: "Items",
        href: "/items",
        icon: <ArchiveBoxIcon className="" />,
      },

      {
        name: "Transactions",
        href: "/transactions",
        icon: <ArrowsRightLeftIcon className="" />,
      },

      {
        name: "Reports",
        href: "/reports",
        icon: <ChartPieIcon className="" />,
      },

      {
        name: "Setup",
        href: "/setup",
        icon: <PuzzlePieceIcon className="" />,
      },
    ],
    bottom: [
      {
        name: "Settings",
        href: "/settings",
        icon: <Cog8ToothIcon className="" />,
      },
      {
        name: "Sign out/ Account",
        href: "/",
        icon: <ArrowRightEndOnRectangleIcon />,
      },
    ],
  };
  return (
    <div className="mx-auto h-full w-full rounded-xl p-2">
      <ul className="col-span-1 mx-auto flex h-full flex-col items-start text-gray-900">
        {navLinks.top.map((link) => (
          <li className="w-full" key={link.name}>
            <Link
              href={link.href}
              className={`flex items-center justify-items-start gap-2 rounded-md p-2 transition-all duration-300 hover:font-semibold [&_svg]:size-6 hover:[&_svg]:stroke-[1.6] ${pathName === link.href ? "bg-primary-200" : "hover:bg-primary-200"}`}>
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          </li>
        ))}

        <div className="mt-auto w-full">
          {navLinks.bottom.map((link) => (
            <li className="w-full" key={link.name}>
              <Link
                href={link.href}
                className={`flex items-center justify-items-start gap-2 rounded-md p-2 transition-all duration-300 hover:font-semibold [&_svg]:size-6 hover:[&_svg]:stroke-[1.6] ${pathName === link.href ? "bg-primary-200" : "hover:bg-primary-200"}`}>
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
}
