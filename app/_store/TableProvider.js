"use client";

import { createContext, use } from "react";

const TableContext = createContext();

export function TableProvider({ initialState, children }) {
  // const [tableState, setTableState] = useState(
  //   initialState /* || {
  //     type: "simple",
  //     labels: [],
  //     tableData: [],
  //     rowActions: [],
  //     redirectTo: "",
  //     isLoading: true,
  //     openRow: undefined,
  //   }, */,
  // );

  // const setOpenRow = useCallback(
  //   (rowId) =>
  //     setTableState((prev) => ({
  //       ...prev,
  //       openRow: rowId,
  //     })),
  //   [],
  // );

  // const resetOpenRow = useCallback(
  //   () =>
  //     setTableState((prev) => ({
  //       ...prev,
  //       openRow: undefined,
  //     })),
  //   [],
  // );

  // const resetIsLoading = useCallback(
  //   () =>
  //     setTableState((prev) => ({
  //       ...prev,
  //       isLoading: false,
  //     })),
  //   [],
  // );

  // const contextValue = useMemo(
  //   () => ({
  //     ...tableState,
  //     resetIsLoading,
  //     setOpenRow,
  //     resetOpenRow,
  //   }),
  //   [tableState, resetIsLoading, setOpenRow, resetOpenRow],
  // );
  // console.log(tableState);

  // const contextValue = useMemo(
  //   () => ({
  //     type: initialState.type,
  //     labels: initialState.labels,
  //     tableData: initialState.tableData,
  //     rowActions: initialState.rowActions,
  //     redirectTo: initialState.redirectTo,
  //     isLoading: initialState.isLoading,
  //   }),
  //   [
  //     initialState.type,
  //     initialState.labels,
  //     initialState.tableData,
  //     initialState.rowActions,
  //     initialState.redirectTo,
  //     initialState.isLoading,
  //   ],
  // );

  // console.log(initialState);

  return (
    // <TableContext.Provider value={contextValue}>
    <TableContext.Provider value={initialState}>
      {children}
    </TableContext.Provider>
  );
}

export default function useTableState() {
  const context = use(TableContext);

  // console.log(context);
  if (context === undefined)
    throw new Error("Table context was used outside provider");

  return context;
}
