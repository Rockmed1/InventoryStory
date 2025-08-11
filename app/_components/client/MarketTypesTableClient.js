"use client";

import { useApiData } from "@/app/_hooks/useClientData";
import { getEntityTableLabels } from "@/app/_utils/helpers";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";
import EditMarketTypeForm from "./EditMarketTypeForm";

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Market Type",
    icon: <PencilIcon />,
    action: <EditMarketTypeForm />,
  },
];

export default function MarketTypesTableClient() {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["marketType", "all"],
    queryFn: () => useApiData("marketType", "all"),
  });
  const displayTableLabels = getEntityTableLabels("marketType");

  return (
    <>
      <Table
        entity="marketType"
        // labels={displayTableLabels}
        tableData={data}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ marketType: data }} />
    </>
  );
}
