// Suggested improvements for validation architecture

// 1. Enhanced entityClientConfig.js structure
const ENHANCED_ENTITY_CONFIG = {
  itemTrxDetails: {
    display: { name: "Item Transaction Details", label: "Trx Details" },
    pattern: ["line"],
    fields: {
      // ... existing fields
    },
    // NEW: Business rules configuration
    businessRules: {
      // Cross-field validation rules
      crossField: [
        {
          name: "qtyEitherOr",
          fields: ["qtyIn", "qtyOut"],
          rule: "eitherOr", // predefined rule type
          message: "Either Quantity In or Quantity Out must be specified",
          path: ["qtyIn"], // which field to attach error to
        },
      ],
      // Custom validation functions
      custom: [
        {
          name: "binTransferLogic",
          validator: (data) => {
            // Custom business logic
            if (data.qtyOut > 0 && !data.fromBin) {
              return {
                valid: false,
                message: "From Bin required when Qty Out > 0",
                path: ["fromBin"],
              };
            }
            if (data.qtyIn > 0 && !data.toBin) {
              return {
                valid: false,
                message: "To Bin required when Qty In > 0",
                path: ["toBin"],
              };
            }
            return { valid: true };
          },
        },
      ],
    },
  },

  itemTrx: {
    // ... existing config
    businessRules: {
      composite: [
        {
          name: "headerLineConsistency",
          validator: (data) => {
            const actualLines = data.itemTrxDetails?.length || 0;
            const declaredLines = parseInt(data.itemTrxHeader?.numOfLines) || 0;
            if (actualLines !== declaredLines) {
              return {
                valid: false,
                message: `Number of lines mismatch: declared ${declaredLines}, actual ${actualLines}`,
                path: ["itemTrxHeader", "numOfLines"],
              };
            }
            return { valid: true };
          },
        },
      ],
    },
  },
};

// 2. Enhanced validation rule types in ZodSchemas.js
export const BUSINESS_RULE_TYPES = {
  eitherOr: (fields, message, path) => (data) => {
    const hasValue = fields.some(
      (field) => data[field] != null && data[field] !== "" && data[field] !== 0,
    );
    if (!hasValue) {
      return { valid: false, message, path };
    }
    return { valid: true };
  },

  requiredIf:
    (targetField, conditionField, conditionValue, message, path) => (data) => {
      if (
        data[conditionField] === conditionValue &&
        (!data[targetField] || data[targetField] === "")
      ) {
        return { valid: false, message, path };
      }
      return { valid: true };
    },

  mutuallyExclusive: (fields, message, path) => (data) => {
    const filledFields = fields.filter(
      (field) => data[field] != null && data[field] !== "" && data[field] !== 0,
    );
    if (filledFields.length > 1) {
      return { valid: false, message, path };
    }
    return { valid: true };
  },
};

// 3. Enhanced getValidationSchema.js structure
export const getValidationSchemaEnhanced = ({
  entity,
  dataDependencies = {},
  operation = "create",
  editedEntityId = null,
}) => {
  const { wrapper, ...entityValidationObj } = getEntityValidationObj(entity);
  const schemasObj = {};

  Object.entries(entityValidationObj).forEach(([key, entityName]) => {
    let enhancedSchema = generateBaseSchema(entityName, operation);

    // Apply standard validations (foreign keys, uniqueness, etc.)
    enhancedSchema = applyStandardValidations(
      enhancedSchema,
      entityName,
      dataDependencies,
      editedEntityId,
    );

    // NEW: Apply business rules
    enhancedSchema = applyBusinessRules(enhancedSchema, entityName);

    schemasObj[key] = enhancedSchema;
  });

  // Handle composite entities
  if (!wrapper) return schemasObj["main"];

  return createCompositeSchema(entityValidationObj, schemasObj);
};

// 4. New business rules application function
function applyBusinessRules(schema, entity) {
  const config = entityClientConfig(entity);
  const businessRules = config?.businessRules;

  if (!businessRules) return schema;

  let enhancedSchema = schema;

  // Apply cross-field rules
  if (businessRules.crossField) {
    businessRules.crossField.forEach((rule) => {
      const ruleValidator = BUSINESS_RULE_TYPES[rule.rule];
      if (ruleValidator) {
        enhancedSchema = enhancedSchema.refine(
          ruleValidator(rule.fields, rule.message, rule.path),
          {
            message: rule.message,
            path: rule.path,
          },
        );
      }
    });
  }

  // Apply custom rules
  if (businessRules.custom) {
    businessRules.custom.forEach((rule) => {
      enhancedSchema = enhancedSchema.refine(
        (data) => {
          const result = rule.validator(data);
          return result.valid;
        },
        {
          message: (data) => {
            const result = rule.validator(data);
            return result.message;
          },
          path: (data) => {
            const result = rule.validator(data);
            return result.path;
          },
        },
      );
    });
  }

  return enhancedSchema;
}

// 5. Improved form field mapping for nested structures
const FORM_FIELD_MAPPING = {
  itemTrx: {
    // Map form field names to schema field names
    "itemTrxHeader.trxTypeId": "trxTypeId",
    "itemTrxHeader.dateField": "trxDate",
    "itemTrxHeader.marketId": "marketId",
    "itemTrxHeader.descField": "descField",
    "itemTrxHeader.numOfLines": "numOfLines",
    "itemTrxDetails.*.itemId": "itemId",
    "itemTrxDetails.*.fromBin": "fromBin",
    "itemTrxDetails.*.toBin": "toBin",
    "itemTrxDetails.*.qtyIn": "qtyIn",
    "itemTrxDetails.*.qtyOut": "qtyOut",
    "itemTrxDetails.*.descField": "descField",
  },
};
