import { Suspense } from "react";
import AddItem from "../_components/AddItem";
import ItemsTable from "../_components/ItemsTable";

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
          <AddItem />
        </div>
        <Suspense fallback={<ItemsTable.Fallback />}>
          <ItemsTable />
        </Suspense>
      </div>
    </>
  );
}
