import "@/app/_styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { Geist } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./_store/AppProvider";
import QueryProvider from "./_store/QueryProvider";

const mainFont = Geist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Inventory Story",
    template: "%s | Story",
  },
  description: "Smart inventory management is here!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${mainFont.className} `}>
        <ClerkProvider appearance={{ theme: shadcn }}>
          <QueryProvider>
            <AppProvider>
              {children}
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
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}