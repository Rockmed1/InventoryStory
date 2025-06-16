import Footer from '@/app/_components/Footer';
import Navigation from '@/app/_components/Navigation';
import Loader from './_components/Loader';

import '@/app/globals.css';
//fonts using nextJs
import { Vazirmatn } from 'next/font/google';
import SideNavigation from './_components/SideNavigation';
import { supabase } from './_lib/supabase';

const mainFont = Vazirmatn({
  // weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Inventory Master',
  description: 'Inventory management is here!',
};

export default async function RootLayout({ children }) {
  let isLoading = false;

  const _usr_name = 'sa';
  // const _data = {
  //   _org_uuid: '7c41632c-0242-44d4-8cdc-6a31ceb7495d',
  //   _usr_uuid: 'a42babf9-3d65-415a-b0ea-2bfddba003dd',
  //   _item_class_name: 'class2',
  //   _item_class_desc: 'text1 text text text text',
  // };
  const _data = {
    _org_uuid: '7c41632c-0242-44d4-8cdc-6a31ceb7495d',
    _usr_uuid: 'a42babf9-3d65-415a-b0ea-2bfddba003dd',
    _item_trx_desc: 'test sales trans',
    _trx_date: '3/1/2024',
    _item_trx_id: 3,
    _item_id: '2',
    _from_bin: 2,
    _to_bin: 3,
    _qty_in: 3,
    _qty_out: 2,
  };
  // const { data, error } = await supabase.rpc('fn_get_item_transction_details', {
  //   _data,
  // });
  const { data, error } = await supabase.rpc('fn_create_item_trx_details', {
    _data,
  });

  console.log(data, error);

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
