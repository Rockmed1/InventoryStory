import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { dummyServerAction } from "../_lib/actions";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import EditItemForm from "./client/EditItemForm";

const labels = [
  "Line #",
  "Description",
  "Item Id",
  "Item Name",
  "From Bin Id",
  "From Bin",
  "To Bin Id",
  "To Bin",
  "Qty in",
  "Qty out",
];
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

export default async function ItemsTrxDetailsTable({ item_trx_id }) {
  // const rowActions = [

  if (!item_trx_id) return;
  //1- fetch only the data for this view
  const data = await getData("itemTrxDetails", item_trx_id);

  console.log(data["item_trx_details"]);

  // const displayData = data["item_trx_details"].map(
  //   ({ id, ...displayFields }) => displayFields,
  // );

  // console.log(data["item_trx_details"]);
  // console.log(displayData);
  // const trxTypeDependency = await dataService.getTrxTypes();
  // const marketDependency = await dataService.getMarkets();

  return (
    <>
      <Table
        labels={labels}
        tableData={data["item_trx_details"]}
        rowActions={rowActions}
        redirectTo="transactions"
      />

      <StoreHydrator
        entities={{
          itemTrxDetails: data["item_trx_details"],
        }}
      />
    </>
  );
}

function Fallback() {
  return <Table labels={labels} />;
}

ItemsTrxDetailsTable.Fallback = Fallback;
