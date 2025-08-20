import ItemsTrxDetailsTable from "@/app/_components/server/ItemsTrxDetailsTable";
import ItemsTrxTable from "@/app/_components/server/ItemsTrxTable";
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
  console.log(numericItemTrxId);

  if (itemTrxId === "error" || !itemTrxId || isNaN(numericItemTrxId)) {
    throw new Error("transaction Id error");
  }
  //addItemTrxDetails
  // console.log("details params:", itemTrxId);
  // cookies(); //headers() //

  //1- authenticate the user

  return (
    <>
      <div>
        <Link href="/transactions">All Transactions</Link>
        <h2>Transaction: {itemTrxId}</h2>
      </div>
      <div className="container m-auto grid w-full items-center gap-6 p-2">
        <Suspense fallback={<ItemsTrxTable.Fallback />}>
          <ItemsTrxTable type="simple" itemTrxId={numericItemTrxId} />
        </Suspense>

        <Suspense fallback={<ItemsTrxDetailsTable.Fallback />}>
          <ItemsTrxDetailsTable itemTrxId={numericItemTrxId} />
        </Suspense>
      </div>
    </>
  );
}
