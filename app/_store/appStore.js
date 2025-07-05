"use client";

import { createStore } from "zustand";

// Define the props that our store can be initialized with.
// This is for the initial server-side data.
export const initStore = () => {
  return {
    // Each data slice starts as an empty array
    items: [],
    itemClasses: [],
    locations: [],
    bins: [],
    trxTypes: [],
    itemTrx: [],
    trxDirections: [],
    marketTypes: [],
    markets: [],
  };
};

export const createAppStore = (initState = initStore()) => {
  return createStore((set) => ({
    // Each data slice starts as an empty array
    // items: [],
    // itemClasses: [],
    // locations: [],
    // bins: [],
    // trxTypes: [],
    // itemTrx: [],
    // marketTypes: [],
    // markets: [],

    ...initState,

    // --- Actions to hydrate (update) the store on the client side from server-fetched data ---
    setItems: (items) => set({ items }),
    setItemClasses: (itemClasses) => set({ itemClasses }),
    setLocations: (locations) => set({ locations }),
    setBins: (bins) => set({ bins }),
    setTrxTypes: (trxTypes) => set({ trxTypes }),
    setItemTrx: (itemTrx) => set({ itemTrx }),
    setTrxDirections: (trxDirections) => set({ trxDirections }),
    setMarketTypes: (marketTypes) => set({ marketTypes }),
    setMarkets: (markets) => set({ markets }),

    // --- Example of an optimistic update action ---
    // This can be used for a snappier UI experience
    addItemOptimistic: (newItem) =>
      set((state) => ({
        items: [...state.items, { ...newItem, id: `temp-${Date.now()}` }], // Add with a temporary ID
      })),
  }));
};
