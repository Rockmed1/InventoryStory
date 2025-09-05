"use client";

import { createContext, use } from "react";

const TableContext = createContext();

export function TableProvider({ initialState, children }) {
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
