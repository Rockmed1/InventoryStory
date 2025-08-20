"use client";

import { useApiData } from "@/app/_lib/client/useClientData";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";

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

export default function ItemsTrxDetailsTableClient({ itemTrxId }) {
  const dataParams = { entity: "itemTrxDetails", id: itemTrxId };
  const { data, isFetching } = useSuspenseQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => useApiData(dataParams),
  });
  // const displayTableLabels = getEntityTableLabels("itemTrxDetails");

  // No isLoading check is needed. The <Suspense> boundary handles it.

  // console.log(data);
  const tableData = data?.["itemTrxDetails"] || [];
  // console.log("itemTrxDetailsData: ", tableData);

  const displayData = tableData.map(
    ({ itemId, fromBinId, toBinId, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        entity="itemTrxDetails"
        // labels={displayTableLabels}
        tableData={displayData}
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
