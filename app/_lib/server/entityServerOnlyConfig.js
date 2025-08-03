"server only";

export function allowedEntities() {
  const ALLOWED_ENTITIES = [
    "item",
    "bin",
    "market",
    "trxType",
    "itemClass",
    "location",
    "marketType",
    "itemTrx",
    "itemTrxDetails",
  ];

  return ALLOWED_ENTITIES;
}
export default function entityServerOnlyConfig(entity) {
  const ENTITY_SERVER_ONLY_CONFIG = {
    item: {
      get: "getItems",
      fieldMappings: {
        idField: "_item_id",
        nameField: "_item_name",
        descField: "_item_desc",
        itemClassId: "_item_class_id",
      },
    },

    bin: {
      get: "getBins",
      fieldMappings: {
        idField: "_bin_id",
        nameField: "_bin_name",
        descField: "_bin_desc",
        locationId: "_loc_id",
      },
    },

    trxType: {
      get: "getTrxTypes",
      fieldMappings: {
        idField: "_trx_type_id",
        nameField: "_trx_type_name",
        descField: "_trx_type_desc",
        directionId: "_trx_direction_id",
      },
    },

    market: {
      get: "getMarkets",
      fieldMappings: {
        idField: "_market_id",
        nameField: "_market_name",
        descField: "_market_desc",
        urlField: "_market_url",
        marketTypeId: "_market_type_id",
      },
    },

    location: {
      get: "getLocations",
      fieldMappings: {
        idField: "_loc_id",
        nameField: "_loc_name",
        descField: "_loc_desc",
      },
    },

    itemClass: {
      get: "getItemClasses",
      fieldMappings: {
        idField: "_item_class_id",
        nameField: "_item_class_name",
        descField: "_item_class_desc",
      },
    },

    marketType: {
      get: "getMarketTypes",
      fieldMappings: {
        idField: "_market_type_id",
        nameField: "_market_type_name",
        descField: "_market_type_desc",
      },
    },

    itemTrx: {
      get: "getItemTrx",
      fieldMappings: {
        itemTrxHeader: "_trx_header",
        itemTrxDetails: "_trx_details",
      },
    },

    itemTrxHeader: {
      get: "getItemTrx",
      fieldMappings: {
        idField: "_trx_id",
        descField: "_trx_desc",
        dateField: "_trx_date",
        trxTypeId: "_trx_type_id",
        marketId: "_market_id",
      },
    },

    itemTrxDetails: {
      get: "getItemTrxDetails",
      fieldMappings: {
        itemTrxId: "_item_trx_id",
        lineNum: "_trx_line_num",
        itemId: "_item_id",
        fromBinId: "_from_bin_id",
        toBinId: "_to_bin_id",
        qtyIn: "_qty_in",
        qtyOut: "_qty_out",
        lineDesc: "_item_trx_desc",
      },
    },
  };

  const config = ENTITY_SERVER_ONLY_CONFIG[entity];

  return config;
}
