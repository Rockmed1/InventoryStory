import {
  getCompositeEntities,
  getCurrentQOH,
  getEntityPattern,
  getFieldDisplayName,
  lookup,
} from "@/app/_utils/helpers";
import DOMPurify from "isomorphic-dompurify";
import * as z from "zod";
import { ENTITY_ASSERT } from "./buildValidationSchema";

// Enhanced error messages object

export const errorMessages = {
  field: {},
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

  entity: {},

  directionRequired: (field, trxTypeName) =>
    `${field} is required for ${trxTypeName} transactions`,
  directionForbidden: (field, trxTypeName) =>
    `${field} is not allowed for ${trxTypeName} transactions`,

  businessRuleCondition: ({ condition, entity, trxTypeName }) => {
    const { field, operator, value, compareToField } = condition;

    const compareValue = compareToField
      ? getFieldDisplayName({ entity, field: compareToField })
      : value;

    const operatorName = getOperatorName(operator);
    const fieldName = getFieldDisplayName({ entity, field });
    return `${fieldName} must be ${operatorName} ${compareValue} for ${trxTypeName} transactions.`;
  },

  missingValidationRequirement: (entity, req = "") =>
    `🛑 ${entity} is missing necessary validation requirement "${req}"`,

  numberOfLinesMismatch: (declaredLines, actualLines) =>
    `Number of lines mismatch: declared ${declaredLines}, actual ${actualLines}`,
  compositEntityNotAllowed: (entity) =>
    `Entity ${entity} cannot be a composit entity and a sub-entity.`,
  atomicEntityCompositRuleNotAllowed: (entity) =>
    `Atomic entity ${entity} cannot have a compositBased business rule.`,
  businessValidationBaseFnUndefined: (entity, base) =>
    `Business validation base funciton "${base}" for entity "${entity}" is not defined.`,
  businessValidationBaseUndefined: (entity) =>
    `Business validation base for entity "${entity}" is not defined.`,
  insufficientQOH: (required, available) =>
    `Insufficient quantity. Required: ${required}, Available: ${available}`,
  sameBinTransfer: () =>
    "From Bin and To Bin cannot be the same for transfer transactions",
  invalidDirection: (direction) =>
    `Invalid transaction direction: ${direction}`,
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
export const FIELD_VALIDATION_RULES = {
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

export const BUSINESS_VALIDATION_BASE = {
  // Composit validation: for composit entity compositeWrapper
  compositeBased: ({
    entity,
    schema,
    baseDefinition,
    context, //   { dataDependencies,universalDataService},
  }) => {
    // console.log("🐛 compositeBased called with:", {
    //   entity,
    //   schema,
    //   context, //  { dataDependencies, universalDataService }
    //   baseDefinition,
    // });

    let enhancedSchema = schema;
    // Validation here
    // loop through the composit.validation array element and execute the validation function and pass the ctx.addIssue

    baseDefinition.validations.forEach((rule) => {
      const applyEntityValidationRule = ENTITY_ASSERT[rule];

      if (!applyEntityValidationRule) {
        enhancedSchema = enhancedSchema.superRefine(async (data, ctx) => {
          ctx.addIssue({
            code: "custom",
            path: ["root"],
            message: errorMessages.missingValidationRequirement(
              entity,
              "entity validation rule",
            ),
          });
        });
        return;
      }

      // console.log("applyEntityValidationRule: ", applyEntityValidationRule);
      enhancedSchema = applyEntityValidationRule({
        entity,
        schema: enhancedSchema,
        context, //   { dataDependencies,universalDataService},
      });
    });

    return enhancedSchema;
  },

  // Direction-based validation processor:
  directionBased: ({ schema, baseDefinition, entity, context }) => {
    // console.log("🐛 directionBased called with:", {
    //   entity,
    //   schema,
    //   baseDefinition,
    //   context, //  { dataDependencies, universalDataService }
    // });

    const { dataDependencies, universalDataService } = context;

    if (!baseDefinition) {
      // console.log("❌  !baseDefinition");
      return enhancedSchema.superRefine(async (data, ctx) => {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.businessValidationBaseUndefined(entity),
        });
      });
    }

    if (!dataDependencies) {
      // console.log("❌  !dataDependencies");
      return enhancedSchema.superRefine(async (data, ctx) => {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            "data dependencies",
          ),
        });
      });
    }

    if (!universalDataService) {
      // console.log("❌  !universalDataService");

      return enhancedSchema.superRefine(async (data, ctx) => {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            "universalDataService",
          ),
        });
      });
    }

    const { directionSource, rules } = baseDefinition;

    if (!directionSource) {
      // console.log("❌  !directionSource");

      return enhancedSchema.superRefine(async (data, ctx) => {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            "direction source information",
          ),
        });
      });
    }

    const {
      directionSourceEntity,
      directionSourceField,
      lookupEntity,
      lookupField,
      targetField,
    } = directionSource;
    if (
      !directionSourceEntity ||
      !directionSourceField ||
      !lookupEntity ||
      !lookupField ||
      !targetField
    ) {
      // console.log(
      //   "❌ !directionSourceEntity || !directionSourceField ||!lookupEntity || !lookupField || !targetField",
      // );

      return enhancedSchema.superRefine(async (data, ctx) => {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            "direction source extraction information",
          ),
        });
      });
    }

    if (!rules) {
      // console.log("❌  !rules");

      return enhancedSchema.superRefine(async (data, ctx) => {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            "business transaction direction validation rules",
          ),
        });
      });
    }
    // console.log("🆕 directionBased schema build start...", {
    //   entity,
    //   data: dataDependencies[lookupEntity],
    //   directionSourceEntity,
    //   directionSourceField,
    //   lookupEntity,
    //   lookupField,
    //   targetField,
    //   rules,
    //   isCompositSubentity,
    //   trxTypeName,
    //   directionId,
    // });

    let enhancedSchema = schema;

    enhancedSchema = enhancedSchema.superRefine(async (data, ctx) => {
      // console.log("🚀 SUPERREFINE STARTED");
      // console.log("🚀 data structure:", data);
      // console.log(
      //   "🚀 data.itemTrxHeader?.trxTypeId:",
      //   data.itemTrxHeader?.trxTypeId,
      // );

      const isCompositSubentity = ["header", "line"].includes(
        getEntityPattern(entity),
      );

      // console.log("🚀 About to evaluate directionSourceFieldValue...");
      const directionSourceFieldValue = isCompositSubentity
        ? data?.[directionSourceEntity]?.[directionSourceField]
        : data?.directionSourceField;

      if (!directionSourceFieldValue) {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            "DataDependencies",
          ),
        });
        return;
      }

      //look up the directionId and trxTypeName
      const { nameField: trxTypeName, [targetField]: directionId } = lookup({
        data: dataDependencies[lookupEntity],
        lookupField,
        findValue: directionSourceFieldValue,
        // targetField, //when this is not provided the lookup fn returns the whole row
      });

      const rule = rules[directionId];
      // const rule = null;

      if (!rule) {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            `businessRule.directionBased.rules: "${directionId}"`,
          ),
        });
        return;
      }

      //!-->
      //🔁 Note: Use for...of loop instead of .forEach() — .forEach() cannot await async functions.
      for (const [validationRule, ruleDefinition] of Object.entries(rule)) {
        if (validationRule === "name") continue;

        const validator = ENTITY_VALIDATION_RULES[validationRule];

        if (validator) {
          await validator({
            entity,
            trxTypeName,
            ruleDefinition,
            data,
            context,
            ctx,
          });
        }
      }
    });

    return enhancedSchema;
  },

  // Status-based validation processor
  statusBased: ({ schema, rules, context }) => {
    return;
  },

  // Value-based validation processor
  valueBased: ({ schema, rules, context }) => {
    return;
  },

  // Role-based validation processor
  roleBased: ({ schema, rules, context }) => {
    return;
  },

  // Temporal-based validation processor
  temporalBased: ({ schema, rules, context }) => {
    return;
  },

  // Relationship-based validation processor
  relationshipBased: ({ schema, rules, context }) => {
    return;
  },
};

export const ENTITY_VALIDATION_RULES = {
  // Required field validation
  required: async ({
    entity,
    trxTypeName,
    ruleDefinition,
    data,
    context,
    ctx,
  }) => {
    // console.log("🐛 required called with:", {
    //   entity,
    //   trxTypeName,
    //   ruleDefinition,
    //   data,
    //   context,
    //   ctx, //  { dataDependencies, universalDataService }
    // });

    const isCompositSubentity = ["header", "line"].includes(
      getEntityPattern(entity),
    );
    const dataToValidate = isCompositSubentity ? data?.[entity] : data;

    if (!dataToValidate) return;

    const validate = (row, index) => {
      ruleDefinition.forEach((field) => {
        const fieldErrorPath =
          index != null ? [entity, index, field] : [entity, field];

        if (row[field] == null || row[field] === "") {
          ctx.addIssue({
            code: "custom",
            path: fieldErrorPath,
            message: errorMessages.directionRequired(
              getFieldDisplayName({ entity, field }),
              trxTypeName,
            ),
          });
        }
      });
    };

    if (Array.isArray(dataToValidate)) {
      dataToValidate.forEach((record, recordIndex) => {
        validate(record, recordIndex);
      });
    } else {
      validate(dataToValidate);
    }
  },

  // Forbidden field validation
  forbidden: async ({
    entity,
    trxTypeName,
    ruleDefinition,
    data,
    context,
    ctx,
  }) => {
    const isCompositSubentity = ["header", "line"].includes(
      getEntityPattern(entity),
    );
    const dataToValidate = isCompositSubentity ? data?.[entity] : data;

    if (!dataToValidate) return;

    const validate = (row, index) => {
      ruleDefinition.forEach((field) => {
        const fieldErrorPath =
          index != null ? [entity, index, field] : [entity, field];
        if (
          row[field] &&
          row[field] !== 0 &&
          row[field] !== "" &&
          row[field] !== null
        ) {
          ctx.addIssue({
            code: "custom",
            message: errorMessages.directionForbidden(
              getFieldDisplayName({ entity, field }),
              trxTypeName,
            ),
            path: fieldErrorPath,
          });
        }
      });
    };

    if (Array.isArray(dataToValidate)) {
      dataToValidate.forEach((record, recordIndex) => {
        validate(record, recordIndex);
      });
    } else {
      validate(dataToValidate);
    }
  },

  // Conditional validation (no exists operator)
  conditions: async ({
    entity,
    trxTypeName,
    ruleDefinition,
    data,
    context,
    ctx,
  }) => {
    const isCompositSubentity = ["header", "line"].includes(
      getEntityPattern(entity),
    );
    const dataToValidate = isCompositSubentity ? data?.[entity] : data;

    if (!dataToValidate) return;
    // Helper functions for business rule evaluation
    const evaluateCondition = (data, condition) => {
      const { field, operator, value, compareToField } = condition;
      const fieldValue = data[field];
      const compareValue = compareToField ? data[compareToField] : value;

      switch (operator) {
        case ">":
          return fieldValue > compareValue;
        case "<":
          return fieldValue < compareValue;
        case ">=":
          return fieldValue >= compareValue;
        case "<=":
          return fieldValue <= compareValue;
        case "==":
          return fieldValue == compareValue;
        case "!=":
          return fieldValue != compareValue;
        default:
          return true;
      }
    };

    const validate = (data, index) => {
      ruleDefinition.forEach((condition) => {
        if (!evaluateCondition(data, condition)) {
          // console.log("evaluateCondition: ", {
          //   condition,
          //   data,
          //   evaluation: evaluateCondition(data, condition),
          //   field: condition.field,
          //   compareToField: condition.compareToField,
          // });
          const fieldErrorPath =
            index != null
              ? [entity, index, condition.field]
              : [entity, condition.field];

          const compareToFieldErrorPath =
            index != null
              ? [entity, index, condition.compareToField]
              : [entity, condition.compareToField];

          const errorMessage =
            condition.message ||
            errorMessages.businessRuleCondition({
              condition,
              entity,
              trxTypeName,
            });

          // Add error to the main field
          ctx.addIssue({
            code: "custom",
            message: errorMessage,
            path: fieldErrorPath,
          });

          // Also add error to the compare field if it exists
          if (condition.compareToField) {
            ctx.addIssue({
              code: "custom",
              message: errorMessage,
              path: compareToFieldErrorPath,
            });
          }
        }
      });
    };

    if (Array.isArray(dataToValidate)) {
      dataToValidate.forEach((row, rowIndex) => {
        validate(row, rowIndex);
      });
    } else {
      validate(dataToValidate);
    }
  },

  // Custom business validations
  customValidations: async ({
    entity,
    trxTypeName,
    ruleDefinition,
    data,
    context,
    ctx,
  }) => {
    for (const customValidation of ruleDefinition) {
      const validator = ENTITY_VALIDATION_RULES[customValidation];

      if (validator) {
        await validator({
          entity,
          trxTypeName,
          ruleDefinition,
          data,
          context,
          ctx,
        });
      }
    }
  },

  //!-->
  checkSufficientQOH: async ({
    entity,
    trxTypeName,
    ruleDefinition,
    data,
    context,
    ctx,
  }) => {
    const isCompositSubentity = ["header", "line"].includes(
      getEntityPattern(entity),
    );
    const dataToValidate = isCompositSubentity ? data?.[entity] : data;

    // console.log("checkSufficientQoh was called with: ", {
    //   entity,
    //   dataToValidate,
    //   context,
    //   ctx,
    // });

    if (!dataToValidate) return;

    if (Array.isArray(dataToValidate)) {
      for (const [recordIndex, record] of dataToValidate.entries()) {
        if (!record.qtyOut || record.qtyOut <= 0) {
          return; // Let required validation handle this
        }

        //Universal DataService:

        // Get current QOH for the item in the from bin
        const { universalDataService } = context;
        const itemId = record.itemId;
        const fromBinId = record.fromBinId;
        const requiredQty = record.qtyOut;

        if (!itemId || !fromBinId) {
          return; // Let required validation handle missing fields
        }

        const currentQOH = await getCurrentQOH({
          itemId,
          binId: fromBinId,
          universalDataService,
        });

        // console.log(
        //   "currentQOH: ",
        //   currentQOH,
        //   "requiredQty: ",
        //   requiredQty,
        //   "recordIndex: ",
        //   recordIndex,
        // );

        if (currentQOH < requiredQty) {
          ctx.addIssue({
            code: "tooSmall",
            path: [entity, recordIndex, "qtyOut"],
            message: errorMessages.insufficientQOH(requiredQty, currentQOH),
          });
        }
      }
    }
  },
};

function getConditionErrorMessage({ condition, entity, trxTypeName }) {
  const { field, operator, value, compareToField } = condition;
  const compareValue = compareToField
    ? getFieldDisplayName({ entity, field: compareToField })
    : value;

  const operatorName = getOperatorName(operator);
  const fieldName = getFieldDisplayName({ entity, field });

  return `${fieldName} must be ${operatorName} ${compareValue} for ${trxTypeName} transactions`;
}

function getOperatorName(operator) {
  const OPERATORS = {
    ">": "greater than",
    "<": "less than",
    ">=": "greater than or equal",
    "<=": "less than or equal",
    "==": "the same as",
    "!=": "not the same as",
  };

  const VERBAGE = {
    "": "must be",
    "!": "cannot be",
  };
  return OPERATORS[operator];
}

function evaluateTemporalCondition(data, condition) {
  const { field, operator } = condition;
  const fieldValue = data[field];

  switch (operator) {
    case "isWeekend":
      return fieldValue && new Date(fieldValue).getDay() % 6 === 0;
    case "isHoliday":
      // Implementation would check against holiday calendar
      return false; // Placeholder
    case "isClosed":
      // Implementation would check if period is closed
      return false; // Placeholder
    case "isPastDeadline":
      // Implementation would check against deadline
      return false; // Placeholder
    case "isFutureDate":
      return fieldValue && new Date(fieldValue) > new Date();
    default:
      return false;
  }
}

function getDirectionName(direction) {
  const directionMap = {
    1: "incoming",
    2: "outgoing",
    3: "transfer",
  };
  return directionMap[direction] || "unknown";
}

// Helper funciton to confirm composit structure integrity
export function confirmCompositStructure(entity, data, ctx) {
  // console.log("🐛 confirmCompositStructure called with:", {
  //   entity,
  //   data,
  //   ctx,
  // });

  const { header, line } = getCompositeEntities(entity);
  const headerData = data[header];
  const lineData = data[line];

  if (!header || !line || !headerData || !lineData) {
    ctx.addIssue({
      code: "custom",
      path: ["root"],
      message: errorMessages.missingValidationRequirement(
        entity,
        "composit entities/data",
      ),
    });
    return { composite: false };
  }
  return { composite: true, header, line, headerData, lineData };
}

//TODO: complete this ....
export function confirmDirectionFnRequirements(baseDefinition, context, ctx) {
  const { dataDependencies, universalDataService } = context;

  if (!baseDefinition) {
    ctx.addIssue({
      code: "custom",
      path: ["root"],
      message: errorMessages.businessValidationBaseUndefined(entity),
    });
    return;
  }

  if (!dataDependencies) {
    ctx.addIssue({
      code: "custom",
      path: ["root"],
      message: errorMessages.missingValidationRequirement(
        entity,
        "data dependencies",
      ),
    });
    return;
  }

  if (!universalDataService) {
    ctx.addIssue({
      code: "custom",
      path: ["root"],
      message: errorMessages.missingValidationRequirement(
        entity,
        "universalDataService",
      ),
    });
    return;
  }

  const { directionSource, rules } = baseDefinition;
  if (!directionSource) {
    ctx.addIssue({
      code: "custom",
      path: ["root"],
      message: errorMessages.missingValidationRequirement(
        entity,
        "direction source information",
      ),
    });
    return;
  }

  const {
    directionSourceEntity,
    directionSourceField,
    lookupEntity,
    lookupField,
    targetField,
  } = directionSource;
  if (
    !directionSourceEntity ||
    !directionSourceField ||
    !lookupEntity ||
    !lookupField ||
    !targetField
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["root"],
      message: errorMessages.missingValidationRequirement(
        entity,
        "direction source extraction information",
      ),
    });
    return;
  }

  if (!rules) {
    ctx.addIssue({
      code: "custom",
      path: ["root"],
      message: errorMessages.missingValidationRequirement(
        entity,
        "business transaction direction validation rules",
      ),
    });
    return;
  }

  return {
    dataDependencies,
    universalDataService,
    directionSource,
    rules,
    directionSourceEntity,
    directionSourceField,
    lookupEntity,
    lookupField,
    targetField,
  };
}
