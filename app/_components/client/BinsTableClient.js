"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import { useClientData } from "../../_utils/helpers-client";
import Table from "../_ui/client/Table";
import EditBinForm from "./EditBinForm";

const labels = ["Bin ID", "Name", "Location"];

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
    queryKey: ["bin"],
    queryFn: () => useClientData("bin"),
  });

  const displayData = data.map(
    ({ location_id, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        labels={labels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ bin: data }} />
    </>
  );
}
