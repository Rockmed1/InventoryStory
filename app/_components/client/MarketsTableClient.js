"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import { getClientData } from "../../_utils/helpers-client";
import Table from "../_ui/client/Table";
import EditMarketForm from "./EditMarketForm";

const labels = ["Market ID", "Name", "Description", "Market Type"];

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
    queryKey: ["market"],
    queryFn: () => getClientData("market"),
  });

  const displayData = data.map(
    ({ market_type_id, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        labels={labels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ market: data }} />
    </>
  );
}
