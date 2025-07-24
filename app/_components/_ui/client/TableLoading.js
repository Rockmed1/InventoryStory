"use client";

import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useMemo, useRef } from "react";

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

function TableRow({ rowId, children }) {
  return (
    <tr
      key={rowId}
      className="h-13 border-b border-neutral-200 bg-white transition-all duration-300 hover:bg-neutral-100/50">
      {children}
    </tr>
  );
}

function CheckboxCell({ rowId }) {
  return (
    <td className="w-3 translate-y-0.5 border-neutral-200 p-2 pr-0 transition-all duration-200">
      <input
        type="checkbox"
        id={`checkbox-${rowId}`}
        role="checkbox"
        className="relative ml-2 size-4 cursor-pointer appearance-none rounded-[3px] border border-neutral-200 bg-white shadow-xs checked:border-neutral-500 checked:bg-neutral-500/50 checked:after:absolute checked:after:top-0 checked:after:left-0.5 checked:after:text-xs checked:after:font-bold checked:after:text-white checked:after:content-['✓']"
      />
    </td>
  );
}

function TableCell({ fieldKey }) {
  return (
    <td key={fieldKey} className="p-2">
      <div className="loader3"></div>
    </td>
  );
}

function ActionCell() {
  return (
    <td className="w-2 p-2 align-middle">
      <EllipsisVerticalIcon className="size-6 stroke-1 hover:stroke-2" />
    </td>
  );
}

/**
 * A generic, reusable table component for displaying data.
 * It supports dynamic row actions and displays a loading state if no data is provided.
 *
 * @param {string[]} labels - An array of strings to be used as table headers. This is required.
 * @param {object[]} [data] - An array of objects to display. Each object should have an `id` property. If not provided, the table will render in a loading state.
 * @param {object[]} [rowActions] - An array of action objects for the menu in each row. Each object should have `id`, `label`, `icon`, and `action` properties.
 */

export default function TableLoading({ config = {}, labels, children }) {
  // console.log(labels);
  if (!labels) {
    throw new Error(
      "Table component requires 'labels' prop, but none was passed.",
    );
  }

  const displayData = useMemo(() => {
    //default place holder for when data is not passed
    //LATER: get the number of placeholder rows
    return Array.from({ length: 3 }, (_, i) => ({
      id: "loading" + i,
      ...Object.fromEntries(
        labels.filter((_, i) => i > 0).map((label) => [label, "loading"]),
      ),
    }));
  }, [labels]);

  // Debug re-renders
  // const renderCount = useRef(0);
  // renderCount.current++;

  // console.log(`TableLoading render #${renderCount.current}`, {
  //   displayDataLength: displayData.length,
  // });

  return (
    <div className="overflow-scroll rounded-lg border border-neutral-200">
      <table className="w-full table-auto text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-100 whitespace-nowrap">
            <th scope="col" className="p-2 font-medium"></th>
            {labels.map((label) => (
              <th scope="col" key={label} className="h-10 px-2 font-medium">
                {label}
              </th>
            ))}
            <th scope="col" className="p-2 text-center font-medium"></th>
          </tr>
        </thead>

        {displayData.map((row) => (
          <tbody className="group" key={row.id}>
            <TableRow rowId={row.id}>
              <CheckboxCell rowId={row.id} />
              {Object.keys(row).map((fieldKey) => (
                <TableCell row={row} key={fieldKey} fieldKey={fieldKey} />
              ))}
              <ActionCell row={row} />
            </TableRow>
          </tbody>
        ))}
      </table>
    </div>
  );
}
