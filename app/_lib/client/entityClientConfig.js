export default function entityClientConfig(entity) {
  const ENTITY_CLIENT_CONFIG = {
    item: {
      label: "Item",
      displayName: "Item",
      foreignKeys: {
        itemClassId: { itemClass: "id" },
      },
      changeDetectionFields: {
        nameField: "name",
        descField: "description",
        itemClassId: "itemClassId",
      },
      displayTableLabels: ["Item ID", "Name", "Description", "Class", "QOH"],
    },

    bin: {
      label: "Bin",
      displayName: "Bin",
      foreignKeys: {
        locationId: { location: "id" },
      },
    },

    trxType: {
      label: "Trx Type",
      displayName: "Transaction Type",
      foreignKeys: {},
    },

    market: {
      label: "Market",
      displayName: "Market",
      foreignKeys: {
        marketTypeId: { marketType: "id" },
      },
    },

    location: {
      label: "Location",
      displayName: "Location",
      foreignKeys: {},
    },

    itemClass: {
      label: "Item Class",
      displayName: "Item Class",
      foreignKeys: {},
    },

    marketType: {
      label: "Market Type",
      displayName: "Market Type",
      foreignKeys: {},
    },

    itemTrx: {
      label: "Item Trx",
      displayName: "Item Transaction",
      foreignKeys: {}, // This is a composite entity, validation is handled differently
    },

    itemTrxHeader: {
      label: "Trx Header",
      displayName: "Transaction Header",
      foreignKeys: {
        marketId: { market: "id" },
        trxTypeId: { trxType: "id" },
      },
    },

    itemTrxDetails: {
      label: "Trx Details",
      displayName: "Transaction Detail",
      foreignKeys: {
        itemId: { item: "id" },
        fromBinId: { bin: "id" },
        toBinId: { bin: "id" },
      },
    },
  };

  const config = ENTITY_CLIENT_CONFIG[entity];

  if (!config) {
    throw new Error(`Configuration for entity "${entity}" not found.`);
  }

  return config;
}
