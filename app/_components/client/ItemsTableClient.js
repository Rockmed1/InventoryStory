"use client";

import { fetchApiData } from "@/app/_lib/data/client/useClientData";
import { generateQueryKeys } from "@/app/_utils/helpers";
import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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
  const dataParams = { entity: "item", id: "all" };

  useEffect(() => {
    const tableKey = generateQueryKeys(dataParams);
    console.log("🔑 ItemsTableClient query key:", tableKey);
    console.log("🔑 ItemsTableClient dataParams:", dataParams);
  }, []);

  const { data, isFetching } = useSuspenseQuery({
    queryKey: generateQueryKeys(dataParams),
    queryFn: () => fetchApiData(dataParams),
  });

  // Add this logging
  useEffect(() => {
    console.log("📊 ItemsTableClient data updated:", {
      dataLength: data?.length,
      data: data,
      timestamp: new Date().toISOString(),
    });
  }, [data]);

  // Also add a render counter
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`🔄 ItemsTableClient render #${renderCount.current}`, {
    dataLength: data?.length,
    hasOptimisticItems: data?.some((item) => item.optimistic),
  });

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
