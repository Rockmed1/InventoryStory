"use client";

import { useApiData } from "@/app/_hooks/useClientData";
import { getEntityTableLabels } from "@/app/_utils/helpers";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";
import EditBinForm from "./EditBinForm";

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Bin",
    icon: <PencilIcon />,
    action: <EditBinForm />,
  },
];

export default function BinsTableClient() {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["bin", "all"],
    queryFn: () => useApiData("bin", "all"),
  });

  const displayTableLabels = getEntityTableLabels("bin");

  const displayData = data.map(
    ({ locationId, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        entity="bin"
        // labels={displayTableLabels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ bin: data }} />
    </>
  );
}
