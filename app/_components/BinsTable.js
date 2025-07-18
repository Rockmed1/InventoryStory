import { PencilIcon } from "@heroicons/react/24/outline";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import EditBinForm from "./client/EditBinForm";

const labels = ["Bin ID", "Bin Name", "Location Name", "Description"];

export default async function BinsTable({ org_uuid }) {
  const rowActions = [
    {
      buttonLabel: "Edit",
      windowName: "Edit Bin",
      icon: <PencilIcon />,
      action: <EditBinForm />,
      /* here goes the form component or server action as needed. it will be passed from the Table to the MenuWithModal*/
    },
  ];

  //1- fetch only the data for this view
  const data = await getData("bin");
  const displayData = data.map(({ loc_id, ...displayFields }) => displayFields);
  const dataDependency = await getData("location");

  return (
    <>
      <Table tableData={displayData} labels={labels} rowActions={rowActions} />
      <StoreHydrator entities={{
        bin: data,
        location: dataDependency
      }} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

BinsTable.Fallback = Fallback;
