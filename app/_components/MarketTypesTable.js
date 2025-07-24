import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../_store/queryClient";
import { getData } from "../_utils/helpers-server";
import TableLoading from "./_ui/client/TableLoading";
import MarketTypesTableClient from "./client/MarketTypesTableClient";

const labels = ["Market Type ID", "Name", "Description"];

export default async function MarketTypesTable() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["marketType"],
    queryFn: () => getData("marketType"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketTypesTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

MarketTypesTable.Fallback = Fallback;
