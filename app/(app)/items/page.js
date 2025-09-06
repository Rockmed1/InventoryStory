import PagePagination from "@/app/_components/_ui/client/PagePagination";
import { Suspense } from "react";
import AddButtonModal from "../../_components/_ui/client/AddButtonModal";
import AddItemForm from "../../_components/client/AddItemForm";
import ItemsTable from "../../_components/server/ItemsTable";

export const metadata = {
  title: "items",
};

export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Items() {
  // cookies(); //headers() //

  return (
    <div className="flex h-full flex-col gap-4 overflow-scroll p-2">
      <div className="flex flex-shrink-0 flex-row items-center justify-between gap-2 px-4">
        <h1 className="text-2xl font-semibold font-stretch-semi-expanded">
          Items
        </h1>
        {/* <AddItem /> */}
        <AddButtonModal opensWindowName="item-form" buttonLabel="Add item">
          <AddItemForm />
        </AddButtonModal>
      </div>
      <Suspense fallback={<ItemsTable.Fallback />}>
        <ItemsTable />
      </Suspense>
      <PagePagination />
    </div>
  );
}
