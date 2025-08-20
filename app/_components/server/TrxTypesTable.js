import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { getQueryClient } from "../../_store/queryClient";
import { getServerData } from "../../_utils/helpers-server";
import TableLoading from "../_ui/client/TableLoading";
import TrxTypesTableClient from "../client/TrxTypesTableClient";

const labels = ["Trx Type ID", "Name", "Description", "Direction"];

export default async function TrxTypesTable() {
  const queryClient = getQueryClient();
  const dataParams = { entity: "trxType", id: "all" };

  await queryClient.prefetchQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => getServerData(dataParams),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrxTypesTableClient />
    </HydrationBoundary>
  );
}

function Fallback() {
  return <TableLoading entity="trxType" />;
}

TrxTypesTable.Fallback = Fallback;
