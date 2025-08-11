import { Suspense } from "react";
import AddButtonModal from "../_components/_ui/client/AddButtonModal";
import AddItemTrxForm from "../_components/client/AddItemTrxForm";
import TestForm from "../_components/client/TestForm";
import ItemsTrxTable from "../_components/server/ItemsTrxTable";
import UseAuth from "../_hooks/useAuth";

export const metadata = {
  title: "items",
};

export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Page({ searchParams }) {
  // cookies(); //headers() //

  //1- authenticate the user

  const { _org_uuid } = UseAuth();

  const param = await searchParams;
  // console.log("param: ", param);
  const itemTrxId = Number(param.itemTrxId);
  // console.log("itemTrxId: ", itemTrxId);

  return (
    <div className="container m-auto grid w-full items-center gap-6 p-2">
      <div className="flex flex-row-reverse gap-2">
        {/* <AddItem /> */}
        <AddButtonModal buttonLabel="Create item transaction">
          <AddItemTrxForm />
        </AddButtonModal>
      </div>

      {/* <Suspense fallback={<Loader2 />}> */}
      <Suspense fallback={<ItemsTrxTable.Fallback />}>
        <ItemsTrxTable
          itemTrxId={itemTrxId}
          // type={!itemTrxId ? "compound" : "simple"}
        />
      </Suspense>
      <TestForm />
    </div>
  );
}
