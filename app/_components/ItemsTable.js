import {
  ArrowsRightLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import dummyServerAction from "../_lib/actions";
import { getItems } from "../_lib/data-services";
import Table from "./_ui/Table";

const labels = ["Item ID", "Name", "Description", "Class", "QOH"];

export default async function ItemsTable() {
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

  const data = await getItems();

  return <Table data={data} labels={labels} rowActions={rowActions} />;
}

function Fallback() {
  return <Table labels={labels} />;
}

ItemsTable.Fallback = Fallback;
