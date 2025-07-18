import { PencilIcon } from "@heroicons/react/24/outline";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import EditItemClassForm from "./client/EditItemClassForm";

const labels = ["Item Class ID", "Item Class Name", "Description"];

export default async function ItemClassesTable({ org_uuid }) {
  const rowActions = [
    {
      buttonLabel: "Edit",
      windowName: "Edit Item Class",
      icon: <PencilIcon />,
      action: <EditItemClassForm />,
      /* here goes the form component or server action as needed. it will be passed from the Table to the MenuWithModal*/
    },
  ];

  //1- fetch only the data for this view
  const data = await getData("itemClass");

  return (
    <>
      <Table tableData={data} labels={labels} rowActions={rowActions} />
      <StoreHydrator entities={{
        itemClass: data
      }} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

ItemClassesTable.Fallback = Fallback;
