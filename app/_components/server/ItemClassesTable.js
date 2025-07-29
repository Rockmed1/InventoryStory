import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../../_store/queryClient";
import { getData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import ItemClassesTableClient from "../client/ItemClassesTableClient";

const labels = ["Class ID", "Name", "Description"];

export default async function ItemClassesTable() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["itemClass"],
    queryFn: () => getData("itemClass"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemClassesTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

ItemClassesTable.Fallback = Fallback;
