import { z } from "zod";

// Helper for creating standardized error messages
const errorMessages = {
  invalid: (field) => `Invalid ${field}.`,
  empty: (field) => `${field} cannot be empty.`,
  tooShort: (field, min) => `${field} must be at least ${min} characters long.`,
  tooLong: (field, max) => `${field} cannot exceed ${max} characters.`,
  duplicate: (field) =>
    `An ${field} with this name already exists. Please choose a different name.`,
};

// 1. Define the base context schema as an independent constant.
const appContextSchema = z.object({
  _usr_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _usr_uuid" }),
  _org_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _org_uuid" }),
});

// 2. Define the base form schema for base-specific fields.
const itemSchema = z.object({
  _item_class_id: z.coerce
    .number()
    .int({ message: errorMessages.invalid("item class id") }),
  _item_name: z
    .string({ message: errorMessages.invalid("item name") })
    .min(2, { message: errorMessages.tooShort("Item name", 2) })
    .max(100, { message: errorMessages.tooLong("Item name", 100) }),
  _item_desc: z
    .string({ message: errorMessages.invalid("item description") })
    .min(2, { message: errorMessages.tooShort("Item description", 2) }),
});

const locationSchema = z.object({
  _loc_name: z
    .string({ message: errorMessages.invalid("location name") })
    .min(2, { message: errorMessages.tooShort("Location name", 2) })
    .max(50, { message: errorMessages.tooLong("Location name", 50) }),
  _loc_desc: z
    .string({ message: errorMessages.invalid("location description") })
    .min(2, { message: errorMessages.tooShort("Location description", 2) }),
});

const binSchema = z.object({
  _bin_name: z
    .string({ message: errorMessages.invalid("bin name") })
    .min(2, { message: errorMessages.tooShort("Bin name", 2) })
    .max(50, { message: errorMessages.tooLong("Bin name", 50) }),
  _bin_desc: z
    .string({ message: errorMessages.invalid("bin description") })
    .min(2, { message: errorMessages.tooShort("Bin description", 2) }),
  _loc_id: z.coerce
    .number()
    .int({ message: errorMessages.invalid("location id") }),
});

const itemClassSchema = z.object({
  _item_class_name: z
    .string({ message: errorMessages.invalid("item class name") })
    .min(2, { message: errorMessages.tooShort("Item class name", 2) })
    .max(50, { message: errorMessages.tooLong("Item class name", 50) }),
  _item_class_desc: z
    .string({ message: errorMessages.invalid("item class description") })
    .min(2, { message: errorMessages.tooShort("Item class description", 2) }),
});

const marketTypeSchema = z.object({
  _market_type_name: z
    .string({ message: errorMessages.invalid("market type name") })
    .min(2, { message: errorMessages.tooShort("Market type name", 2) })
    .max(50, { message: errorMessages.tooLong("Market type name", 50) }),
  _market_type_desc: z
    .string({ message: errorMessages.invalid("market type description") })
    .min(2, { message: errorMessages.tooShort("Market type description", 2) }),
});

const marketSchema = z.object({
  _market_name: z
    .string({ message: errorMessages.invalid("market name") })
    .min(2, { message: errorMessages.tooShort("Market name", 2) })
    .max(50, { message: errorMessages.tooLong("Market name", 50) }),
  _market_desc: z
    .string({ message: errorMessages.invalid("market description") })
    .min(2, { message: errorMessages.tooShort("Market description", 2) }),
  _market_url: z.string().url({ message: errorMessages.invalid("market URL") }),
  _market_type_id: z.coerce
    .number()
    .int({ message: errorMessages.invalid("market type id") }),
});

const trxTypeSchema = z.object({
  _trx_type_name: z
    .string({ message: errorMessages.invalid("transaction type name") })
    .min(2, { message: errorMessages.tooShort("Transaction type name", 2) })
    .max(50, { message: errorMessages.tooLong("Transaction type name", 50) }),
  _trx_type_desc: z
    .string({ message: errorMessages.invalid("transaction type description") })
    .min(2, {
      message: errorMessages.tooShort("Transaction type description", 2),
    }),
  _trx_direction_id: z.coerce
    .number()
    .int({ message: errorMessages.invalid("transaction direction id") }),
});

// 2.b Create a function to generate base update schema
const createUpdateSchema = (schema, id) => schema.omit({ [id]: true });

// 3. Create a function to generate client schema with existing values validation
const createClientSchemaValidation = (schema, existingItems = []) => {
  const schemaMap = {
    items: {
      schema: itemSchema,
      name: "_item_name",
      refine: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
    },
    locations: {
      schema: locationSchema,
      name: "_loc_name",
      refine: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
    },
    bins: {
      schema: binSchema,
      name: "_bin_name",
      refine: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
    },
    itemClasses: {
      schema: itemClassSchema,
      name: "_item_class_name",
      refine: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
    },
    marketTypes: {
      schema: marketTypeSchema,
      name: "_market_type_name",
      refine: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
    },
    markets: {
      schema: marketSchema,
      name: "_market_name",
      refine: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
    },
    trxType: {
      schema: trxTypeSchema,
      name: "_trx_type_name",
      refine: (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
    },
  };

  const selectedSchema = schemaMap[schema];

  if (!selectedSchema) {
    throw new Error(`Schema '${schema}' not found.`);
  }

  // the final validation function
  return selectedSchema.schema.extend({
    [selectedSchema.name]: selectedSchema.schema.shape[
      selectedSchema.name
    ].refine(selectedSchema.refine, {
      message: errorMessages.duplicate(schema),
    }),
  });
};

/**
 * A collection of Zod schemas for application-wide validation.
 */

export const schema = {
  appContextSchema,
  itemSchema,
  locationSchema,
  binSchema,
  itemClassSchema,
  marketTypeSchema,
  marketSchema,
  trxTypeSchema,
  createClientSchemaValidation,
};
