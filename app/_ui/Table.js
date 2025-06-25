"use client";

import Menus from "@/app/_ui/Menus";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Table({ labels, data, rowActions }) {
  // labels parameter is required
  // data parameter is optional.
  // the Table component comes with a place holder data to display loading status while data is being fetched.
  // later:
  // get the number of rows for the place holder

  if (!labels)
    throw new Error("Table components requires labels param, none was passed.");

  const tableData =
    data || //default place holder for when data is not passed
    Array.from({ length: 3 }, (_, i) => ({
      id: "loading" + i,
      ...Object.fromEntries(
        labels.filter((_, i) => i > 0).map((label) => [label, "loading"]),
      ),
    }));

  /* 
    //HACK: add the modal window to the table and wire it to the menu buttons
    
    <Modal>
      <Modal.Open opensWindowName="item-form">
        <Button>
          <div className="flex items-center justify-between gap-1">
            <PlusIcon className="size-4" />
            <span>Add item</span>
          </div>
        </Button>
      </Modal.Open>
      <Modal.Window name="item-form">
        This is a modal for the item form.
      </Modal.Window>

      <Modal.Open opensWindowName="confirm-delete">
        <Button>
          <div className="flex items-center justify-between gap-1">
            <MinusIcon className="size-4" />
            <span>Delete item</span>
          </div>
        </Button>
      </Modal.Open>
      <Modal.Window name="confirm-delete">
        <ConfirmDelete
          resourceName="item"
          onConfirm={() => {
            alert("delete confirmed");
          }}
        />
      </Modal.Window>
    </Modal>;
   */

  // console.log(tableData);
  return (
    <div>
      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <Menus>
          <table className="w-full table-auto text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-100">
                <th scope="col" className="p-2 font-medium"></th>

                {labels.map((label) => (
                  <th scope="col" key={label} className="p-2 font-medium">
                    {label}
                  </th>
                ))}

                <th scope="col" className="p-2 text-center font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {/* loop through the data rows (list of objects) */}
              {tableData.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-primary-100 border-b border-neutral-200 transition-all duration-300">
                  <td className="w-3 translate-y-0.5 border-neutral-200 p-2 pr-0 transition-all duration-200">
                    <input
                      type="checkbox"
                      id={`checkbox-${row.id}`}
                      role="checkbox"
                      className="checked:bg-primary-500 checked:border-primary-500 relative ml-2 size-4 cursor-pointer appearance-none rounded-[3px] border border-neutral-200 bg-white shadow-xs checked:after:absolute checked:after:top-0 checked:after:left-0.5 checked:after:text-xs checked:after:font-bold checked:after:text-white checked:after:content-['✓']"
                    />
                  </td>

                  {/* nested loop through the key value pairs of each object row 
                  //? evaluate if render props pattern and/or compound component pattern is more useful if this will be needed to display other data: like item transactions, classes...etc.
                */}
                  {Object.keys(row).map((key) => (
                    <td key={key} className="p-2">
                      {/* first check if the place holder data */}
                      {row[key].toString().includes("loading") ? (
                        <div className="loader3"></div>
                      ) : /* then create links for the id and name cells only if the real data */
                      key === "id" || key === "name" ? (
                        <Link
                          href={`/items/${row["id"]}`}
                          className="transition-all duration-200 hover:underline">
                          {row[key]}
                        </Link>
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}
                  {/*  */}
                  <td className="w-2 p-2 align-middle">
                    {/* first check if the place holder data and provide a static vertical Ellipsis instead of the menu button */}
                    {row.id.toString().includes("loading") ? (
                      <EllipsisVerticalIcon className="size-6 stroke-1 hover:stroke-2" />
                    ) : rowActions ? (
                      <Menus.Menu>
                        <Menus.MenuToggle id={row.id} />
                        <Menus.MenuList id={row.id}>
                          {rowActions.map((rowAction) => (
                            <Menus.MenuButton
                              key={rowAction.id}
                              onClick={() => rowAction.action?.()}>
                              {rowAction.icon && rowAction.icon}
                              <span>{rowAction.label}</span>
                            </Menus.MenuButton>
                          ))}
                        </Menus.MenuList>
                      </Menus.Menu>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Menus>
      </div>
    </div>
  );
}
