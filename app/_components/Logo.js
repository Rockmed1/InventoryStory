import logoImage from '@/public/InventoryMoney.png';
import { Lora } from 'next/font/google';
import Image from 'next/image';

//font using NextJs
const secondFont = Lora({
  // weight: '400',
  // weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
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
          s
          src={logoImage}
          alt="Inventory House Logo"
          height="60"
          width="60"
          className="block rounded-full"
        />
      </span>
      <span
        className={`${secondFont.className} text-primary-800 hidden text-3xl font-semibold tracking-tighter sm:block`}
      >
        Inventory story
      </span>
    </div>
  );
}
