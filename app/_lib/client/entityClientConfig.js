"use client";

export default function entityClientConfig(entity) {
  const ENTITY_CLIENT_CONFIG = {
    item: {
      label: "Item",
      displayName: "Item",
      dependencies: ["itemClass"],
      displayTableLabels: ["Item ID", "Name", "Description", "Class", "QOH"],
    },

    bin: {
      label: "Bin",
      displayName: "Bin",
      dependencies: ["location"],
    },

    trxType: {
      label: "Trx Type",
      displayName: "Transaction Type",
      dependencies: [],
    },

    market: {
      label: "Market",
      displayName: "Market",
      dependencies: ["marketType"],
    },

    location: {
      label: "Location",
      displayName: "Location",
      dependencies: [],
    },

    itemClass: {
      label: "Item Class",
      displayName: "Item Class",
      dependencies: [],
    },

    marketType: {
      label: "Market Type",
      displayName: "Market Type",
      dependencies: [],
    },

    itemTrx: {
      label: "Item Trx",
      displayName: "Item Transaction",
      dependencies: ["bin", "item", "market", "trxType"],
    },

    itemTrxHeader: {
      label: "Trx Header",
      displayName: "Transaction Header",
      dependencies: ["market", "trxType"],
    },

    itemTrxDetails: {
      label: "Trx Details",
      displayName: "Transaction Detail",
      dependencies: ["item", "bin"],
    },
  };

  const config = ENTITY_CLIENT_CONFIG[entity];

  return config;
}