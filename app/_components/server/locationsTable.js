import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import LocationsTableClient from "../client/LocationsTableClient";

const labels = ["Location ID", "Name", "Description"];

export default async function LocationsTable() {
  const queryClient = getQueryClient();
  const dataParams = { entity: "location", id: "all" };

  await queryClient.prefetchQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => getServerData(dataParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LocationsTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading entity="location" />;
}

LocationsTable.Fallback = Fallback;
