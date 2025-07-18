import { PencilIcon } from "@heroicons/react/24/outline";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import EditMarketForm from "./client/EditMarketForm";

const labels = ["Market ID", "Market", "Market Type", "Description", "URL"];

export default async function MarketsTable({ org_uuid }) {
  const rowActions = [
    {
      buttonLabel: "Edit",
      windowName: "Edit Market",
      icon: <PencilIcon />,
      action: <EditMarketForm />,
      /* here goes the form component or server action as needed. it will be passed from the Table to the MenuWithModal*/
    },
  ];

  //1- fetch only the data for this view
  const data = await getData("market");
  const displayData = data.map(
    ({ market_type_id, ...displayFields }) => displayFields,
  );
  const dataDependency = await getData("marketType");

  return (
    <>
      <Table tableData={displayData} labels={labels} rowActions={rowActions} />
      <StoreHydrator entities={{
        market: data,
        marketType: dataDependency
      }} />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

MarketsTable.Fallback = Fallback;
