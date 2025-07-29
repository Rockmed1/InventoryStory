"use client";

import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import { useClientData } from "../../_utils/helpers-client";
import Table from "../_ui/client/Table";
import EditItemForm from "./EditItemForm";

const labels = ["Item ID", "Name", "Description", "Class", "QOH"];

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Item",
    icon: <PencilIcon />,
    action: <EditItemForm />,
  },
  {
    buttonLabel: "Transact",
    windowName: "Item Transaction",
    icon: <ArrowsRightLeftIcon />,
    action: <EditItemForm />, // This should likely be a different form
  },
];

export default function ItemsTableClient() {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["item"],
    queryFn: () => useClientData("item"),
  });

  const displayData = data.map(
    ({ item_class_id, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        labels={labels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
        redirectTo="items"
      />
      <StoreHydrator entities={{ item: data }} />
    </>
  );
}
