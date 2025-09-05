import ItemsTrxDetailsTable from "@/app/_components/server/ItemsTrxDetailsTable";
import ItemsTrxTable from "@/app/_components/server/ItemsTrxTable";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Suspense } from "react";

//metadata
export async function generateMetadata({ params }) {
  const { itemTrxId } = await params;
  return { title: `Item Transaction Id: ${itemTrxId}` };
}

// export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Page({ params }) {
  const { itemTrxId } = await params;
  const numericItemTrxId = Number(itemTrxId);
  // console.log(numericItemTrxId);

  if (itemTrxId === "error" || !itemTrxId || isNaN(numericItemTrxId)) {
    throw new Error("transaction Id error");
  }
  //addItemTrxDetails
  // console.log("details params:", itemTrxId);
  // cookies(); //headers() //

  //1- authenticate the user

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-shrink-0 items-center justify-between gap-2">
        <h2 className="font-medium">Transaction: {itemTrxId}</h2>
        <Link
          href="/transactions"
          className={`flex items-center justify-items-start gap-2 rounded-md p-2 text-sm transition-all duration-300 hover:font-semibold [&_svg]:size-4 hover:[&_svg]:stroke-[1.6]`}>
          <ArrowsRightLeftIcon className="" />
          All Transactions
        </Link>
      </div>
      <div className="container m-auto grid w-full items-center gap-6 p-2">
        <Suspense fallback={<ItemsTrxTable.Fallback />}>
          <ItemsTrxTable type="simple" itemTrxId={numericItemTrxId} />
        </Suspense>

        <Suspense fallback={<ItemsTrxDetailsTable.Fallback />}>
          <ItemsTrxDetailsTable itemTrxId={numericItemTrxId} />
        </Suspense>
      </div>
    </div>
  );
}
