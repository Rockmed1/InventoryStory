"use client";

import { useApiData } from "@/app/_hooks/useClientData";
import { getEntityTableLabels } from "@/app/_utils/helpers";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";
import EditMarketForm from "./EditMarketForm";

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Market",
    icon: <PencilIcon />,
    action: <EditMarketForm />,
  },
];

export default function MarketsTableClient() {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["market", "all"],
    queryFn: () => useApiData("market", "all"),
  });

  const displayTableLabels = getEntityTableLabels("market");

  const displayData = data.map(
    ({ marketTypeId, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        entity="market"
        // labels={displayTableLabels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ market: data }} />
    </>
  );
}
