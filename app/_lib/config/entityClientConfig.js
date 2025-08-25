const FIELD_CONFIG = {
  idField: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "ID", label: "ID" },
  },
  nameField: {
    _type: "string",
    fieldValidation: { type: "string50", required: true, unique: true },
    display: { name: "Name", label: "Name" },
  },
  descField: {
    _type: "string",
    fieldValidation: { type: "text", required: true, unique: false },
    display: { name: "Description", label: "Description" },
  },
  itemClassId: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Item Class", label: "Item Class" },
    foreignKey: { entity: "itemClass", field: "idField" },
  },
  itemQoh: {
    _type: "number",
    fieldValidation: { type: "decimal", required: false, unique: false },
    display: { name: "Quantity Out", label: "Qty Out" },
  },

  locationId: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Location ID", label: "Location Id" },
    foreignKey: { entity: "location", field: "idField" },
  },
  urlField: {
    _type: "string",
    fieldValidation: { type: "url", required: false, unique: false },
    display: { name: "URL", label: "URL" },
  },
  marketTypeId: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Market Type ID", label: "Market Type Id" },
    foreignKey: { entity: "marketType", field: "idField" },
  },
  trxDirectionId: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Transaction Direction ID", label: "Trx Direction Id" },
    foreignKey: { entity: "trxDirection", field: "idField" },
  },
  // Item Transaction fields
  trxTypeId: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Transaction Type ID", label: "Trx Type Id" },
    foreignKey: { entity: "trxType", field: "idField" },
  },
  dateField: {
    _type: "date",
    fieldValidation: { type: "date", required: true, unique: false },
    display: { name: "Transaction Date", label: "Trx Date" },
  },
  marketId: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Market", label: "Market" },
    foreignKey: { entity: "market", field: "idField" },
  },
  numOfLines: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Number of Lines", label: "# of Lines" },
  },
  // Item Transaction Detail fields
  itemTrxId: {
    _type: "number",
    fieldValidation: {
      type: "positiveInteger",
      required: false,
      unique: false,
    },
    display: { name: "Transaction ID", label: "Trx ID" },
    foreignKey: { entity: "itemTrx", field: "idField", forValidation: false },
  },
  trxLineNum: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Line Number", label: "Line Num" },
  },

  itemId: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Item ID ", label: "Item Id" },
    foreignKey: { entity: "item", field: "idField" },
  },

  binId: {
    _type: "number",
    fieldValidation: {
      type: "positiveInteger",
      required: true,
      unique: false,
    },
    display: { name: "Bin Id", label: "Bin Id" },
    foreignKey: { entity: "bin", field: "idField" },
  },

  fromBinId: {
    _type: "number",
    fieldValidation: {
      type: "positiveInteger",
      required: false,
      unique: false,
    },
    display: { name: "From Bin", label: "From Bin" },
    foreignKey: { entity: "bin", field: "idField" },
  },
  toBinId: {
    _type: "number",
    fieldValidation: {
      type: "positiveInteger",
      required: false,
      unique: false,
    },
    display: { name: "To Bin", label: "To Bin" },
    foreignKey: { entity: "bin", field: "idField" },
  },
  qtyIn: {
    _type: "number",
    fieldValidation: { type: "decimal", required: false, unique: false },
    display: { name: "Quantity In", label: "Qty In" },
  },
  qtyOut: {
    _type: "number",
    fieldValidation: { type: "decimal", required: false, unique: false },
    display: { name: "Quantity Out", label: "Qty Out" },
  },

  fromField: {
    _type: "number",
    fieldValidation: {
      type: "positiveInteger",
      required: false,
      unique: false,
    },
    display: { name: "From", label: "From" },
    foreignKey: { entity: "", field: "idField" },
  },
  toField: {
    _type: "number",
    fieldValidation: {
      type: "positiveInteger",
      required: false,
      unique: false,
    },
    display: { name: "To", label: "To" },
    foreignKey: { entity: "", field: "idField" },
  },
  valueIn: {
    _type: "number",
    fieldValidation: { type: "decimal", required: false, unique: false },
    display: { name: "Value In", label: "value In" },
  },
  valueOut: {
    _type: "number",
    fieldValidation: { type: "decimal", required: false, unique: false },
    display: { name: "Value Out", label: "value Out" },
  },
};

const {
  idField,
  nameField,
  descField,
  itemClassId,
  itemQoh,
  locationId,
  urlField,
  marketTypeId,
  trxDirectionId,
  trxTypeId,
  dateField,
  marketId,
  numOfLines,
  itemTrxId,
  trxLineNum,
  itemId,
  binId,
  fromBinId,
  toBinId,
  qtyIn,
  qtyOut,
} = FIELD_CONFIG;

const ENTITY_CONFIG = {
  item: {
    display: { name: "Item", label: "Item" },
    pattern: "master",
    fields: {
      idField,
      nameField: {
        ...nameField,
        fieldValidation: { ...nameField.fieldValidation, type: "string100" },
      },
      descField,
      itemClassId,
    },
    changeDetectionFields: ["nameField", "descField", "itemClassId"],
    displayTableLabels: ["ID", "Name", "Description", "Item Class", "QOH"],
    urlIdentifer: "item",
  },

  bin: {
    display: { name: "Bin", label: "Bin" },
    pattern: "master",
    fields: {
      idField,
      nameField,
      descField,
      locationId,
    },
    changeDetectionFields: ["nameField", "descField", "locationId"],
    displayTableLabels: ["ID", "Name", "Location", "Description"],
    urlIdentifer: "binId",
  },

  location: {
    display: { name: "Location", label: "Location" },
    pattern: "master",
    fields: {
      idField,
      nameField,
      descField,
    },
    changeDetectionFields: ["nameField", "descField"],
    displayTableLabels: ["ID", "Name", "Description"],
    urlIdentifer: "locationId",
  },

  market: {
    display: { name: "Market", label: "Market" },
    pattern: "master",
    fields: {
      idField,
      nameField,
      descField,
      urlField,
      marketTypeId,
    },
    changeDetectionFields: [
      "nameField",
      "descField",
      "urlField",
      "marketTypeId",
    ],
    displayTableLabels: ["ID", "Name", "Market Type", "Description", "URL"],
    urlIdentifer: "marketId",
  },

  marketType: {
    display: { name: "Market Type", label: "Market Type" },
    pattern: "setup",
    fields: {
      idField,
      nameField,
      descField,
    },
    changeDetectionFields: ["nameField", "descField"],
    displayTableLabels: ["ID", "Name", "Description"],
    urlIdentifer: "marketTypeId",
  },

  itemClass: {
    display: { name: "Item Class", label: "Item Class" },
    pattern: "setup",
    fields: {
      idField,
      nameField,
      descField,
    },
    changeDetectionFields: ["nameField", "descField"],
    displayTableLabels: ["ID", "Name", "Description"],
    urlIdentifer: "itemClassId",
  },

  trxType: {
    display: { name: "Transaction Type", label: "Trx Type" },
    pattern: "setup",
    fields: {
      idField,
      nameField,
      descField,
      trxDirectionId,
    },
    changeDetectionFields: ["nameField", "descField", "trxDirectionId"],
    displayTableLabels: ["ID", "Name", "Direction", "Description"],
    urlIdentifer: "trxTypeId",
  },

  trxDirection: {
    display: { name: "Transaction Direction", label: "Trx Direction" },
    pattern: "setup",
    fields: {
      idField,
      nameField,
      descField,
    },
    changeDetectionFields: ["nameField", "descField"],
    displayTableLabels: ["ID", "Name", "Description"],
    urlIdentifer: "trxDirectionId",
  },

  itemQoh: {
    display: { name: "Quantity On Hand", label: "Qoh" },
    pattern: "aggregate",
    fields: {
      idField,
      itemId,
      binId,
      itemQoh,
    },
  },

  itemTrx: {
    display: { name: "Item Transaction", label: "Item Trx" },
    pattern: "transaction",
    compositeEntities: { header: "itemTrxHeader", line: "itemTrxDetails" },
    fields: {
      idField,
      dateField,
      descField,
      trxTypeId,
      marketId,
      numOfLines,
    },
    changeDetectionFields: [
      "dateField",
      "descField",
      "trxTypeId",
      "marketId",
      "numOfLines",
    ],
    displayTableLabels: [
      "ID",
      "Date",
      "Description",
      "Transaction Type",
      "Direction",
      "Market",
      "URL",
    ],
    urlIdentifer: "itemTrxId",
    businessRules: {
      compositeBased: {
        validations: [
          "lineCountConsistency", //numOfLines match actual line count
          "compositEntitiesBusinessRules", //header.trxType drives line validation
        ],
      },
    },
  },
  itemTrxHeader: {
    display: { name: "Transaction Header", label: "Trx Header" },
    pattern: "header",
    fields: {
      idField,
      dateField,
      descField,
      trxTypeId,
      marketId,
      numOfLines,
    },
    changeDetectionFields: [
      "dateField",
      "descField",
      "trxTypeId",
      "marketId",
      "numOfLines",
    ],
    displayTableLabels: [
      "ID",
      "Date",
      "Description",
      "Transaction Type",
      "Direction",
      "Market",
      "URL",
    ],
    urlIdentifer: "itemTrxId",
  },
  itemTrxDetails: {
    display: { name: "Item Transaction Details", label: "Trx Details" },
    pattern: "line",
    fields: {
      idField,
      itemTrxId,
      trxLineNum,
      descField: {
        ...descField,
        display: { name: "Line Description", label: "Line Desc" },
      },
      itemId,
      fromBinId,
      toBinId,
      qtyIn,
      qtyOut,
    },
    changeDetectionFields: [
      "descField",
      "itemId",
      "fromBinId",
      "toBinId",
      "qtyIn",
      "qtyOut",
    ],
    displayTableLabels: [
      "Line #",
      "Description",
      "Item",
      "From Bin",
      "To Bin",
      "Qty In",
      "Qty Out",
    ],
    urlIdentifer: "itemTrxId",
    businessRules: {
      directionBased: {
        directionSource: {
          directionSourceEntity: "itemTrxHeader",
          directionSourceField: "trxTypeId",
          lookupEntity: "trxType",
          lookupField: "idField",
          targetField: "trxDirectionId",
        },

        rules: {
          1: {
            // Incoming Transaction
            name: "incoming",
            required: ["qtyIn", "toBinId"],
            forbidden: ["qtyOut", "fromBinId"],
            conditions: [{ field: "qtyIn", operator: ">", value: 0 }],
            // No customValidations needed for incoming
          },
          2: {
            // Outgoing Transaction
            name: "outgoing",
            required: ["qtyOut", "fromBinId"],
            forbidden: ["qtyIn", "toBinId"],
            conditions: [{ field: "qtyOut", operator: ">", value: 0 }],
            customValidations: ["checkSufficientQOH"],
          },
          3: {
            // Transfer Transaction
            name: "transfer",
            required: ["qtyIn", "qtyOut", "fromBinId", "toBinId"],
            forbidden: [],
            conditions: [
              { field: "qtyIn", operator: ">", value: 0 },
              { field: "qtyOut", operator: ">", value: 0 },
              { field: "qtyOut", operator: "==", compareToField: "qtyIn" },
              { field: "fromBinId", operator: "!=", compareToField: "toBinId" },
            ],
            customValidations: ["checkSufficientQOH"],
          },
        },
      },
    },
  },
};

export const PATTERN_CONFIG = {
  master: "atomic",
  header: "atomic",
  line: "atomic",
  document: "composite",
  transaction: "composite",
  setup: "atomic",
  mapping: "atomic",
  hierarchy: "atomic",
  aggregate: "atomic",
  summary: "atomic",
  snapshot: "atomic",
  history: "atomic",
  event: "atomic",
  audit: "atomic",
};

export default function entityClientConfig(entity) {
  return ENTITY_CONFIG[entity];
}

export function fieldClientConfig(field) {
  return FIELD_CONFIG[field];
}
