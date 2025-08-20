import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import ItemClassesTableClient from "../client/ItemClassesTableClient";

const labels = ["Class ID", "Name", "Description"];

export default async function ItemClassesTable() {
  const queryClient = getQueryClient();
  const dataParams = { entity: "itemClass", id: "all" };

  await queryClient.prefetchQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => getServerData(dataParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemClassesTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading entity="itemClass" />;
}

ItemClassesTable.Fallback = Fallback;
