import { Suspense } from "react";
import ItemsTable from "../_components/ItemsTable";
import AddButtonModal from "../_components/_ui/client/AddButtonModal";

export const metadata = {
  title: "items",
};

// export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Items() {
  // cookies(); //headers() //

  return (
    <>
      <div className="container m-auto grid w-full items-center gap-6 p-2">
        <div className="flex flex-row-reverse gap-2">
          {/* <AddItem /> */}
          <AddButtonModal opensWindowName="item-form" buttonLabel="Add item">
            This is a modal for the item form.
          </AddButtonModal>
        </div>
        <Suspense fallback={<ItemsTable.Fallback />}>
          <ItemsTable />
        </Suspense>
      </div>
    </>
  );
}
