"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";
import EditLocationForm from "./EditLocationForm";

const labels = ["Location ID", "Name", "Description"];

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Location",
    icon: <PencilIcon />,
    action: <EditLocationForm />,
  },
];

export default function LocationsTableClient() {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["location"],
    queryFn: () => useData("location"),
  });

  return (
    <>
      <Table
        labels={labels}
        tableData={data}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ location: data }} />
    </>
  );
}
