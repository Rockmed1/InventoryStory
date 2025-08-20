import { generateQueryKeys } from "@/app/_utils/helpers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import ItemsTableClient from "../client/ItemsTableClient";

const labels = ["Item ID", "Name", "Description", "Class"];

export default async function ItemsTable() {
  const queryClient = getQueryClient();

  const dataParams = { entity: "item", id: "all" };

  queryClient.prefetchQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => getServerData(dataParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemsTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading entity="item" />;
}

ItemsTable.Fallback = Fallback;
