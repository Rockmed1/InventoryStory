import PagePagination from "@/app/_components/_ui/client/PagePagination";
import { Suspense } from "react";
import AddButtonModal from "../../_components/_ui/client/AddButtonModal";
import AddItemTrxForm from "../../_components/client/AddItemTrxForm";
import ItemsTrxTable from "../../_components/server/ItemsTrxTable";

export const metadata = {
  title: "items",
};

export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Page({ searchParams }) {
  // cookies(); //headers() //

  const param = await searchParams;
  // console.log("param: ", param);
  const itemTrxId = Number(param.itemTrxId);
  // console.log("itemTrxId: ", itemTrxId);

  return (
    <div className="flex h-full flex-col gap-4 p-2">
      <div className="flex flex-shrink-0 flex-row-reverse gap-2">
        {/* <AddItem /> */}
        <AddButtonModal>
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
      <PagePagination />
    </div>
  );
}
