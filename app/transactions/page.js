import { Suspense } from "react";
import AddButtonModal from "../_components/_ui/client/AddButtonModal";
import AddItemTrxForm from "../_components/client/AddItemTrxForm";
import ItemsTrxTable from "../_components/ItemsTrxTable";
import UseAuth from "../_hooks/useAuth";

export const metadata = {
  title: "items",
};

// export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Page({ searchParams }) {
  // cookies(); //headers() //

  //1- authenticate the user

  const { _org_uuid } = UseAuth();

  const param = await searchParams;
  // console.log("param: ", param);
  const item_trx_id = Number(param.item_trx_id);
  // console.log("item_trx_id: ", item_trx_id);

  return (
    <div className="container m-auto grid w-full items-center gap-6 p-2">
      <div className="flex flex-row-reverse gap-2">
        {/* <AddItem /> */}
        <AddButtonModal opensWindowName="item-form" buttonLabel="Add item">
          <AddItemTrxForm />
        </AddButtonModal>
      </div>

      {/* <Suspense fallback={<Loader2 />}> */}
      <Suspense fallback={<ItemsTrxTable.Fallback />}>
        <ItemsTrxTable org_uuid={_org_uuid} item_trx_id={item_trx_id} />
      </Suspense>
    </div>
  );
}
