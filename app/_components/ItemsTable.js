import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { dummyServerAction } from "../_lib/actions";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import EditItemForm from "./client/EditItemForm";

const labels = ["Item ID", "Name", "Description", "Class", "QOH"];

const rowActions = [
  {
    buttonLabel: "Edit",
    windowName: "Edit Item",
    icon: <PencilIcon />,
    action: <EditItemForm />,
    /* here goes the form component or server action as needed. it will be passed from the Table to the MenuWithModal*/
  },
  {
    buttonLabel: "Transact",
    windowName: "Item Transaction",
    icon: <ArrowsRightLeftIcon />,
    action: dummyServerAction.bind(null, "Transact"),
  },
];

export default async function ItemsTable({ org_uuid }) {
  // const rowActions = [
  //   {
  //     id: "edit",
  //     label: "Edit",
  //     icon: <PencilIcon />,
  //     action: dummyServerAction.bind(null, "Edit"),
  //   },
  //   {
  //     id: "transact",
  //     label: "Transact",
  //     icon: <ArrowsRightLeftIcon />,
  //     action: dummyServerAction.bind(null, "Transact"),
  //   },
  //   // {
  //   //   id: "delete",
  //   //   label: "Delete",
  //   //   icon: <TrashIcon />,
  //   //   action: dummyServerAction.bind(null, "Delete"),
  //   // },
  // ];

  //1- fetch only the data for this view
  const data = await getData("item");
  const displayData = data.map(
    ({ item_class_id, ...displayFields }) => displayFields,
  );
  const itemClassDependency = await getData("itemClass");
  console.log(displayData);
  return (
    <>
      <Table
        tableData={displayData}
        labels={labels}
        rowActions={rowActions}
        redirectTo="transactions"
      />
      <StoreHydrator entities={{
        item: data,
        itemClass: itemClassDependency
      }} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

ItemsTable.Fallback = Fallback;
