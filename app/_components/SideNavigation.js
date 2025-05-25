import {
  ArchiveBoxIcon,
  ArrowRightEndOnRectangleIcon,
  ArrowsRightLeftIcon,
  ChartPieIcon,
  Cog8ToothIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
export default function SideNavigation() {
  return (
    <div className="mx-auto h-full w-[95%] rounded-lg px-2 py-4">
      <ul className="col-span-1 mx-auto flex h-full w-[80%] flex-col items-start gap-2 text-xs text-neutral-600 sm:gap-8 sm:text-xl">
        <li className="hover:font-semibold">
          <Link href="/" className="flex items-center justify-center gap-2">
            <HomeIcon className="h-6 w-6" />
            <div>Home</div>
          </Link>
        </li>
        <li className="hover:font-semibold">
          <Link
            href="/items"
            className="flex items-center justify-center gap-2"
          >
            <ArchiveBoxIcon className="h-6 w-6" />
            Items
          </Link>
        </li>
        <li className="hover:font-semibold">
          <Link
            href="/transactions"
            className="flex items-center justify-center gap-2"
          >
            <ArrowsRightLeftIcon className="h-6 w-6" />
            Transactions
          </Link>
        </li>
        <li className="hover:font-semibold">
          <Link
            href="/reports"
            className="flex items-center justify-center gap-2"
          >
            <ChartPieIcon className="h-6 w-6" />
            Reports
          </Link>
        </li>
        <li className="hover:font-semibold">
          <Link
            href="/settings"
            className="flex items-center justify-center gap-2"
          >
            <Cog8ToothIcon className="h-6 w-6" />
            Settings
          </Link>
        </li>
        <li className="mt-auto hover:font-semibold">
          <Link href="/" className="flex items-center justify-center gap-2">
            <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
            Sign out/ Account
          </Link>
        </li>
      </ul>
    </div>
  );
}
