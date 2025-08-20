import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import MarketsTableClient from "../client/MarketsTableClient";

const labels = ["Market ID", "Name", "Description", "Market Type"];

export default async function MarketsTable() {
  const queryClient = getQueryClient();
  const dataParams = { entity: "market", id: "all" };

  await queryClient.prefetchQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => getServerData(dataParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketsTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading entity="market" />;
}

MarketsTable.Fallback = Fallback;
