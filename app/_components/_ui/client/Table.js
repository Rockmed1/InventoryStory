"use client";

import Menus from "@/app/_components/_ui/client/Menus";
import useTableState, { TableProvider } from "@/app/_store/TableProvider";
import { cn } from "@/app/_utils/utils";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, use, useCallback, useMemo, useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./Collapsible";
import MenuWithModal from "./MenuWithModal";

// import { createContext, use, useState } from "react";

// const initialState = {
//   type: "simple",
//   labels: [],
//   tableData: [],
//   rowActions: [],
//   redirectTo: "",
//   isLoading: true,
//   openRow: undefined,
// };

const UrlStateContext = createContext();

export function useUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const openRowId = useMemo(() => {
    return searchParams.get("item_trx_id");
  }, [searchParams]);

  const toggleRow = useCallback(
    (rowId) => {
      const params = new URLSearchParams(searchParams);

      if (openRowId === rowId.toString()) {
        params.delete("item_trx_id");
      } else {
        params.set("item_trx_id", rowId.toString());
      }

      router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    },
    [openRowId, router, pathName],
  );

  return { openRowId, toggleRow };
  // return useMemo(() => ({ openRowId, toggleRow }), [openRowId, toggleRow]);
}

export function UrlStateProvider({ children }) {
  const urlState = useUrlState();

  return (
    <UrlStateContext.Provider value={urlState}>
      {children}
    </UrlStateContext.Provider>
  );
}

export function useUrlStateContext() {
  const context = use(UrlStateContext);
  if (context === undefined) {
    throw new Error("useUrlStateContext must be used within UrlStateProvider");
  }
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
          fieldKey === "id" || fieldKey === "name" ? (
            <Link
              href={`/${redirectTo}/${row["id"]}`}
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
          fieldKey === "id" || fieldKey === "date" ? (
            <Link
              href={`/${redirectTo}/${row["id"]}`}
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
  const { type, rowActions, isLoading } = useTableState();

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
    const { openRowId, toggleRow } = useUrlStateContext();
    const handleClick = useCallback(() => {
      toggleRow(row.id);
    }, [toggleRow, row.id]);

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

function TableBodyLoading({ children }) {
  const { tableData, type } = useTableState();
  // Debug re-renders
  const renderCount = useRef(0);
  renderCount.current++;

  console.log(`TableBodyLoading render #${renderCount.current}`, {
    tableDataLength: tableData.length,
    type,
  });

  return (
    <>
      {tableData.map((row) => (
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
    </>
  );
}

function TableBody({ children }) {
  const { tableData, type } = useTableState();
  const { openRowId } = useUrlStateContext();
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
        const isOpen = row.id.toString() === openRowId;

        return (
          <Collapsible key={row.id} asChild open={isOpen}>
            <tbody className="group">
              <TableRow rowId={row.id}>
                <CheckboxCell rowId={row.id} />
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
  labels,
  tableData,
  rowActions,
  redirectTo,
  children,
}) {
  // const {
  //   type = "simple", //default
  //   labels, //required
  //   tableData, //required validation
  //   rowActions = [], //default
  //   redirectTo = "", //default
  // } = config;

  // console.log(labels);
  if (!labels) {
    throw new Error(
      "Table component requires 'labels' prop, but none was passed.",
    );
  }
  //default place holder for when data is not passed
  //LATER: get the number of placeholder rows
  const placeHolderData = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        id: "loading" + i,
        ...Object.fromEntries(
          labels.filter((_, i) => i > 0).map((label) => [label, "loading"]),
        ),
      })),
    [labels],
  );

  const displayData = tableData || placeHolderData;

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
  // const openRowId = searchParams.get("item_trx_id");

  const tableState = useMemo(
    () => ({
      type,
      labels,
      tableData: displayData,
      rowActions,
      redirectTo,
      isLoading: !tableData,
      // openRow: openRowId,
    }),
    [
      type,
      labels,
      rowActions,
      redirectTo,
      displayData,
      // openRowId,
    ],
  );

  return (
    <UrlStateProvider>
      <TableProvider initialState={tableState}>
        <div className="overflow-scroll rounded-lg border border-neutral-200">
          <Menus>
            <table className="w-full table-auto text-left text-sm">
              <TableHeader labels={labels} />
              {tableState.isLoading ? (
                <TableBodyLoading />
              ) : (
                <TableBody>{children}</TableBody>
              )}
            </table>
          </Menus>
        </div>
      </TableProvider>
    </UrlStateProvider>
  );
}
