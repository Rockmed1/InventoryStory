import { z } from "zod";
import { getFieldMappings } from "../_utils/helpers-client.js";

// Helper for creating standardized error messages
const errorMessages = {
  invalid: (field) => `Invalid ${field}.`,
  empty: (field) => `${field} cannot be empty.`,
  tooShort: (field, min) => `${field} must be at least ${min} characters long.`,
  tooLong: (field, max) => `${field} cannot exceed ${max} characters.`,
  duplicate: (field) =>
    `An ${field} with this name already exists. Please choose a different name.`,
  notFound: (field, id) => `${field} with ID ${id} does not exist.`,
  required: (field) => `${field} is required.`,
  positiveNumber: (field) => `${field} must be a positive number.`,
  invalidDate: () => "Please enter a valid date.",
  atLeastOne: (field) => `At least one ${field} is required.`,
  eitherOr: (field1, field2) =>
    `Either ${field1} or ${field2} must be specified.`,
};

// 1. App context schema
export const appContextSchema = z.object({
  _usr_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _usr_uuid" }),
  _org_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _org_uuid" }),
});

// 2. Define complete schemas with ALL fields (for UPDATE operations)
const schemas = {
  item: z.object({
    _item_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item id") }),
    _item_class_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item class id") }),
    _item_name: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item name", 2) })
      .max(100, { message: errorMessages.tooLong("Item name", 100) }),
    _item_desc: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item description", 2) }),
  }),

  location: z.object({
    _loc_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("location id") }),
    _loc_name: z
      .string()
      .min(2, { message: errorMessages.tooShort("Location name", 2) })
      .max(50, { message: errorMessages.tooLong("Location name", 50) }),
    _loc_desc: z
      .string()
      .min(2, { message: errorMessages.tooShort("Location description", 2) }),
  }),

  bin: z.object({
    _bin_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("bin id") }),
    _bin_name: z
      .string()
      .min(2, { message: errorMessages.tooShort("Bin name", 2) })
      .max(50, { message: errorMessages.tooLong("Bin name", 50) }),
    _bin_desc: z
      .string()
      .min(2, { message: errorMessages.tooShort("Bin description", 2) }),
    _loc_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("location id") }),
  }),

  itemClass: z.object({
    _item_class_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item class id") }),
    _item_class_name: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item class name", 2) })
      .max(50, { message: errorMessages.tooLong("Item class name", 50) }),
    _item_class_desc: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item class description", 2) }),
  }),

  marketType: z.object({
    _market_type_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market type id") }),
    _market_type_name: z
      .string()
      .min(2, { message: errorMessages.tooShort("Market type name", 2) })
      .max(50, { message: errorMessages.tooLong("Market type name", 50) }),
    _market_type_desc: z.string().min(2, {
      message: errorMessages.tooShort("Market type description", 2),
    }),
  }),

  market: z.object({
    _market_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market id") }),
    _market_name: z
      .string()
      .min(2, { message: errorMessages.tooShort("Market name", 2) })
      .max(50, { message: errorMessages.tooLong("Market name", 50) }),
    _market_desc: z
      .string()
      .min(2, { message: errorMessages.tooShort("Market description", 2) }),
    _market_url: z
      .string()
      .url({ message: errorMessages.invalid("market URL") }),
    _market_type_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market type id") }),
  }),

  trxType: z.object({
    _trx_type_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction type id") }),
    _trx_type_name: z
      .string()
      .min(2, { message: errorMessages.tooShort("Transaction type name", 2) })
      .max(50, { message: errorMessages.tooLong("Transaction type name", 50) }),
    _trx_type_desc: z.string().min(2, {
      message: errorMessages.tooShort("Transaction type description", 2),
    }),
    _trx_direction_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction direction id") }),
  }),

  // Item Transaction schemas - base schemas without refine for .shape access
  itemTrxHeaderBase: z.object({
    _trx_date: z
      .string()
      .min(1, { message: errorMessages.required("Transaction date") })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: errorMessages.invalidDate(),
      }),
    _trx_desc: z
      .string()
      .min(2, { message: errorMessages.tooShort("Transaction description", 2) })
      .max(500, {
        message: errorMessages.tooLong("Transaction description", 500),
      }),
    _market_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market ID") })
      .positive({ message: errorMessages.positiveNumber("Market ID") }),
    _trx_type_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction type ID") })
      .positive({
        message: errorMessages.positiveNumber("Transaction type ID"),
      }),
    _num_of_lines: z.coerce
      .number()
      .int()
      .min(1, { message: errorMessages.atLeastOne("transaction line") }),
  }),

  itemTrxDetailBase: z.object({
    _trx_line_num: z.coerce
      .number()
      .int()
      .positive({ message: errorMessages.positiveNumber("Line number") }),
    _item_id: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item ID") })
      .positive({ message: errorMessages.positiveNumber("Item ID") }),
    _qty_in: z.coerce
      .number()
      .int()
      .positive({ message: errorMessages.positiveNumber("Quantity in") })
      .nullable(),
    _qty_out: z.coerce
      .number()
      .int()
      .positive({ message: errorMessages.positiveNumber("Quantity out") })
      .nullable(),
    _from_bin: z.coerce
      .number()
      .int({ message: errorMessages.invalid("from bin ID") })
      .positive({ message: errorMessages.positiveNumber("From bin ID") })
      .nullable(),
    _to_bin: z.coerce
      .number()
      .int({ message: errorMessages.invalid("to bin ID") })
      .positive({ message: errorMessages.positiveNumber("To bin ID") })
      .nullable(),
    _item_trx_desc: z
      .string()
      .min(1, { message: errorMessages.required("Item description") })
      .max(200, { message: errorMessages.tooLong("Item description", 200) }),
  }),

  // Refined versions for actual use
  itemTrxHeader: z.lazy(() => schemas.itemTrxHeaderBase),

  itemTrxDetail: z.lazy(() =>
    schemas.itemTrxDetailBase.refine(
      (data) => data._qty_in !== null || data._qty_out !== null,
      {
        message: errorMessages.eitherOr("Quantity in", "Quantity out"),
        path: ["_qty_in"],
      },
    ),
  ),

  ItemTrx: z.object({
    _trx_header: z.lazy(() => schemas.itemTrxHeader),
    _trx_details: z
      .array(z.lazy(() => schemas.itemTrxDetail))
      .min(1, { message: errorMessages.atLeastOne("transaction detail") })
      .max(50, { message: "Cannot exceed 50 transaction lines" }),
  }),
};

// 3. Field mappings now come from appConfig.js via helper function

// 4. Schema factory function
export const getSchema = (entity, operation) => {
  const fullSchema = schemas[entity];
  const { idField } = getFieldMappings(entity);

  if (!fullSchema) {
    throw new Error(`Schema for '${entity}' not found.`);
  }

  if (operation === "create") {
    return fullSchema.omit({ [idField]: true });
  } else if (operation === "update") {
    return fullSchema;
  }

  throw new Error(`Unknown operation: ${operation}`);
};

// 5. validation function
export const getValidationSchema = (
  entity,
  dataDependencies = {},
  operation = "create",
  editedEntityId = null,
) => {
  const baseSchema = getSchema(entity, operation);
  const { idField, nameField, displayName } = getFieldMappings(entity);

  let enhancedSchema = baseSchema;

  // For UPDATE: Validate that ID exists
  if (operation === "update") {
    const mainEntityData = dataDependencies[entity] || [];
    enhancedSchema = enhancedSchema.extend({
      [idField]: baseSchema.shape[idField].refine(
        (id) => mainEntityData.some((item) => item.id === parseInt(id)),
        { message: (val) => errorMessages.notFound(displayName, val) },
      ),
    });
  }

  // For item transactions, add dynamic validation for existing items/bins/markets/trxTypes
  if (entity === "ItemTrx") {
    const existingBins = dataDependencies.bin || [];
    const existingItems = dataDependencies.item || [];
    const existingMarkets = dataDependencies.market || [];
    const existingTrxTypes = dataDependencies.trxType || [];

    // Enhanced header schema with market and trxType validation
    let enhancedHeaderSchema = schemas.itemTrxHeaderBase;

    if (existingMarkets.length > 0) {
      enhancedHeaderSchema = enhancedHeaderSchema.extend({
        _market_id: schemas.itemTrxHeaderBase.shape._market_id.refine(
          (id) => existingMarkets.some((market) => market.id === parseInt(id)),
          { message: "Selected market does not exist" },
        ),
      });
    }

    if (existingTrxTypes.length > 0) {
      enhancedHeaderSchema = enhancedHeaderSchema.extend({
        _trx_type_id: schemas.itemTrxHeaderBase.shape._trx_type_id.refine(
          (id) =>
            existingTrxTypes.some((trxType) => trxType.id === parseInt(id)),
          { message: "Selected transaction type does not exist" },
        ),
      });
    }

    // Enhanced detail schema with item and bin validation
    let enhancedDetailSchema = schemas.itemTrxDetailBase;

    if (existingItems.length > 0 || existingBins.length > 0) {
      enhancedDetailSchema = enhancedDetailSchema.extend({
        _item_id: schemas.itemTrxDetailBase.shape._item_id.refine(
          (id) =>
            existingItems.length === 0 ||
            existingItems.some((item) => item.id === parseInt(id)),
          { message: "Selected item does not exist" },
        ),
        _from_bin: schemas.itemTrxDetailBase.shape._from_bin.refine(
          (id) =>
            id === null ||
            existingBins.length === 0 ||
            existingBins.some((bin) => bin.id === parseInt(id)),
          { message: "Selected from bin does not exist" },
        ),
        _to_bin: schemas.itemTrxDetailBase.shape._to_bin.refine(
          (id) =>
            id === null ||
            existingBins.length === 0 ||
            existingBins.some((bin) => bin.id === parseInt(id)),
          { message: "Selected to bin does not exist" },
        ),
      });
    }

    // Add the either/or validation for quantities
    enhancedDetailSchema = enhancedDetailSchema.refine(
      (data) => data._qty_in !== null || data._qty_out !== null,
      {
        message: errorMessages.eitherOr("Quantity in", "Quantity out"),
        path: ["_qty_in"],
      },
    );

    // Combine enhanced schemas
    enhancedSchema = enhancedSchema.extend({
      _trx_header: enhancedHeaderSchema,
      _trx_details: z.array(enhancedDetailSchema).min(1),
    });
  }

  // For other entities with name validation (existing logic)
  if (nameField && entity !== "ItemTrx") {
    const mainEntityData = dataDependencies[entity] || [];
    enhancedSchema = enhancedSchema.extend({
      [nameField]: baseSchema.shape[nameField]
        .refine((name) => name && name.trim().length >= 2, {
          message: errorMessages.tooShort(displayName + " name", 2),
        })
        .refine(
          (name) => {
            const normalizedName = name.toLowerCase().trim();

            if (operation === "create") {
              return !mainEntityData.some(
                (entity) => entity.name.toLowerCase().trim() === normalizedName,
              );
            } else if (operation === "update") {
              return !mainEntityData.some(
                (entity) =>
                  entity.name.toLowerCase().trim() === normalizedName &&
                  entity.id !== parseInt(editedEntityId),
              );
            }
            return true;
          },
          { message: errorMessages.duplicate(displayName.toLowerCase()) },
        ),
    });
  }

  return enhancedSchema;
};
