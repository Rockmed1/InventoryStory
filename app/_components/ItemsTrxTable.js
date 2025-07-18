import { ArrowsRightLeftIcon, PencilIcon } from "@heroicons/react/24/outline";
import { dummyServerAction } from "../_lib/actions";
import { getData } from "../_utils/helpers-server";
import StoreHydrator from "../_store/StoreHydrator";
import Table from "./_ui/client/Table";
import TableLoading from "./_ui/client/TableLoading";
import EditItemForm from "./client/EditItemForm";
import ItemsTrxDetailsTable from "./ItemsTrxDetailsTable";

const labels = [
  "Trx ID",
  "Date",
  "Description",
  "Trx Type",
  "Direction",
  "Market",
  "URL",
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

export default async function ItemsTrxTable({
  type = "compound",
  item_trx_id,
}) {
  // const labels = [
  //   "Trx ID",
  //   "Date",
  //   "Description",
  //   "Trx Type",
  //   "Direction",
  //   "Market",
  //   "URL",
  // ];

  //1- fetch only the data for this view
  // console.log("item_trx_id itemTrxTable: ", item_trx_id);
  const data = await getData("itemTrans", type === "simple" && item_trx_id);

  const displayData = data.map(
    ({ trx_type_id, market_id, ...displayFields }) => displayFields,
  );

  const itemDependency = await getData("item");
  const binDependency = await getData("bin");
  const trxTypeDependency = await getData("trxType");
  const marketDependency = await getData("market");

  return (
    <>
      <Table
        type={type}
        labels={labels}
        tableData={displayData}
        rowActions={rowActions}
        redirectTo="transactions">
        <ItemsTrxDetailsTable item_trx_id={item_trx_id} />
      </Table>

      <StoreHydrator
        entities={{
          itemTrx: data,
          item: itemDependency,
          bin: binDependency,
          trxType: trxTypeDependency,
          market: marketDependency,
        }}
      />
    </>
  );
}

function Fallback() {
  return <TableLoading labels={labels} />;
}

ItemsTrxTable.Fallback = Fallback;
