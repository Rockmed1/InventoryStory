import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../_store/queryClient";
import { getData } from "../_utils/helpers-server";
import TableLoading from "./_ui/client/TableLoading";
import MarketsTableClient from "./client/MarketsTableClient";

const labels = ["Market ID", "Name", "Description", "Market Type"];

export default async function MarketsTable() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["market"],
    queryFn: () => getData("market"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketsTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

MarketsTable.Fallback = Fallback;
