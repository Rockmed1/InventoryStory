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
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "Transaction ID", label: "Trx ID" },
    foreignKey: { entity: "itemTrx", field: "idField" },
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
  fromBin: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
    display: { name: "From Bin", label: "From Bin" },
    foreignKey: { entity: "bin", field: "idField" },
  },
  toBin: {
    _type: "number",
    fieldValidation: { type: "positiveInteger", required: true, unique: false },
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
};

const {
  idField,
  nameField,
  descField,
  itemClassId,
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
  fromBin,
  toBin,
  qtyIn,
  qtyOut,
} = FIELD_CONFIG;

const ENTITY_CONFIG = {
  item: {
    display: { name: "Item", label: "Item" },
    pattern: "master",
    fields: {
      idField,
      nameField: { ...nameField, fieldValidation: "string100" },
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
      a: "sum of detail lines equals itemTrxHeader.numOfLines",
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
      fromBin,
      toBin,
      qtyIn,
      qtyOut,
    },
    changeDetectionFields: [
      "descField",
      "itemId",
      "fromBin",
      "toBin",
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
      a: "based on itemTrxHeader.trxTypeId get the corresponding trxDirectionId from trxType query.
        
      `        * If Direction is '1'(Incoming Transaction) ->          
       * qty_in must be provided and be greater than 0.
       * to_bin_id (where the items are going) must be provided.
       * qty_out must NOT be provided (must be NULL).
       * from_bin_id must NOT be provided (must be NULL).
`
   `* If Direction is '2' (Outgoing Transaction):
       * qty_out must be provided and be greater than 0.
       * from_bin_id (where the items are coming from) must be
         provided.
       * qty_in must NOT be provided (must be NULL).
       * to_bin_id must NOT be provided (must be NULL).
       * It also checks for sufficient Quantity on Hand (QOH) by
         calling the _fn_not_enough_item_QOH function.
``
   * If Direction is '3' (Transfer Transaction):
       * Both qty_in and qty_out must be provided and be greater than
         0.
       * Both from_bin_id and to_bin_id must be provided.
       * Crucially, it checks that to_bin_id is not the same as
         from_bin_id.
       * It also checks for sufficient QOH in the from_bin_id.` ",
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
