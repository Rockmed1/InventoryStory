import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { dummyServerAction } from "../_lib/actions";
import { createDataService } from "../_lib/dataServices";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";

const labels = ["Market ID", "Market", "Market Type", "Description", "URL"];

export default async function MarketsTable({ org_uuid }) {
  const rowActions = [
    {
      id: "edit",
      label: "Edit",
      icon: <PencilIcon />,
      action: dummyServerAction.bind(null, "Edit"),
    },
    // {
    //   id: "transact",
    //   label: "Transact",
    //   icon: <ArrowsRightLeftIcon />,
    //   action: dummyServerAction.bind(null, "Transact"),
    // },
    // {
    //   id: "delete",
    //   label: "Delete",
    //   icon: <TrashIcon />,
    //   action: dummyServerAction.bind(null, "Delete"),
    // },
  ];

  //1- fetch only the data for this view
  const dataService = createDataService(org_uuid);
  const data = await dataService.getMarkets();

  return (
    <>
      <StoreHydrator market={data} />
      <Table data={data} labels={labels} rowActions={rowActions} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

MarketsTable.Fallback = Fallback;
