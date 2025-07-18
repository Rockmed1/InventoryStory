"use client";

import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createAppStore } from "./appStore";

// 1- Create the context
export const AppStoreContext = createContext(undefined);

// 2- Create the provider component
export function AppProvider({ children }) {
  const storeRef = useRef(null);

  //3- Create the store instance only once
  if (!storeRef.current) {
    storeRef.current = createAppStore();
  }

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  );
}

//4- create the hook for consuming the store
export function useAppStore(DropDown) {
  const storeContext = useContext(AppStoreContext);

  if (!storeContext) {
    throw new Error(`useAppStore must be used within an AppProvider`);
  }

  return useStore(storeContext, DropDown);
}
