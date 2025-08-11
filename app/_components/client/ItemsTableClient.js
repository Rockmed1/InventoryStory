"use client";

import { useApiData } from "@/app/_hooks/useClientData";
import { getEntityTableLabels } from "@/app/_utils/helpers";
import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";
import EditItemForm from "./EditItemForm";

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
    queryKey: ["item", "all"],
    queryFn: () => useApiData("item", "all"),
  });
  const displayTableLabels = getEntityTableLabels("item");

  const displayData = data.map(
    ({ itemClassId, optimistic, ...displayFields }) => displayFields,
  );

  // console.log(displayData);
  return (
    <>
      <Table
        entity="item"
        // labels={displayTableLabels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
        redirectTo="items"
      />
      <StoreHydrator entities={{ item: data }} />
    </>
  );
}
