import { PencilIcon } from "@heroicons/react/24/outline";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import EditTrxTypeForm from "./client/EditTrxTypeForm";

const labels = ["Trx Type ID", "Trx Type", "Direction", "Description"];

export default async function TrxTypesTable({ org_uuid }) {
  const rowActions = [
    {
      buttonLabel: "Edit",
      windowName: "Edit Transaction Type",
      icon: <PencilIcon />,
      action: <EditTrxTypeForm />,
      /* here goes the form component or server action as needed. it will be passed from the Table to the MenuWithModal*/
    },
  ];

  //1- fetch only the data for this view
  const data = await getData("trxType");
  const displayData = data.map(
    ({ trx_direction_id, ...displayFields }) => displayFields,
  );

  const TRXDIRECTIONS = [
    { id: 1, name: "in" },
    { id: 2, name: "out" },
    { id: 3, name: "in-out" },
  ];

  return (
    <>
      <Table tableData={displayData} labels={labels} rowActions={rowActions} />
      <StoreHydrator entities={{
        trxType: data,
        trxDirections: TRXDIRECTIONS
      }} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

TrxTypesTable.Fallback = Fallback;
