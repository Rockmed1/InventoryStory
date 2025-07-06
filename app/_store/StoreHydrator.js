"use client";

import { useEffect } from "react";
import { useAppStore } from "./AppProvider";

export default function StoreHydrator({
  item,
  itemClass,
  location,
  bin,
  trxType,
  trxDirections,
  itemTrx,
  marketType,
  market,
}) {
  // We use useEffect to ensure this runs only on the client, after the component mounts.
  // The props (items, locations) are passed down from a Server Component.

  const setItem = useAppStore((state) => state.setItem);
  const setItemClass = useAppStore((state) => state.setItemClass);
  const setLocation = useAppStore((state) => state.setLocation);
  const setBin = useAppStore((state) => state.setBin);
  const setTrxType = useAppStore((state) => state.setTrxType);
  const setTrxDirections = useAppStore((state) => state.setTrxDirections);
  const setItemTrx = useAppStore((state) => state.setItemTrx);
  const setMarketType = useAppStore((state) => state.setMarketType);
  const setMarket = useAppStore((state) => state.setMarket);

  useEffect(() => {
    if (item) {
      setItem(item);
    }
    if (itemClass) {
      setItemClass(itemClass);
    }
    if (location) {
      setLocation(location);
    }
    if (bin) {
      setBin(bin);
    }
    if (trxType) {
      setTrxType(trxType);
    }
    if (trxDirections) {
      setTrxDirections(trxDirections);
    }
    if (itemTrx) {
      setItemTrx(itemTrx);
    }
    if (marketType) {
      setMarketType(marketType);
    }
    if (market) {
      setMarket(market);
    }
  }, [
    item,
    itemClass,
    location,
    bin,
    trxType,
    trxDirections,
    itemTrx,
    marketType,
    market,
  ]);

  return null;
}
