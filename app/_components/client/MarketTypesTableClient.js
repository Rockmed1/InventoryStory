"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import { useClientData } from "../../_utils/helpers-client";
import Table from "../_ui/client/Table";
import EditMarketTypeForm from "./EditMarketTypeForm";

const labels = ["Market Type ID", "Name", "Description"];

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
    queryKey: ["marketType"],
    queryFn: () => useClientData("marketType"),
  });

  return (
    <>
      <Table
        labels={labels}
        tableData={data}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ marketType: data }} />
    </>
  );
}
