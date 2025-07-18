import { PencilIcon } from "@heroicons/react/24/outline";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import EditMarketTypeForm from "./client/EditMarketTypeForm";

const labels = ["Market Type ID", "Market Type Name", "Description"];

export default async function MarketTypesTable({ org_uuid }) {
  const rowActions = [
    {
      buttonLabel: "Edit",
      windowName: "Edit Market Type",
      icon: <PencilIcon />,
      action: <EditMarketTypeForm />,
      /* here goes the form component or server action as needed. it will be passed from the Table to the MenuWithModal*/
    },
  ];

  //1- fetch only the data for this view
  const data = await getData("marketType");

  return (
    <>
      <Table tableData={data} labels={labels} rowActions={rowActions} />
      <StoreHydrator entities={{
        marketType: data
      }} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

MarketTypesTable.Fallback = Fallback;
