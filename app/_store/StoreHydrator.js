"use client";

import { useEffect } from "react";
import { useAppStore } from "./AppProvider";

export default function StoreHydrator({ entities }) {
  const setItem = useAppStore((state) => state.setItem);
  const setItemClass = useAppStore((state) => state.setItemClass);
  const setLocation = useAppStore((state) => state.setLocation);
  const setBin = useAppStore((state) => state.setBin);
  const setTrxType = useAppStore((state) => state.setTrxType);
  const setTrxDirections = useAppStore((state) => state.setTrxDirections);
  const setItemTrx = useAppStore((state) => state.setItemTrx);
  const setMarketType = useAppStore((state) => state.setMarketType);
  const setMarket = useAppStore((state) => state.setMarket);

  const addItemTrxDetails = useAppStore((state) => state.addItemTrxDetails);

  // Mapping of entity names to their setter functions
  const entitySetters = {
    item: setItem,
    itemClass: setItemClass,
    location: setLocation,
    bin: setBin,
    trxType: setTrxType,
    trxDirections: setTrxDirections,
    itemTrx: setItemTrx,
    marketType: setMarketType,
    market: setMarket,
    itemTrxDetails: addItemTrxDetails, // Special case - uses add instead of set
  };

  useEffect(() => {
    if (entities && typeof entities === "object") {
      Object.entries(entities).forEach(([entityName, entityData]) => {
        if (entityData && entitySetters[entityName]) {
          entitySetters[entityName](entityData);
        }
      });
    }
  }, []);

  return null;
}
