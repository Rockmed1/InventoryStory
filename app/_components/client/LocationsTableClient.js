"use client";

import { useApiData } from "@/app/_lib/data/client/useClientData";
import { generateQueryKeys, getEntityTableLabels } from "@/app/_utils/helpers";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";
import EditLocationForm from "./EditLocationForm";

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Location",
    icon: <PencilIcon />,
    action: <EditLocationForm />,
  },
];

export default function LocationsTableClient() {
  const dataParams = { entity: "location", id: "all" };
  const { data, isFetching } = useSuspenseQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => useApiData(dataParams),
  });
  const displayTableLabels = getEntityTableLabels("location");

  const displayData = data.map(
    ({ locationId, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        entity="location"
        // labels={displayTableLabels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ location: data }} />
    </>
  );
}
