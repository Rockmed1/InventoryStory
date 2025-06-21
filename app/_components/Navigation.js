import Logo from '@/app/_components/Logo';
import Link from 'next/link';

export default function Navigation() {
  return (
    <div className="w-100% col-span-2 m-auto mx-2.5 flex items-center justify-between gap-4 rounded-xl border-b-[0.5] border-stone-300 bg-neutral-100 px-2.5 py-1 shadow-xs">
      <Logo />
      <input type="text" placeholder="Search Item..." className="input" />

      <ul className="sm:text-md flex items-center justify-between gap-2 font-semibold text-slate-700 sm:gap-4">
        <li>
          <Link href="/" className="hover:font-bold hover:text-slate-700">
            Sign in/ Account
          </Link>
        </li>
      </ul>
    </div>
  );
}
