import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { dummyServerAction } from "../_lib/actions";
import { createDataService } from "../_lib/dataServices";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";

const labels = ["Trx Type ID", "Trx Type", "Direction", "Description"];

export default async function TrxTypesTable({ org_uuid }) {
  const rowActions = [
    {
      id: "edit",
      label: "Edit",
      icon: <PencilIcon />,
      action: dummyServerAction.bind(null, "Edit"),
    },
    {
      id: "transact",
      label: "Transact",
      icon: <ArrowsRightLeftIcon />,
      action: dummyServerAction.bind(null, "Transact"),
    },
    {
      id: "delete",
      label: "Delete",
      icon: <TrashIcon />,
      action: dummyServerAction.bind(null, "Delete"),
    },
  ];

  //1- fetch only the data for this view
  const dataService = createDataService(org_uuid);
  const data = await dataService.getTrxTypes();

  const TRXDIRECTIONS = [
    { id: 1, name: "in" },
    { id: 2, name: "out" },
    { id: 3, name: "in-out" },
  ];

  return (
    <>
      <StoreHydrator trxTypes={data} trxDirections={TRXDIRECTIONS} />
      <Table data={data} labels={labels} rowActions={rowActions} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

TrxTypesTable.Fallback = Fallback;
