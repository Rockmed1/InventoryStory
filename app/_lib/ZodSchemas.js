import { z } from "zod";

// 1. Define the base context schema as an independent constant.
const appContextSchema = z.object({
  _usr_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _usr_uuid" }),
  _org_uuid: z.string().uuid({ message: "Unauthorized 🚫. Invalid _org_uuid" }),
});

// 2. Define the base form schema for item-specific fields.
const itemSchema = z.object({
  _item_class_id: z.coerce.number().int({ message: "Invalid item class id." }),
  _item_name: z
    .string()
    .min(2, { message: "Item name cannot be empty." })
    .max(100, {
      message: "Item name too long. Item name can be 100 characters max.",
    }),
  _item_desc: z
    .string({ message: "Invalid item description" })
    .min(2, { message: "Item description cannot be empty." }),
});

// 2b. Create a function to generate item schema with existing items validation
const clientItemSchemaValidation = (existingItems = []) => {
  return itemSchema.extend({
    _item_name: itemSchema.shape._item_name.refine(
      (name) => {
        const normalizedName = name.toLowerCase().trim();
        return !existingItems.some(
          (item) => item.name.toLowerCase().trim() === normalizedName,
        );
      },
      {
        message:
          "An item with this name already exists. Please choose a different name.",
      },
    ),
  });
};

// 3. Create the final, combined schema using .merge()
// const itemFormSchema = appContextSchema.merge(itemSchema);

/**
 * A collection of Zod schemas for application-wide validation.
 */

export const schema = {
  appContextSchema,
  itemSchema,
  // itemFormSchema,
  clientItemSchemaValidation,
};

// export const appContextSchema = z.object({
//   _usr_uuid: z.uuid({ error: "Unauthorized 🚫. Invalid _usr_uuid" }),
//   _org_uuid: z.uuid({ error: "Unauthorized 🚫. Invalid _org_uuid" }),
// });

// export const itemFormSchema = z.object({
//   _item_class_id: z.int({ error: "Invalid item class id." }),
//   _item_name: z.string().max(100, {
//     error: "Item name too long. Item name can be 100 characher max.",
//   }),
//   _item_desc: z.string({ error: "Invalid item description" }),
// });
