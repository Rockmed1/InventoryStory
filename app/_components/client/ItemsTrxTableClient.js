"use client";

import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import Table from "../_ui/client/Table";

const labels = [
  "Trx ID",
  "Date",
  "Description",
  "Trx Type",
  "Direction",
  "Market",
  "URL",
];

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

export default function ItemsTrxTableClient({
  type = "compound",
  item_trx_id,
  children,
}) {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["itemTrx", type === "simple" ? item_trx_id : "all"],
    queryFn: () => {
      if (type === "simple" && item_trx_id) {
        return useData("itemTrx", item_trx_id);
      } else {
        return useData("itemTrx");
      }
    },
  });
  // No isLoading check is needed. The <Suspense> boundary handles it.
  // `isFetching` can be used to show a subtle loading indicator during background refetches.

  const displayData = data.map(
    ({ trx_type_id, market_id, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        type={type}
        labels={labels}
        tableData={displayData}
        rowActions={rowActions}
        redirectTo="transactions"
        isLoading={isFetching} // For background refresh indicators
      >
        {children}
      </Table>

      {/* <StoreHydrator
        entities={{
          itemTrx: data,
        }}
      /> */}
    </>
  );
}
