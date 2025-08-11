"use client";

import { useApiData } from "@/app/_hooks/useClientData";
import { getEntityTableLabels } from "@/app/_utils/helpers";
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
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["itemClass", "all"],
    queryFn: () => useApiData("itemClass", "all"),
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
