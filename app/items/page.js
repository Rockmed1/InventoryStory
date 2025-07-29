import { Suspense } from "react";
import AddButtonModal from "../_components/_ui/client/AddButtonModal";
import AddItemForm from "../_components/client/AddItemForm";
import ItemsTable from "../_components/server/ItemsTable";
import UseAuth from "../_hooks/useAuth";

export const metadata = {
  title: "items",
};

export const revalidate = 0; // this will make the page dynamic and revalidate cache every request

export default async function Items() {
  // cookies(); //headers() //

  //1- authenticate the user

  const { _org_uuid } = UseAuth();

  //2- Wrap the entire page in the provider to create an empty store
  return (
    <div className="container m-auto grid w-full items-center gap-6 p-2">
      <div className="flex flex-row-reverse gap-2">
        {/* <AddItem /> */}
        <AddButtonModal opensWindowName="item-form" buttonLabel="Add item">
          <AddItemForm />
        </AddButtonModal>
      </div>
      <Suspense fallback={<ItemsTable.Fallback />}>
        <ItemsTable />
      </Suspense>
      {/* 
      <TestForm /> */}
    </div>
  );
}
