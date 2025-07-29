import { z } from "zod";
import entityClientConfig from "./client/entityClientConfig.js";

// 1. App context schema
export const appContextSchema = z.object({
  _usr_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _usr_uuid" }),
  _org_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _org_uuid" }),
});

const errorMessages = {
  invalid: (field) => `Invalid ${field}.`,
  empty: (field) => `${field} cannot be empty.`,
  tooShort: (field, min) => `${field} must be at least ${min} characters long.`,
  tooLong: (field, max) => `${field} cannot exceed ${max} characters.`,
  duplicate: (field) =>
    `An ${field.toLowerCase()} with this name already exists. Please choose a different name.`,
  notFound: (entity) => `${entity} does not exist.`,
  required: (field) => `${field} is required.`,
  positiveNumber: (field) => `${field} must be a positive number.`,
  invalidDate: () => "Please enter a valid date.",
  atLeastOne: (field) => `At least one ${field} is required.`,
  eitherOr: (field1, field2) =>
    `Either ${field1} or ${field2} must be specified.`,
};

// 2. Define complete schemas with ALL fields (for UPDATE operations)
const schemas = {
  item: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item id") }),
    itemClassId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item class id") }),
    nameField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item name", 2) })
      .max(100, { message: errorMessages.tooLong("Item name", 100) }),
    descField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item description", 2) }),
  }),

  location: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("location id") }),
    nameField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Location name", 2) })
      .max(50, { message: errorMessages.tooLong("Location name", 50) }),
    descField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Location description", 2) }),
  }),

  bin: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("bin id") }),
    nameField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Bin name", 2) })
      .max(50, { message: errorMessages.tooLong("Bin name", 50) }),
    descField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Bin description", 2) }),
    locationId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("location id") }),
  }),

  itemClass: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item class id") }),
    nameField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item class name", 2) })
      .max(50, { message: errorMessages.tooLong("Item class name", 50) }),
    descField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Item class description", 2) }),
  }),

  marketType: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market type id") }),
    nameField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Market type name", 2) })
      .max(50, { message: errorMessages.tooLong("Market type name", 50) }),
    descField: z.string().min(2, {
      message: errorMessages.tooShort("Market type description", 2),
    }),
  }),

  market: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market id") }),
    nameField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Market name", 2) })
      .max(50, { message: errorMessages.tooLong("Market name", 50) }),
    descField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Market description", 2) }),
    urlField: z.string().url({ message: errorMessages.invalid("market URL") }),
    marketTypeId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market type id") }),
  }),

  trxType: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction type id") }),
    nameField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Transaction type name", 2) })
      .max(50, { message: errorMessages.tooLong("Transaction type name", 50) }),
    descField: z.string().min(2, {
      message: errorMessages.tooShort("Transaction type description", 2),
    }),
    directionId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction direction id") }),
  }),

  // Item Transaction schemas - updated to match serverOnlyConfig structure
  itemTrx: z.object({
    itemTrxHeader: z
      .string()
      .min(1, { message: errorMessages.required("Transaction header") }),
    itemTrxDetails: z
      .string()
      .min(1, { message: errorMessages.required("Transaction details") }),
  }),

  itemTrxHeader: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction id") }),
    descField: z
      .string()
      .min(2, { message: errorMessages.tooShort("Transaction description", 2) })
      .max(500, {
        message: errorMessages.tooLong("Transaction description", 500),
      }),
    dateField: z
      .string()
      .min(1, { message: errorMessages.required("Transaction date") })
      .refine((date) => !isNaN(Date.parse(date)), {
        message: errorMessages.invalidDate(),
      }),
    trxTypeId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction type ID") })
      .positive({
        message: errorMessages.positiveNumber("Transaction type ID"),
      }),
    marketId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market ID") })
      .positive({ message: errorMessages.positiveNumber("Market ID") }),
  }),

  itemTrxDetails: z.object({
    itemTrxId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item transaction ID") })
      .positive({
        message: errorMessages.positiveNumber("Item transaction ID"),
      }),
    lineNum: z.coerce
      .number()
      .int()
      .positive({ message: errorMessages.positiveNumber("Line number") }),
    itemId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item ID") })
      .positive({ message: errorMessages.positiveNumber("Item ID") }),
    fromBinId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("from bin ID") })
      .positive({ message: errorMessages.positiveNumber("From bin ID") })
      .nullable(),
    toBinId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("to bin ID") })
      .positive({ message: errorMessages.positiveNumber("To bin ID") })
      .nullable(),
    qtyIn: z.coerce
      .number()
      .int()
      .positive({ message: errorMessages.positiveNumber("Quantity in") })
      .nullable(),
    qtyOut: z.coerce
      .number()
      .int()
      .positive({ message: errorMessages.positiveNumber("Quantity out") })
      .nullable(),
    lineDesc: z
      .string()
      .min(1, { message: errorMessages.required("Item description") })
      .max(200, { message: errorMessages.tooLong("Item description", 200) }),
  }),
};

// Helper for creating standardized error messages

const getBaseType = (fieldSchema) => {
  // Handle ZodEffects (like z.coerce)
  if (fieldSchema._def.typeName === "ZodEffects") {
    return getBaseType(fieldSchema._def.schema);
  }

  // Handle ZodOptional and ZodNullable
  if (fieldSchema._def.typeName === "ZodOptional") {
    return getBaseType(fieldSchema._def.innerType);
  }

  if (fieldSchema._def.typeName === "ZodNullable") {
    return getBaseType(fieldSchema._def.innerType);
  }

  return fieldSchema._def.typeName;
};

//Assertion functions:
const assert = {
  exists: (schema, data, field, displayName) => {
    const enhancedSchema = schema.extend({
      [field]: schema.shape[field].refine(
        (value) => {
          const baseType = getBaseType(schema.shape[field]);

          if (data.length === 0) return false;
          if (baseType === "ZodNumber") {
            return data.some((row) => row.id === parseInt(id));
          }
          if (baseType === "ZodString") {
            const normalizedValue = value.toLowerCase().trim();
            return data.some(
              (row) => row.name.toLowerCase().trim() === normalizedValue,
            );
          }
          return false; // unknown type
        },
        {
          message: errorMessages.notFound(displayName),
        },
      ),
    });

    return enhancedSchema;
  },

  isUnique: (schema, data, field, displayName) => {
    // console.log("schema.shape[field]: ", schema.shape[field]);
    const baseType = getBaseType(schema.shape[field]);

    // console.log("baseType: ", baseType);

    if (!schema.shape[field]) {
      console.log(
        `Field "${field}" not found in schema. Available fields:`,
        Object.keys(schema.shape),
      );
      return schema; // Return original schema if field doesn't exist
    }

    const enhancedSchema = schema.extend({
      [field]: schema.shape[field].refine(
        (value) => {
          if (data.length === 0) return true;

          if (baseType === "ZodNumber") {
            return !data.some((row) => row.id === parseInt(value));
          }

          if (baseType === "ZodString") {
            const normalizedValue = value.toLowerCase().trim();

            return !data.some(
              (row) => row.name.toLowerCase().trim() === normalizedValue,
            ) /*  && entity.id !== parseInt(editedEntityId), */;
          }
          return true; // unknown type
        },
        {
          message: errorMessages.duplicate(displayName),
        },
      ),
    });

    return enhancedSchema;
  },
};

// 4. Schema factory function
export const getBaseSchema = (entity, operation) => {
  const baseSchema = schemas[entity];
  // const { idField } = getFieldMappings(entity);

  if (!baseSchema) {
    throw new Error(`Schema for '${entity}' not found.`);
  }

  if (operation === "create") {
    return baseSchema.omit({ idField: true });
  } else if (operation === "update") {
    return baseSchema;
  }

  throw new Error(`Unknown operation: ${operation}`);
};

// 5. validation function
export const getClientValidationSchema = (
  entity,
  dataDependencies = {},
  operation = "create",
  // editedEntityId = null,
) => {
  const baseSchema = getBaseSchema(entity, operation);
  const mainEntityData = dataDependencies[entity] || [];
  const { displayName } = entityClientConfig(entity);

  console.log(mainEntityData);
  let enhancedSchema = baseSchema;

  // For UPDATE: assert exists
  if (operation === "update") {
    enhancedSchema = assert.exists(
      baseSchema,
      mainEntityData,
      "idField",
      displayName,
    );
  }

  if (operation === "create") {
    enhancedSchema = assert.isUnique(
      baseSchema,
      mainEntityData,
      "nameField",
      displayName,
    );
  }

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
          { message: (val) => errorMessages.depNotFound(val) },
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

    // Assert exists schema with item and bin validation
    let enhancedDetailSchema = schemas.itemTrxDetailsBase;

    if (existingItems.length > 0 || existingBins.length > 0) {
      enhancedDetailSchema = enhancedDetailSchema.extend({
        _item_id: schemas.itemTrxDetailsBase.shape._item_id.refine(
          (id) =>
            existingItems.length === 0 ||
            existingItems.some((item) => item.id === parseInt(id)),
          { message: "Selected item does not exist" },
        ),
        _from_bin: schemas.itemTrxDetailsBase.shape._from_bin.refine(
          (id) =>
            id === null ||
            existingBins.length === 0 ||
            existingBins.some((bin) => bin.id === parseInt(id)),
          { message: "Selected from bin does not exist" },
        ),
        _to_bin: schemas.itemTrxDetailsBase.shape._to_bin.refine(
          (id) =>
            id === null ||
            existingBins.length === 0 ||
            existingBins.some((bin) => bin.id === parseInt(id)),
          { message: "Selected to bin does not exist" },
        ),
      });
    }

    //assert business logic
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

  // // For other entities with name validation (existing logic)
  // if (nameField && entity !== "ItemTrx") {
  //   const mainEntityData = dataDependencies[entity] || [];

  //   enhancedSchema = enhancedSchema.extend({
  //     [nameField]: baseSchema.shape[nameField]
  //       .refine((name) => name && name.trim().length >= 2, {
  //         message: errorMessages.tooShort(displayName + " name", 2),
  //       })

  //       .refine(
  //         (name) => {
  //           const normalizedName = name.toLowerCase().trim();

  //           //assert unique
  //           if (operation === "create") {
  //             return !mainEntityData.some(
  //               (entity) => entity.name.toLowerCase().trim() === normalizedName,
  //             );
  //           } else if (operation === "update") {
  //             //assert ?
  //             return !mainEntityData.some(
  //               (entity) =>
  //                 entity.name.toLowerCase().trim() === normalizedName &&
  //                 entity.id !== parseInt(editedEntityId),
  //             );
  //           }
  //           return true;
  //         },
  //         { message: errorMessages.duplicate(displayName.toLowerCase()) },
  //       ),
  //   });
  // }

  return enhancedSchema;
};
