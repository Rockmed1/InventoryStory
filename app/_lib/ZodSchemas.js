import { z } from "zod";

// Helper for creating standardized error messages
const errorMessages = {
  invalid: (field) => `Invalid ${field}.`,
  empty: (field) => `${field} cannot be empty.`,
  tooShort: (field, min) => `${field} must be at least ${min} characters long.`,
  tooLong: (field, max) => `${field} cannot exceed ${max} characters.`,
  duplicate: (field) =>
    `An ${field} with this name already exists. Please choose a different name.`,
  notFound: (field, id) => `${field} with ID ${id} does not exist.`,
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
};

// 3. Field mapping for validation
const fieldMappings = {
  item: { idField: "_item_id", nameField: "_item_name", displayName: "Item" },
  location: {
    idField: "_loc_id",
    nameField: "_loc_name",
    displayName: "Location",
  },
  bin: { idField: "_bin_id", nameField: "_bin_name", displayName: "Bin" },
  itemClass: {
    idField: "_item_class_id",
    nameField: "_item_class_name",
    displayName: "Item Class",
  },
  marketType: {
    idField: "_market_type_id",
    nameField: "_market_type_name",
    displayName: "Market Type",
  },
  market: {
    idField: "_market_id",
    nameField: "_market_name",
    displayName: "Market",
  },
  trxType: {
    idField: "_trx_type_id",
    nameField: "_trx_type_name",
    displayName: "Transaction Type",
  },
};

// 4. Schema factory function
export const getSchema = (entityType, operation) => {
  const fullSchema = schemas[entityType];
  const { idField } = fieldMappings[entityType];

  if (!fullSchema) {
    throw new Error(`Schema for '${entityType}' not found.`);
  }

  if (operation === "create") {
    return fullSchema.omit({ [idField]: true });
  } else if (operation === "update") {
    return fullSchema;
  }

  throw new Error(`Unknown operation: ${operation}`);
};

// 5. Enhanced validation function with ID and name validation
export const getClientValidationSchema = (
  entityType,
  existingItems = [],
  operation = "create",
) => {
  const baseSchema = getSchema(entityType, operation);
  const { idField, nameField, displayName } = fieldMappings[entityType];

  let enhancedSchema = baseSchema;

  // For UPDATE: Validate that ID exists
  if (operation === "update") {
    enhancedSchema = enhancedSchema.extend({
      [idField]: baseSchema.shape[idField].refine(
        (id) => existingItems.some((item) => item.id === parseInt(id)),
        { message: (val) => errorMessages.notFound(displayName, val) },
      ),
    });
  }

  // For both CREATE and UPDATE: Validate name uniqueness
  enhancedSchema = enhancedSchema.extend({
    [nameField]: baseSchema.shape[nameField].refine(
      (name, ctx) => {
        const normalizedName = name.toLowerCase().trim();

        if (operation === "create") {
          return !existingItems.some(
            (item) => item.name.toLowerCase().trim() === normalizedName,
          );
        } else if (operation === "update") {
          const currentId = ctx.parent[idField];
          return !existingItems.some(
            (item) =>
              item.name.toLowerCase().trim() === normalizedName &&
              item.id !== parseInt(currentId),
          );
        }
        return true;
      },
      { message: errorMessages.duplicate(displayName.toLowerCase()) },
    ),
  });

  return enhancedSchema;
};

// // 6. Export everythingionl
// export const schema = {
//   appContextSchema,

//   // Base schemas for server-side validation
//   itemSchema: schemas.item.omit({ _item_id: true }),
//   locationSchema: schemas.location.omit({ _loc_id: true }),
//   binSchema: schemas.bin.omit({ _bin_id: true }),
//   itemClassSchema: schemas.itemClass.omit({ _item_class_id: true }),
//   marketTypeSchema: schemas.marketType.omit({ _market_type_id: true }),
//   marketSchema: schemas.market.omit({ _market_id: true }),
//   trxTypeSchema: schemas.trxType.omit({ _trx_type_id: true }),

//   // Factory functions
//   getSchema,
//   getClientValidationSchema,

//   // Utilities
//   fieldMappings,
//   errorMessages,
// };
