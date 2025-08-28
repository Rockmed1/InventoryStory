import "@/app/_styles/globals.css";
//fonts using nextJs
import { Geist } from "next/font/google";

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

export default async function LandingLayout({ children }) {
  return <div>{children}</div>;
}
