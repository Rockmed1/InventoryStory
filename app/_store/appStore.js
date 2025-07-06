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
    trxDirections: [],
    marketType: [],
    market: [],
  };
};

export const createAppStore = (initState = initStore()) => {
  return createStore((set) => ({
    // Each data slice starts as an empty array
    // item: [],
    // itemClass: [],
    // location: [],
    // bin: [],
    // trxType: [],
    // itemTrx: [],
    // marketType: [],
    // market: [],

    ...initState,

    // --- Actions to hydrate (update) the store on the client side from server-fetched data ---
    setItem: (item) => set({ item }),
    setItemClass: (itemClass) => set({ itemClass }),
    setLocation: (location) => set({ location }),
    setBin: (bin) => set({ bin }),
    setTrxType: (trxType) => set({ trxType }),
    setItemTrx: (itemTrx) => set({ itemTrx }),
    setTrxDirections: (trxDirections) => set({ trxDirections }),
    setMarketType: (marketType) => set({ marketType }),
    setMarket: (market) => set({ market }),

    // --- LATER: Optimistic update action ---
    // This can be used for a snappier UI experience
    addItemOptimistic: (newItem) =>
      set((state) => ({
        item: [...state.item, { ...newItem, id: `temp-${Date.now()}` }], // Add with a temporary ID
      })),
  }));
};
