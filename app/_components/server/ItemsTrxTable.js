import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import ItemsTrxTableClient from "../client/ItemsTrxTableClient";
import ItemsTrxDetailsTable from "./ItemsTrxDetailsTable";

const labels = [
  "Trx ID",
  "Date",
  "Description",
  "Trx Type",
  "Direction",
  "Market",
  "URL",
];

export default async function ItemsTrxTable({ type = "compound", itemTrxId }) {
  const queryClient = getQueryClient();

  // DO NOT AWAIT. This starts the fetch and lets rendering continue.
  queryClient.prefetchQuery({
    queryKey: ["itemTrx", type === "simple" ? itemTrxId : "all"],
    queryFn: () => {
      if (type === "simple" && itemTrxId) {
        return getServerData("itemTrx", itemTrxId);
      } else {
        return getServerData("itemTrx");
      }
    },
  });

  // Also prefetch itemTrxDetails if we have an itemTrxId
  if (itemTrxId) {
    queryClient.prefetchQuery({
      queryKey: ["itemTrxDetails", itemTrxId],
      queryFn: () => getServerData("itemTrxDetails", itemTrxId),
    });
  }

  // 2. Dehydrate the cache immediately. The query is now 'pending'.
  //    This promise is passed to the client.
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemsTrxTableClient type={type} itemTrxId={itemTrxId}>
        {/* Server component is passed as a child to the client component */}
        <ItemsTrxDetailsTable itemTrxId={itemTrxId} />
      </ItemsTrxTableClient>
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading entity="itemTrx" />;
}

ItemsTrxTable.Fallback = Fallback;
