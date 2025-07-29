"use client";

import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import { useClientData } from "../../_utils/helpers-client";
import Table from "../_ui/client/Table";

const labels = [
  "Line #",
  "Description",
  "Item Id",
  "Item Name",
  "From Bin Id",
  "From Bin",
  "To Bin Id",
  "To Bin",
  "Qty in",
  "Qty out",
];

// These are likely placeholders and can be adjusted as needed.
const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Item",
    icon: <PencilIcon />,
    // action: <EditItemForm />,
  },
  {
    buttonLabel: "Transact",
    windowName: "Item Transaction",
    icon: <ArrowsRightLeftIcon />,
    // action: <EditItemForm />,
  },
];

export default function ItemsTrxDetailsTableClient({ item_trx_id }) {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["itemTrxDetails", item_trx_id],
    queryFn: () => useClientData("itemTrxDetails", item_trx_id),
  });

  // No isLoading check is needed. The <Suspense> boundary handles it.
  const tableData = data?.["item_trx_details"] || [];

  return (
    <>
      <Table
        labels={labels}
        tableData={tableData}
        rowActions={rowActions}
        redirectTo="transactions"
        isLoading={isFetching}
      />

      <StoreHydrator
        entities={{
          itemTrxDetails: tableData,
        }}
      />
    </>
  );
}
