"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./shadcn-Collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table_shadcn";

function SubContents() {
  return (
    <>
      <TableRow>
        <TableCell>content1</TableCell>
        <TableCell>jkl;kajdfkjlaksda</TableCell>
        <TableCell>Final Link</TableCell>
      </TableRow>
    </>
  );
}

export default function TableX({ type = "simple", labels, data, rowActions }) {
  if (!labels) {
    throw new Error(
      "Table component requires 'labels' prop, but none was passed.",
    );
  }

  const displayData =
    data ||
    //default place holder for when data is not passed
    Array.from({ length: 3 }, (_, i) => ({
      id: "loading" + i,
      ...Object.fromEntries(
        labels.filter((_, i) => i > 0).map((label) => [label, "loading"]),
      ),
    }));

  const isLoading = !data;

  return (
    <div className="w-full sm:p-4">
      <h2 className="p-4">Item Transactions</h2>
      <div className="rounded-md sm:border">
        <Table>
          <TableHeader>
            <TableRow>
              {labels.map((label) => (
                <TableHead key={label} className="font-medium">
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <Collapsible key={row.id} asChild>
                <>
                  <TableRow key={row.id} rowId={row.id}>
                    {Object.keys(row).map((fieldKey) => (
                      <TableCell>{row[fieldKey]}</TableCell>
                    ))}
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <div>
                          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
                        </div>
                      </CollapsibleTrigger>
                    </TableCell>
                  </TableRow>
                  <CollapsibleContent asChild>
                    <SubContents />
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// "use client";

// import Menus from "@/app/_components/_ui/client/Menus";
// import { cn } from "@/app/_utils/utils";
// import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
// import { ChevronDownIcon } from "lucide-react";
// import Link from "next/link";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "../Collapsible";
// import MenuWithModal from "./MenuWithModal";

// function TableHeader({ labels }) {
//   return (
//     <thead>
//       <tr className="border-b border-neutral-200 bg-neutral-100 whitespace-nowrap">
//         <th scope="col" className="p-2 font-medium"></th>
//         {labels.map((label) => (
//           <th scope="col" key={label} className="h-10 px-2 font-medium">
//             {label}
//           </th>
//         ))}
//         <th scope="col" className="p-2 text-center font-medium"></th>
//       </tr>
//     </thead>
//   );
// }

// function TableRow({ rowId, children }) {
//   return (
//     <tr
//       key={rowId}
//       className="h-13 border-b border-neutral-200 bg-white transition-all duration-300 hover:bg-neutral-100/50">
//       {children}
//     </tr>
//   );
// }

// function LoadingCell({ fieldKey }) {
//   return (
//     <td key={fieldKey} className="p-2">
//       <div className="loader3"></div>
//     </td>
//   );
// }

// function CheckboxCell({ rowId }) {
//   return (
//     <td className="w-3 translate-y-0.5 border-neutral-200 p-2 pr-0 transition-all duration-200">
//       <input
//         type="checkbox"
//         id={`checkbox-${rowId}`}
//         role="checkbox"
//         className="relative ml-2 size-4 cursor-pointer appearance-none rounded-[3px] border border-neutral-200 bg-white shadow-xs checked:border-neutral-500 checked:bg-neutral-500/50 checked:after:absolute checked:after:top-0 checked:after:left-0.5 checked:after:text-xs checked:after:font-bold checked:after:text-white checked:after:content-['✓']"
//       />
//     </td>
//   );
// }

// function TableRowDetail({ children }) {
//   return (
//     <>
//       {children}
//       Our flagship product combines cutting-edge technology with sleek design.
//       Built with premium materials, it offers unparalleled performance and
//       reliability.
//     </>
//   );
// }

// function TableCell({ row, fieldKey, type, isLoading }) {
//   if (isLoading) {
//     return <LoadingCell key={fieldKey} />;
//   }

//   if (type === "simple") {
//     return (
//       <td key={fieldKey} className="p-2">
//         {
//           /* then create links for the id and name cells only if the real data  TODO: make this part modular */
//           fieldKey === "id" || fieldKey === "name" ? (
//             <Link
//               href={`/items/${row["id"]}`}
//               className="transition-all duration-200 hover:underline">
//               {row[fieldKey]}
//             </Link>
//           ) : (
//             row[fieldKey]
//           )
//         }
//       </td>
//     );
//   }

//   if (type === "compound") {
//     return (
//       <td key={fieldKey} className="p-2">
//         {
//           /* then create links for the id and name cells only if the real data  TODO: make this part modular */
//           fieldKey === "id" || fieldKey === "name" ? (
//             <Link
//               href={`/items/${row["id"]}`}
//               className="transition-all duration-200 hover:underline">
//               {row[fieldKey]}
//             </Link>
//           ) : (
//             row[fieldKey]
//           )
//         }
//       </td>
//     );
//   }
// }

// function ActionCell({ type = "simple", row, rowActions, isLoading }) {
//   if (isLoading) {
//     return (
//       <td className="w-2 p-2 align-middle">
//         <EllipsisVerticalIcon className="size-6 stroke-1 hover:stroke-2" />
//       </td>
//     );
//   }

//   if (type === "simple")
//     return (
//       <td className="w-2 p-2 align-middle">
//         {rowActions ? (
//           <MenuWithModal rowData={row} rowActions={rowActions} />
//         ) : (
//           ""
//         )}
//       </td>
//     );

//   if (type === "compound")
//     return (
//       <td className="w-2 p-2 align-middle">
//         <CollapsibleTrigger asChild>
//           <div
//             className={cn(
//               "rounded-md text-left text-sm transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
//             )}>
//             <ChevronDownIcon className="text-muted-foreground pointer-events-none size-5 shrink-0 translate-y-0.5 transition-transform duration-200" />
//           </div>
//         </CollapsibleTrigger>
//       </td>
//     );
// }

// /**
//  * A generic, reusable table component for displaying data.
//  * It supports dynamic row actions and displays a loading state if no data is provided.
//  *
//  * @param {string[]} labels - An array of strings to be used as table headers. This is required.
//  * @param {object[]} [data] - An array of objects to display. Each object should have an `id` property. If not provided, the table will render in a loading state.
//  * @param {object[]} [rowActions] - An array of action objects for the menu in each row. Each object should have `id`, `label`, `icon`, and `action` properties.
//  */

export default function Table({ type = "simple", labels, data, rowActions }) {
  if (!labels) {
    throw new Error(
      "Table component requires 'labels' prop, but none was passed.",
    );
  }

  const tableData =
    data ||
    //default place holder for when data is not passed
    Array.from({ length: 3 }, (_, i) => ({
      id: "loading" + i,
      ...Object.fromEntries(
        labels.filter((_, i) => i > 0).map((label) => [label, "loading"]),
      ),
    }));

  const isLoading = !data;

  return (
    <div className="overflow-scroll rounded-lg border border-neutral-200">
      <Menus>
        <table className="w-full table-auto text-left text-sm">
          <TableHeader labels={labels} />

          <tbody>
            {/* loop through the data rows (list of objects) */}
            {tableData.map((row) => (
              <Collapsible key={row.id} asChild>
                <>
                  <TableRow key={row.id} rowId={row.id}>
                    <CheckboxCell rowId={row.id} />

                    {Object.keys(row).map((fieldKey) => (
                      <TableCell
                        type={type}
                        row={row}
                        key={fieldKey}
                        fieldKey={fieldKey}
                        isLoading={isLoading}
                      />
                    ))}

                    <ActionCell
                      row={row}
                      rowActions={rowActions}
                      isLoading={isLoading}
                      type={type}
                    />
                  </TableRow>
                  {type === "compound" && (
                    <CollapsibleContent
                      asChild
                      className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 transition-all duration-200 ease-in-out">
                      <tr>
                        <td
                          colSpan={labels.length + 2}
                          className="bg-gray-50 p-4">
                          <TableRowDetail />
                        </td>
                      </tr>
                    </CollapsibleContent>
                  )}
                </>
              </Collapsible>
            ))}
          </tbody>
        </table>
      </Menus>
    </div>
  );
}
//data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0
// <div>
//   <div>
//     <Collapsible>
//       <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
//       <CollapsibleContent>
//         Yes. Free to use for personal and commercial projects. No attribution
//         required.
//       </CollapsibleContent>
//     </Collapsible>
//   </div>
// </div>;
