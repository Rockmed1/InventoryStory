import ItemsTrxDetailsTable from "@/app/_components/ItemsTrxDetailsTable";
import ItemsTrxTable from "@/app/_components/ItemsTrxTable";
import UseAuth from "@/app/_hooks/useAuth";
import Link from "next/link";
import { Suspense } from "react";

//metadata
export async function generateMetadata({ params }) {
  const { itemId } = await params;
  return { title: `Item: ${itemId}` };
}

// export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Page({ params }) {
  const { item_trx_id = Number(item_trx_id) } = await params;

  if (item_trx_id === "error" || !item_trx_id) {
    throw new Error("transaction Id error");
  }
  //addItemTrxDetails
  console.log("details params:", item_trx_id);
  // cookies(); //headers() //

  //1- authenticate the user

  const { _org_uuid } = UseAuth();

  return (
    <>
      <div>
        <Link href="/transactions">All Transactions</Link>
        <h2>Transaction: {item_trx_id}</h2>
      </div>
      <div className="container m-auto grid w-full items-center gap-6 p-2">
        <Suspense fallback={<ItemsTrxTable.Fallback />}>
          <ItemsTrxTable
            org_uuid={_org_uuid}
            type="simple"
            item_trx_id={item_trx_id}
          />
        </Suspense>

        <Suspense fallback={<ItemsTrxDetailsTable.Fallback />}>
          <ItemsTrxDetailsTable
            org_uuid={_org_uuid}
            item_trx_id={item_trx_id}
          />
        </Suspense>
      </div>
    </>
  );
}
