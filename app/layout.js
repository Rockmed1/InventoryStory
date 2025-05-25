import Footer from '@/app/_components/Footer';
import Navigation from '@/app/_components/Navigation';
import Loader from './_components/Loader';

import '@/app/globals.css';
//fonts using nextJs
import { Vazirmatn } from 'next/font/google';
import SideNavigation from './_components/SideNavigation';

const mainFont = Vazirmatn({
  // weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Inventory Master',
  description: 'Inventory management is here!',
};

export default function RootLayout({ children }) {
  let isLoading = false;

  return (
    <html lang="en">
      <body
        className={`${mainFont.className} text-primary-950 grid h-dvh grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto] gap-y-2 bg-neutral-200`}
      >
        <header className="col-span-2">
          <Navigation />
        </header>
        {isLoading && <Loader />}
        <SideNavigation />
        <div className="col-span-1">
          <main className="mr-2 h-full overflow-scroll">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
