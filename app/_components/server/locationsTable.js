import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import LocationsTableClient from "../client/LocationsTableClient";

const labels = ["Location ID", "Name", "Description"];

export default async function LocationsTable() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["location"],
    queryFn: () => getServerData("location"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LocationsTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

LocationsTable.Fallback = Fallback;
