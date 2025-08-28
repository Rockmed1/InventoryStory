"use client";

import { useApiData } from "@/app/_lib/data/client/useClientData";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import Table from "../_ui/client/Table";

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
  itemTrxId,
  children,
}) {
  const dataParams = {
    entity: "itemTrx",
    id: type === "simple" ? itemTrxId : "all",
  };
  const { data, isFetching } = useSuspenseQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => useApiData(dataParams),
  });
  // const displayTableLabels = getEntityTableLabels("itemTrx");
  // No isLoading check is needed. The <Suspense> boundary handles it.
  // `isFetching` can be used to show a subtle loading indicator during background refetches.

  const displayData = data.map(
    ({ trxTypeId, marketId, trxDirectionId, ...displayFields }) =>
      displayFields,
  );

  return (
    <>
      <Table
        type={type}
        // labels={displayTableLabels}
        entity="itemTrx"
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
