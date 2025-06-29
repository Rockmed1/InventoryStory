import logoImage from "@/public/InventoryMoney.png";
// import logoImage from '@/public/InventoryProcess.png';
import { Lora } from "next/font/google";
import Image from "next/image";

//font using NextJs
const secondFont = Lora({
  // weight: '400',
  // weight: ['300', '400', '700', '900'],
  subsets: ["latin"],
  display: "swap",
});

export default function Logo() {
  return (
    <div className="flex items-center gap-0.5">
      {/* <Image
        src="/InventoryMoney.png"
        alt="Inventory House Logo"
        height="60"
        width="60"
        className="block rounded-full"
    /> */}
      <span className="w-10 sm:w-16">
        <Image
          src={logoImage}
          alt="Inventory House Logo"
          height="60"
          width="60"
          className="block rounded-full"
        />
      </span>
      <span
        className={`${secondFont.className} hidden text-3xl font-semibold tracking-tighter text-neutral-900 text-shadow-neutral-200 sm:block`}>
        Inventory story
      </span>
    </div>
  );
}
