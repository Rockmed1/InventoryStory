"use client";

import { createStore } from "zustand";

// Define the props that our store can be initialized with.
// This is for the initial server-side data.
export const initStore = () => {
  return {
    // Each data slice starts as an empty array
    item: [],
    itemClass: [],
    location: [],
    bin: [],
    trxType: [],
    itemTrx: [],
    itemTrxDetails: [],
    trxDirections: [],
    marketType: [],
    market: [],
  };
};

export const createAppStore = (initState = initStore()) => {
  return createStore((set) => ({
    ...initState,

    // --- Actions to hydrate (update) the store on the client side from server-fetched data ---

    // A. full replacement of complete list
    setItem: (item) => set({ item }),
    setItemClass: (itemClass) => set({ itemClass }),
    setLocation: (location) => set({ location }),
    setBin: (bin) => set({ bin }),
    setTrxType: (trxType) => set({ trxType }),
    setItemTrx: (itemTrx) => set({ itemTrx }),
    setTrxDirections: (trxDirections) => set({ trxDirections }),
    setMarketType: (marketType) => set({ marketType }),
    setMarket: (market) => set({ market }),

    //B. Add as needed with every new fetch
    addItemTrxDetails: (newRows) =>
      set((state) => ({
        itemTrxDetails: [...state.itemTrxDetails, ...newRows],
      })),

    // --- LATER: Optimistic update action ---
    // This can be used for a snappier UI experience
    addItemOptimistic: (newItem) =>
      set((state) => ({
        item: [...state.item, { ...newItem, idField: `temp-${Date.now()}` }], // Add with a temporary ID
      })),
  }));
};
