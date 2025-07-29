"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useClientData } from "../../_utils/helpers-client";
import Table from "../_ui/client/Table";
import EditItemClassForm from "./EditItemClassForm";

const labels = ["Class ID", "Name", "Description"];

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
    queryKey: ["itemClass"],
    queryFn: () => useClientData("itemClass"),
  });

  return (
    <>
      <Table
        labels={labels}
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
