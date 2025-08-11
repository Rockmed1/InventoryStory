import TableLoading from "../_ui/client/TableLoading";
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

export default async function ItemsTrxDetailsTable({ itemTrxId }) {
  if (!itemTrxId) return null;

  // const queryClient = getQueryClient();

  // // DO NOT AWAIT. This starts the fetch and lets rendering continue.
  // queryClient.prefetchQuery({
  //   queryKey: ["itemTrxDetails", itemTrxId],
  //   queryFn: () => getServerData("itemTrxDetails", itemTrxId),
  // });

  // Just return the client component directly - no HydrationBoundary needed
  return <ItemsTrxDetailsTableClient itemTrxId={itemTrxId} />;
}

function Fallback() {
  return <TableLoading entity="itemTrxDetails" />;
}

ItemsTrxDetailsTable.Fallback = Fallback;
