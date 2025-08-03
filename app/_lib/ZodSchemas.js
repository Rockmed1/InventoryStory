import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";

export const errorMessages = {
  invalid: (field) => `Invalid ${field}.`,
  empty: (field) => `${field} cannot be empty.`,
  tooShort: (field, min) => `${field} must be at least ${min} characters long.`,
  tooLong: (field, max) => `${field} cannot exceed ${max} characters.`,
  duplicate: (field) =>
    `An ${field.toLowerCase()} with this name already exists. Please choose a different name.`,
  notFound: (entity) => `${entity} does not exist.`,
  required: (field) => `${field} is required.`,
  unsafe: (field) => `${field} contains an unsafe protocol.`,
  positiveNumber: (field) => `${field} must be a positive number.`,
  invalidDate: () => "Please enter a valid date.",
  atLeastOne: (field) => `At least one ${field} is required.`,
  eitherOr: (field1, field2) =>
    `Either ${field1} or ${field2} must be specified.`,
  noChange: () => "No changes detected",
};

// XSS Protection Helper Functions

export const sanitizedString = (options = {}) => {
  const {
    min = 1,
    max = 1000,
    allowHtml = false,
    fieldName = "field",
  } = options;

  return z
    .string()
    .min(min, {
      message: errorMessages.tooShort(fieldName, min),
    })
    .max(max, { message: errorMessages.tooLong(fieldName, max) })
    .transform((value) => {
      if (!value) return value;

      const config = allowHtml
        ? {
            ALLOWED_TAGS: [
              "b",
              "i",
              "em",
              "strong",
              "p",
              "br",
              "ul",
              "ol",
              "li",
            ],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true,
          }
        : {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true,
          };

      const sanitized = DOMPurify.sanitize(value.trim(), config);
      return sanitized;
    })
    .refine((value) => value.length >= min, {
      message: `${errorMessages.tooShort(fieldName, min)} -  
      ${errorMessages.unsafe(fieldName)}`,
    });
};

export const sanitizedUrl = (fieldName = "URL") => {
  return z
    .string()
    .url({ message: errorMessages.invalid(fieldName) })
    .transform((value) => {
      if (!value) return value;

      const sanitized = DOMPurify.sanitize(value.trim(), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
      });

      return sanitized;
    })

    .refine(
      (url) => {
        const dangerousProtocols = [
          "javascript:",
          "data:",
          "vbscript:",
          "file:",
        ];
        const lowerUrl = url.toLowerCase();
        return !dangerousProtocols.some((protocol) =>
          lowerUrl.startsWith(protocol),
        );
      },
      {
        message: errorMessages.unsafe(fieldName),
      },
    );
};

// 2. Define complete schemas with ALL fields (for UPDATE operations)
export const schemas = {
  item: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item id") }),
    itemClassId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item class id") }),
    nameField: sanitizedString({
      min: 2,
      max: 100,
      allowHtml: false,
      fieldName: "Item name",
    }),
    descField: sanitizedString({
      min: 2,
      max: 500,
      allowHtml: true,
      fieldName: "Item description",
    }),
  }),

  location: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("location id") }),
    nameField: sanitizedString({
      min: 2,
      max: 50,
      allowHtml: false,
      fieldName: "Location name",
    }),
    descField: sanitizedString({
      min: 2,
      max: 200,
      allowHtml: false,
      fieldName: "Location description",
    }),
  }),

  bin: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("bin id") }),
    nameField: sanitizedString({
      min: 2,
      max: 50,
      allowHtml: false,
      fieldName: "Bin name",
    }),
    descField: sanitizedString({
      min: 2,
      max: 200,
      allowHtml: false,
      fieldName: "Bin description",
    }),
    locationId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("location id") }),
  }),

  itemClass: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("item class id") }),
    nameField: sanitizedString({
      min: 2,
      max: 50,
      allowHtml: false,
      fieldName: "Item class name",
    }),
    descField: sanitizedString({
      min: 2,
      max: 200,
      allowHtml: false,
      fieldName: "Item class description",
    }),
  }),

  marketType: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market type id") }),
    nameField: sanitizedString({
      min: 2,
      max: 50,
      allowHtml: false,
      fieldName: "Market type name",
    }),
    descField: sanitizedString({
      min: 2,
      max: 200,
      allowHtml: false,
      fieldName: "Market type description",
    }),
  }),

  market: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market id") }),
    nameField: sanitizedString({
      min: 2,
      max: 50,
      allowHtml: false,
      fieldName: "Market name",
    }),
    descField: sanitizedString({
      min: 2,
      max: 200,
      allowHtml: false,
      fieldName: "Market description",
    }),
    urlField: sanitizedUrl("Market URL"),
    marketTypeId: z.coerce
      .number()
      .int({ message: errorMessages.invalid("market type id") }),
  }),

  trxType: z.object({
    idField: z.coerce
      .number()
      .int({ message: errorMessages.invalid("transaction type id") }),
    nameField: sanitizedString({
      min: 2,
      max: 50,
      allowHtml: false,
      fieldName: "Transaction type name",
    }),
    descField: sanitizedString({
      min: 2,
      max: 200,
      allowHtml: false,
      fieldName: "Transaction type description",
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
