"server only";

export default function entityConfig(entity) {
  const ENTITY_CONFIG = {
    item: {
      label: "Item",
      displayName: "Item",
      get: "getItems",
      fieldMappings: {
        // 3. Field mapping for validation
        idField: "_item_id",
        nameField: "_item_name",
      },
      dependencies: ["itemClass"],
    },
    bin: {
      label: "Bin",
      displayName: "Bin",
      get: "getBins",
      fieldMappings: {
        idField: "_bin_id",
        nameField: "_bin_name",
      },
      dependencies: ["location"],
    },
    trxType: {
      label: "Trx Type",
      displayName: "Transaction Type",
      get: "getTrxTypes",
      fieldMappings: {
        idField: "_trx_type_id",
        nameField: "_trx_type_name",
      },
      dependencies: [],
    },
    market: {
      label: "Market",
      displayName: "Market",
      get: "getMarkets",
      fieldMappings: {
        idField: "_market_id",
        nameField: "_market_name",
      },
      dependencies: ["marketType"],
    },
    location: {
      label: "Location",
      displayName: "Location",
      get: "getLocations",
      fieldMappings: {
        idField: "_loc_id",
        nameField: "_loc_name",
      },
      dependencies: [],
    },
    itemClass: {
      label: "Item Class",
      displayName: "Item Class",
      get: "getItemClasses",
      fieldMappings: {
        idField: "_item_class_id",
        nameField: "_item_class_name",
      },
      dependencies: [],
    },
    marketType: {
      label: "Market Type",
      displayName: "Market Type",
      get: "getMarketTypes",
      fieldMappings: {
        idField: "_market_type_id",
        nameField: "_market_type_name",
      },
      dependencies: [],
    },
    itemTrans: {
      label: "Item Trx",
      displayName: "Item Transaction",
      get: "getItemTrx",
      fieldMappings: {
        idField: "_trx_id",
        nameField: "_trx_desc",
      },
      dependencies: ["bin", "item", "market", "trxType"],
    },
    itemTrxHeader: {
      label: "Transaction Header",
      displayName: "Transaction Header",
      get: "getItemTrx",
      fieldMappings: {
        idField: "_trx_id",
        nameField: "_trx_desc",
      },
      dependencies: ["market", "trxType"],
    },
    itemTrxDetails: {
      label: "Transaction Details",
      displayName: "Transaction Detail",
      get: "getItemTrxDetails",
      fieldMappings: {
        idField: "_trx_detail_id",
        nameField: "_item_trx_desc",
      },
      dependencies: ["item", "bin"],
    },
  };

  const config = ENTITY_CONFIG[entity];

  return config;
}
