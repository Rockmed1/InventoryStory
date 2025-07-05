"use client";

import { useEffect } from "react";
import { useAppStore } from "./AppProvider";

export default function StoreHydrator({
  items,
  itemClasses,
  locations,
  bins,
  trxTypes,
  trxDirections,
  itemTrx,
  marketTypes,
  markets,
}) {
  // We use useEffect to ensure this runs only on the client, after the component mounts.
  // The props (items, locations) are passed down from a Server Component.

  const setItems = useAppStore((state) => state.setItems);
  const setItemClasses = useAppStore((state) => state.setItemClasses);
  const setLocations = useAppStore((state) => state.setLocations);
  const setBins = useAppStore((state) => state.setBins);
  const setTrxTypes = useAppStore((state) => state.setTrxTypes);
  const setTrxDirections = useAppStore((state) => state.setTrxDirections);
  const setItemTrx = useAppStore((state) => state.setItemTrx);
  const setMarketTypes = useAppStore((state) => state.setMarketTypes);
  const setMarkets = useAppStore((state) => state.setMarkets);

  useEffect(() => {
    if (items) {
      setItems(items);
    }
    if (itemClasses) {
      setItemClasses(itemClasses);
    }
    if (locations) {
      setLocations(locations);
    }
    if (bins) {
      setBins(bins);
    }
    if (trxTypes) {
      setTrxTypes(trxTypes);
    }
    if (trxDirections) {
      setTrxDirections(trxDirections);
    }
    if (itemTrx) {
      setItemTrx(itemTrx);
    }
    if (marketTypes) {
      setMarketTypes(marketTypes);
    }
    if (markets) {
      setMarkets(markets);
    }
  }, [
    items,
    itemClasses,
    locations,
    bins,
    trxTypes,
    trxDirections,
    itemTrx,
    marketTypes,
    markets,
  ]);

  return null;
}
