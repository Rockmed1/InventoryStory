import Table from "../_ui/client/Table";
import ItemsTrxDetailsTableClient from "../client/ItemsTrxDetailsTableClient";

const labels = [
  "Line #",
  "Description",
  "Item Id",
  "Item Name",
  "From Bin Id",
  "From Bin",
  "To Bin Id",
  "To Bin",
  "Qty in",
  "Qty out",
];

export default async function ItemsTrxDetailsTable({ item_trx_id }) {
  if (!item_trx_id) return null;

  // const queryClient = getQueryClient();

  // // DO NOT AWAIT. This starts the fetch and lets rendering continue.
  // queryClient.prefetchQuery({
  //   queryKey: ["itemTrxDetails", item_trx_id],
  //   queryFn: () => getServerData("itemTrxDetails", item_trx_id),
  // });

  // Just return the client component directly - no HydrationBoundary needed
  return <ItemsTrxDetailsTableClient item_trx_id={item_trx_id} />;
}

function Fallback() {
  return <Table labels={labels} />;
}

ItemsTrxDetailsTable.Fallback = Fallback;
