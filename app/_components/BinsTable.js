import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "../_store/queryClient";
import { getData } from "../_utils/helpers-server";
import TableLoading from "./_ui/client/TableLoading";
import BinsTableClient from "./client/BinsTableClient";

const labels = ["Bin ID", "Name", "Location"];

export default async function BinsTable() {
  const queryClient = getQueryClient();

  queryClient.prefetchQuery({
    queryKey: ["bin"],
    queryFn: () => getData("bin"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BinsTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

BinsTable.Fallback = Fallback;
