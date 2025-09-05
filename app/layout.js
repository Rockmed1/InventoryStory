import "@/app/_styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import { Geist } from "next/font/google";

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
        <ClerkProvider appearance={{ theme: shadcn, cssLayerName: "clerk" }}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
