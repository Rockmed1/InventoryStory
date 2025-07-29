import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../../_store/queryClient";
import { getData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import ItemsTableClient from "../client/ItemsTableClient";

const labels = ["Item ID", "Name", "Description", "Class"];

export default async function ItemsTable() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["item"],
    queryFn: () => getData("item"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ItemsTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

ItemsTable.Fallback = Fallback;
