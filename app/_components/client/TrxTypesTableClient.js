"use client";

import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import { getClientData } from "../../_utils/helpers-client";
import Table from "../_ui/client/Table";
import EditTrxTypeForm from "./EditTrxTypeForm";

const labels = ["Trx Type ID", "Name", "Description", "Direction"];

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Trx Type",
    icon: <PencilIcon />,
    action: <EditTrxTypeForm />,
  },
];

export default function TrxTypesTableClient() {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["trxType"],
    queryFn: () => getClientData("trxType"),
  });

  return (
    <>
      <Table
        labels={labels}
        tableData={data}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ trxType: data }} />
    </>
  );
}
