"use client";

import { useApiData } from "@/app/_lib/client/useClientData";
import { generateQueryKeys, getEntityTableLabels } from "@/app/_utils/helpers";
import { PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import StoreHydrator from "../../_store/StoreHydrator";
import Table from "../_ui/client/Table";
import EditTrxTypeForm from "./EditTrxTypeForm";

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Trx Type",
    icon: <PencilIcon />,
    action: <EditTrxTypeForm />,
  },
];

export default function TrxTypesTableClient() {
  const dataParams = { entity: "trxType", id: "all" };
  const { data, isFetching } = useSuspenseQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => useApiData(dataParams),
  });
  const displayTableLabels = getEntityTableLabels("trxType");

  const displayData = data.map(
    ({ trxDirectionId, ...displayFields }) => displayFields,
  );

  return (
    <>
      <Table
        entity="trxType"
        // labels={displayTableLabels}
        tableData={displayData}
        rowActions={rowActions}
        isLoading={isFetching}
      />
      <StoreHydrator entities={{ trxType: data }} />
    </>
  );
}
