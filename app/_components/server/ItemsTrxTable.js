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

export default async function ItemsTrxTable({
  type = "compound",
  item_trx_id,
}) {
  const queryClient = getQueryClient();

  // DO NOT AWAIT. This starts the fetch and lets rendering continue.
  queryClient.prefetchQuery({
    queryKey: ["itemTrx", type === "simple" ? item_trx_id : "all"],
    queryFn: () => {
      if (type === "simple" && item_trx_id) {
        return getServerData("itemTrx", item_trx_id);
      } else {
        return getServerData("itemTrx");
      }
    },
  });

  // Also prefetch itemTrxDetails if we have an item_trx_id
  if (item_trx_id) {
    queryClient.prefetchQuery({
      queryKey: ["itemTrxDetails", item_trx_id],
      queryFn: () => getServerData("itemTrxDetails", item_trx_id),
    });
  }

  // 2. Dehydrate the cache immediately. The query is now 'pending'.
  //    This promise is passed to the client.
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemsTrxTableClient type={type} item_trx_id={item_trx_id}>
        {/* Server component is passed as a child to the client component */}
        <ItemsTrxDetailsTable item_trx_id={item_trx_id} />
      </ItemsTrxTableClient>
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

ItemsTrxTable.Fallback = Fallback;
