import Footer from "@/app/_components/_ui/Footer";
import Loader from "@/app/_components/_ui/Loader";
import Navigation from "@/app/_components/_ui/Navigation";
import "@/app/_styles/globals.css";
//fonts using nextJs
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import SideNavigation from "./_components/_ui/client/SideNavigation";
import { AppProvider } from "./_store/AppProvider";

//Vazirmatn
//Geist

const mainFont = Geist({
  // const mainFont = Inter({
  // weight: ['100', '300', '400', '700', '900'],
  subsets: ["latin"],
  display: "swap",
});

// export const metadata = {
//   title: "Inventory Story",
//   description: "Smart inventory management is here!",
// };

export const metadata = {
  title: {
    default: "Inventory Story",
    template: "%s | Story",
  },
  description: "Smart inventory management is here!",
};

export default async function RootLayout({ children }) {
  let isLoading = false;

  //2- Wrap the entire layout in the provider to create an empty store

  return (
    <html lang="en">
      <body className={`${mainFont.className} `}>
        <AppProvider>
          <div className="mx-auto grid h-[calc(100dvh-16px)] max-w-[98%] grid-cols-[16rem_1fr] grid-rows-[auto_1fr_auto] gap-y-2 rounded-xl border border-neutral-200 bg-zinc-50 pt-2 text-sm text-gray-900">
            <header className="col-span-2 overflow-scroll">
              <Navigation />
            </header>

            {isLoading && <Loader />}

            <SideNavigation />
            {/* <div className="col-span-1"> */}

            <main className="col-span-1 row-span-2 mr-2.5 h-[calc(100%-8px)] overflow-scroll rounded-xl bg-white p-2 shadow-sm">
              {children}
            </main>

            {/* </div> */}
            <Footer />
          </div>
          <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={{
              success: {
                duration: 3000,
              },
              error: {
                duration: 5000,
              },
              style: {
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                backgroundColor: "var(--color-grey-0)",
                color: "var(--color-grey-700)",
              },
            }}
          />
        </AppProvider>
      </body>
    </html>
  );
}
