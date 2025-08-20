"use client";

import { useApiData } from "@/app/_lib/client/useClientData";
import { generateQueryKeys, getEntityTableLabels } from "@/app/_utils/helpers";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import Table from "../_ui/client/Table";
import EditItemClassForm from "./EditItemClassForm";

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Item Class",
    icon: <PencilIcon />,
    action: <EditItemClassForm />,
  },
];

export default function ItemClassesTableClient() {
  const dataParams = { entity: "itemClass", id: "all" };
  const { data, isFetching } = useSuspenseQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => useApiData(dataParams),
  });

  const displayTableLabels = getEntityTableLabels("itemClass");

  return (
    <>
      <Table
        entity="itemClass"
        // labels={displayTableLabels}
        tableData={data}
        rowActions={rowActions}
        isLoading={isFetching}
      />

      {/* <StoreHydrator entities={{ itemClass: data }} /> */}
    </>
    // <>
    //   {!isFetching ? (
    //     <Table
    //       labels={labels}
    //       tableData={data}
    //       rowActions={rowActions}
    //       isLoading={isFetching}
    //     />
    //   ) : (
    //     <TableLoading labels={labels} />
    //   )}
    //   {/* <StoreHydrator entities={{ itemClass: data }} /> */}
    // </>
  );
}
