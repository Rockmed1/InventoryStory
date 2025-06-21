import Footer from '@/app/_components/Footer';
import Navigation from '@/app/_components/Navigation';
import Loader from '@/app/_components/Loader';

import '@/app/_styles/globals.css';
//fonts using nextJs
import { Geist } from 'next/font/google';
import SideNavigation from './_components/SideNavigation';

//Vazirmatn
//Geist

const mainFont = Geist({
  // const mainFont = Inter({
  // weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Inventory Story',
  description: 'Smart inventory management is here!',
};

export default async function RootLayout({ children }) {
  let isLoading = false;

  return (
    <html lang="en">
      <body className={`${mainFont.className} w-`}>
        <div className="mx-auto grid h-dvh max-w-[98%] grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto] gap-1 rounded-xl bg-neutral-50 pt-2 text-gray-900">
          <header className="col-span-2">
            <Navigation />
          </header>
          {isLoading && <Loader />}

          <SideNavigation />
          <div className="col-span-1">
            <main className="h-full rounded-xl p-2 shadow-sm">{children}</main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
