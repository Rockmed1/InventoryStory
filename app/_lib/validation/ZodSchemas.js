import DOMPurify from "isomorphic-dompurify";
import * as z from "zod";

// Enhanced error messages object

export const errorMessages = {
  required: (field) => `${field} is required`,

  invalid: (field) => `${field} is invalid`,

  unsafe: (field) => `${field} contains an unsafe protocol.`,

  // Uniqueness errors
  duplicate: (field) => `${field} already exists`,
  alreadyExists: (field) => `${field} already exists`,

  notFound: (field) => `${field} not found`,
  doesNotExist: (field) => `Selected ${field} does not exist`,

  noChanges: () => "No changes detected",

  atLeastOne: (field) => `At least one ${field} is required.`,
  eitherOr: (field1, field2) =>
    `Either ${field1} or ${field2} must be specified.`,

  // Field-specific errors
  email: "Please enter a valid email address",
  url: "Please enter a valid URL",
  phone: "Please enter a valid phone number",

  // Length errors
  tooShort: (field, min) => `${field} must be at least ${min} characters`,
  tooLong: (field, max) => `${field} must be no more than ${max} characters`,
  empty: (field) => `${field} cannot be empty.`,

  // Number errors
  tooSmall: (field, min) => `${field} must be at least ${min}`,
  tooBig: (field, max) => `${field} must be no more than ${max}`,
  notPositive: (field) => `${field} must be positive`,
  notInt: (field) => `${field} must be whole number`,

  invalidDate: () => "Please enter a valid date.",
};
// XSS Protection Helper Functions
const sanitizedString = (options = {}) => {
  const {
    min = 1,
    max = 1000,
    allowHtml = false,
    fieldName = "field",
  } = options;

  return z
    .string()
    .min(min, {
      error: errorMessages.tooShort(fieldName, min),
    })
    .max(max, { error: errorMessages.tooLong(fieldName, max) })
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
      error: `${errorMessages.tooShort(fieldName, min)} -  
      ${errorMessages.unsafe(fieldName)}`,
    });
};

const sanitizedUrl = (fieldName = "URL") => {
  return (
    z
      .string()
      .transform((value) => {
        if (!value) return value;

        // Prepend https:// if no protocol is present
        if (!/^(f|ht)tps?:\/\//i.test(value)) {
          value = "https://" + value;
        }

        const sanitized = DOMPurify.sanitize(value.trim(), {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true,
        });

        return sanitized;
      })
      .refine(
        (url) => {
          try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname;
            // Zod's regex for domain names
            const domainRegex =
              /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
            return hostname === "localhost" || domainRegex.test(hostname);
          } catch (e) {
            return false;
          }
        },
        { error: errorMessages.invalid(fieldName) },
      )
      // Keep the dangerous protocol check
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
          error: errorMessages.unsafe(fieldName),
        },
      )
  );
};
// Condensed validation rules matching database schema VARCHAR lengths
export const VALIDATION_RULES = {
  // Positive integers for IDs
  positiveInteger: (fieldName) =>
    z.coerce
      .number()
      .int({ error: errorMessages.notInt(fieldName) })
      .positive({ error: errorMessages.notPositive(fieldName) }),

  // Standard name fields - VARCHAR(50) in DB (locations, bins, item_class, trx_type, trx_direction)
  string50: (fieldName) =>
    sanitizedString({
      min: 2,
      max: 50,
      allowHtml: false,
      fieldName,
    }),

  // Item names - VARCHAR(100) in DB
  string100: (fieldName) =>
    sanitizedString({
      min: 2,
      max: 100,
      allowHtml: false,
      fieldName,
    }),

  // Description fields - TEXT in DB (unlimited, but we set reasonable limit)
  text: (fieldName) =>
    sanitizedString({
      min: 2,
      max: 500,
      allowHtml: false,
      fieldName,
    }),

  // URL fields - VARCHAR(100) in DB
  url: (fieldName) => sanitizedUrl(fieldName),

  date: (fieldName) =>
    z
      .any()
      .transform((value) => {
        if (value instanceof Date) return value; // already a Date
        if (typeof value === "string") return value.trim(); // keep string; trim for safety
        return value;
      })
      .refine(
        (value) => {
          if (value == null || value === "") return false; //reject null, undefined, ""
          const parsed = value instanceof Date ? value : new Date(value);
          return !Number.isNaN(parsed.getTime());
        },
        { message: errorMessages.invalidDate(fieldName) },
      )
      .transform((value) => (value instanceof Date ? value : new Date(value))),

  // Accept "", undefined or null as null, otherwise coerce to number.
  decimal: (fieldName) =>
    z
      .any()
      .transform((value) => (value === "" ? null : value))
      .refine((value) => value !== null && !Number.isNaN(Number(value)), {
        message: errorMessages.invalid(fieldName),
      })
      .transform((value) => Number(value)),
};

export const BUSINESS_RULES = {};
