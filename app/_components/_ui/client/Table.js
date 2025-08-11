"use client";

import Menus from "@/app/_components/_ui/client/Menus";

import {
  getEntityTableLabels,
  getEntityUrlIdentifier,
} from "@/app/_utils/helpers";
import { useUrlParam } from "@/app/_utils/helpers-client";
import { cn } from "@/app/_utils/utils";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { createContext, use, useCallback, useMemo } from "react";
import MenuWithModal from "./MenuWithModal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./shadcn-Collapsible";

// import { createContext, use, useState } from "react";

// const tableState = {
//   type: "simple",
//   labels: [],
//   tableData: [],
//   rowActions: [],
//   redirectTo: "",
//   isLoading: true,
//   openRow: undefined,
// };

//Table context to make the components more readable
const TableContext = createContext();

function TableProvider({ tableState, children }) {
  return (
    <TableContext.Provider value={tableState}>{children}</TableContext.Provider>
  );
}

function useTableState() {
  const context = use(TableContext);

  if (context === undefined)
    throw new Error("Table context was used outside provider");

  return context;
}

function TableHeader() {
  const { labels } = useTableState();
  return (
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
  );
}

function TableRow({ rowId, children }) {
  return (
    <tr
      key={rowId}
      className="h-13 border-b border-neutral-200 bg-white transition-all duration-300 hover:bg-neutral-100/50">
      {children}
    </tr>
  );
}

function LoadingCell({ fieldKey }) {
  return (
    <td key={fieldKey} className="p-2">
      <div className="loader3"></div>
    </td>
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

function TableCell({ row, fieldKey }) {
  const { type, isLoading, redirectTo } = useTableState();

  if (isLoading) {
    return <LoadingCell key={fieldKey} />;
  }

  if (type === "simple") {
    return (
      <td key={fieldKey} className="p-2">
        {
          /* then create links for the id and name cells only if the real data  TODO: make this part modular */
          (fieldKey === "idField" || fieldKey === "nameField") && redirectTo ? (
            <Link
              href={`/${redirectTo}/${row["idField"]}`}
              className="transition-all duration-200 hover:underline">
              {row[fieldKey]}
            </Link>
          ) : (
            row[fieldKey]
          )
        }
      </td>
    );
  }

  if (type === "compound") {
    return (
      <td key={fieldKey} className="p-2">
        {
          /* then create links for the id and name cells only if the real data  TODO: make this part modular */
          fieldKey === "idField" || fieldKey === "dateField" ? (
            <Link
              href={`/${redirectTo}/${row["idField"]}`}
              className="transition-all duration-200 hover:underline">
              {row[fieldKey]}
            </Link>
          ) : (
            row[fieldKey]
          )
        }
      </td>
    );
  }
}

function ActionCell({ row }) {
  const { entity, type, rowActions, isLoading } = useTableState();

  if (isLoading) {
    return (
      <td className="w-2 p-2 align-middle">
        <EllipsisVerticalIcon className="size-6 stroke-1 hover:stroke-2" />
      </td>
    );
  }

  if (type === "simple")
    return (
      <td className="w-2 p-2 align-middle">
        {rowActions ? (
          <MenuWithModal rowData={row} rowActions={rowActions} />
        ) : (
          ""
        )}
      </td>
    );

  if (type === "compound") {
    const param = getEntityUrlIdentifier(entity);
    const { toggle: toggleRow } = useUrlParam(param);

    const handleClick = useCallback(() => {
      toggleRow(row.idField);
    }, [toggleRow, row.idField]);

    return (
      <td className="w-2 p-2 align-middle">
        <CollapsibleTrigger asChild>
          <div
            className={cn(
              "rounded-md text-left text-sm transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
            )}>
            <button
              onClick={() => {
                handleClick();
              }}>
              <ChevronDownIcon className="text-muted-foreground pointer-events-none size-5 shrink-0 translate-y-0.5 transition-transform duration-200" />
            </button>
          </div>
        </CollapsibleTrigger>
      </td>
    );
  }
}

function TableRowDetail({ children }) {
  const { labels } = useTableState();
  // console.log("table details labels: ", labels);
  // console.log(children);
  return (
    <CollapsibleContent asChild forceMount>
      <tr>
        <td colSpan={labels.length + 2} className="p-0">
          <div className="grid grid-rows-[0fr] transition-all duration-300 ease-in-out group-data-[state=open]:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="transform-gpu bg-gray-50 p-4 opacity-0 transition-all duration-500 ease-in-out group-data-[state=open]:opacity-100">
                {children}
              </div>
            </div>
          </div>
        </td>
      </tr>
    </CollapsibleContent>
  );
}

function TableBodyLoading() {
  // const { tableData, type } = useTableState();
  // Debug re-renders
  // const renderCount = useRef(0);
  // renderCount.current++;

  // console.log(`TableBodyLoading render #${renderCount.current}`, {
  //   tableDataLength: tableData.length,
  //   type,
  // });

  // default place holder for when data is not passed
  // LATER: get the number of placeholder rows
  const placeHolderData = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        idField: "loading" + i,
        ...Object.fromEntries(
          labels.filter((_, i) => i > 0).map((label) => [label, "loading"]),
        ),
      })),
    [labels],
  );

  return (
    <>
      {placeHolderData.map((row) => (
        <tbody className="group" key={row.idField}>
          <TableRow rowId={row.idField}>
            <CheckboxCell rowId={row.idField} />
            {Object.keys(row).map((fieldKey) => (
              <TableCell row={row} key={fieldKey} fieldKey={fieldKey} />
            ))}
            <ActionCell row={row} />
          </TableRow>
        </tbody>
      ))}
    </>
  );
}

function TableBody({ children }) {
  const { entity, tableData, type } = useTableState();
  const param = getEntityUrlIdentifier(entity);
  const { paramValue: openRowId } = useUrlParam(param);

  // console.log("openRowId: ", openRowId);

  // // Debug re-renders

  // const renderCount = useRef(0);
  // renderCount.current++;

  // console.log(`TableBody render #${renderCount.current}`, {
  //   openRowId,
  //   tableDataLength: tableData.length,
  //   tableData: tableData,
  //   type,
  // });

  return (
    <>
      {tableData.map((row) => {
        const isOpen = row.idField.toString() === openRowId;

        return (
          <Collapsible key={row.idField} asChild open={isOpen}>
            <tbody className="group">
              <TableRow rowId={row.idField}>
                <CheckboxCell rowId={row.idField} />
                {Object.keys(row).map((fieldKey) => (
                  <TableCell row={row} key={fieldKey} fieldKey={fieldKey} />
                ))}
                <ActionCell row={row} />
              </TableRow>
              {type === "compound" && (
                <TableRowDetail>{children}</TableRowDetail>
              )}
            </tbody>
          </Collapsible>
        );
      })}
    </>
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

export default function Table({
  config = {},
  type = "simple",
  tableData,
  rowActions,
  redirectTo,
  entity,
  children,
}) {
  // const {
  //   type = "simple", //default
  //   labels, //required
  //   tableData, //required validation
  //   rowActions = [], //default
  //   redirectTo = "", //default
  // } = config;

  if (!entity) {
    throw new Error(
      "Table component requires 'entity' prop, but none was passed.",
    );
  }

  const labels = getEntityTableLabels(entity);

  // console.log(labels);
  if (!labels) {
    throw new Error(`No labels were found for entity ${entity}`);
  }
  //default place holder for when data is not passed
  //LATER: get the number of placeholder rows
  // const placeHolderData = useMemo(
  //   () =>
  //     Array.from({ length: 3 }, (_, i) => ({
  //       idField: "loading" + i,
  //       ...Object.fromEntries(
  //         labels.filter((_, i) => i > 0).map((label) => [label, "loading"]),
  //       ),
  //     })),
  //   [labels],
  // );

  // const displayData = tableData || placeHolderData;

  // // Debug re-renders
  // const renderCount = useRef(0);
  // renderCount.current++;

  // console.log(`Table render #${renderCount.current}`, {
  //   tableDataLength: displayData.length,
  //   tableData: displayData,
  //   type,
  // });

  // console.log(displayData);

  // const searchParams = useSearchParams();
  // const openRowId = searchParams.get("itemTrxId");

  const tableState = useMemo(
    () => ({
      entity,
      type,
      labels,
      tableData,
      rowActions,
      redirectTo,
      isLoading: !tableData,
      // openRow: openRowId,
    }),
    [
      type,
      labels,
      tableData,
      rowActions,
      redirectTo,

      // openRowId,
    ],
  );

  return (
    <TableProvider tableState={tableState}>
      <div className="overflow-scroll rounded-lg border border-neutral-200">
        <Menus>
          <table className="w-full table-auto text-left text-sm">
            <TableHeader labels={labels} />
            {!tableData ? (
              <TableBodyLoading />
            ) : (
              <TableBody>{children}</TableBody>
            )}
          </table>
        </Menus>
      </div>
    </TableProvider>
  );
}
