import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import dummyServerAction from "../_lib/actions";
import { getMarkets } from "../_lib/data-services";
import Table from "./_ui/Table";

const labels = ["Market ID", "Market", "Market Type", "Description", "URL"];

export default async function MarketsTable() {
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

  const data = await getMarkets();

  return <Table data={data} labels={labels} rowActions={rowActions} />;
}

function Fallback() {
  return <Table labels={labels} />;
}

MarketsTable.Fallback = Fallback;
