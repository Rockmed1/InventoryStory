import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import MarketTypesTableClient from "../client/MarketTypesTableClient";

const labels = ["Market Type ID", "Name", "Description"];

export default async function MarketTypesTable() {
  const queryClient = getQueryClient();
  const dataParams = { entity: "marketType", id: "all" };

  await queryClient.prefetchQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => getServerData(dataParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketTypesTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading entity="marketType" />;
}

MarketTypesTable.Fallback = Fallback;
