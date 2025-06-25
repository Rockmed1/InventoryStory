import Footer from "@/app/_ui/Footer";
import Loader from "@/app/_ui/Loader";
import Navigation from "@/app/_ui/Navigation";

import "@/app/_styles/globals.css";
//fonts using nextJs
import { Geist } from "next/font/google";
import SideNavigation from "./_ui/SideNavigation";

//Vazirmatn
//Geist

const mainFont = Geist({
  // const mainFont = Inter({
  // weight: ['100', '300', '400', '700', '900'],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Inventory Story",
  description: "Smart inventory management is here!",
};

export default async function RootLayout({ children }) {
  let isLoading = false;

  return (
    <html lang="en">
      <body className={`${mainFont.className} w-`}>
        <div className="bg-primary-100 mx-auto grid h-dvh max-w-[98%] grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto] gap-1 rounded-xl pt-2 text-sm text-gray-900">
          <header className="col-span-2">
            <Navigation />
          </header>

          {isLoading && <Loader />}

          <SideNavigation />
          {/* <div className="col-span-1"> */}
          <main className="bg-primary-50 col-span-1 mr-2.5 h-full rounded-xl p-2 shadow-sm">
            {children}
          </main>
          {/* </div> */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
