# Validation Architecture Evaluation & Recommendations

## Current State Analysis

### Strengths ✅

1. **Modular Configuration**: Clear separation between field definitions and entity configurations
2. **Dynamic Schema Generation**: Automatic schema creation based on entity config
3. **Foreign Key Validation**: Automatic validation of relationships
4. **Composite Entity Support**: Good handling of header/line structures
5. **Progressive Enhancement**: Works with/without JavaScript

### Current Issues ❌

#### 1. **Hardcoded Business Logic**

- Lines 332-406 in `getValidationSchema.js` contain hardcoded itemTrx validation
- No extensible mechanism for entity-specific business rules
- Violates DRY and makes maintenance difficult

#### 2. **Form Field Mapping Inconsistency**

- Form uses `itemTrxHeader.dateField` but schema expects `trxDate`
- Form uses `itemTrxHeader.descField` but schema field names differ
- No clear mapping between form structure and schema structure

#### 3. **Missing Business Rule Types**

- Only basic either/or validation implemented
- No support for conditional requirements, mutual exclusivity, etc.
- Limited extensibility for complex business logic

#### 4. **Schema Generation Complexity**

- The `getValidationSchema` function is doing too much
- Hard to test individual validation concerns
- Difficult to debug when validation fails

## Recommended Improvements

### 1. **Add Business Rules to Entity Config**

```javascript
// In entityClientConfig.js
itemTrxDetails: {
  // ... existing config
  businessRules: {
    crossField: [
      {
        name: "qtyEitherOr",
        type: "eitherOr",
        fields: ["qtyIn", "qtyOut"],
        message: "Either Quantity In or Quantity Out must be specified",
        path: ["qtyIn"]
      },
      {
        name: "binRequiredForQtyOut",
        type: "requiredIf",
        targetField: "fromBin",
        condition: { field: "qtyOut", operator: ">", value: 0 },
        message: "From Bin required when Qty Out > 0"
      }
    ],
    custom: [
      {
        name: "inventoryLogic",
        validator: (data) => {
          // Custom business logic here
          return { valid: true };
        }
      }
    ]
  }
}
```

### 2. **Refactor getValidationSchema.js**

```javascript
// Break down into smaller, focused functions
export const getValidationSchema = (params) => {
  const baseSchemas = generateBaseSchemas(params);
  const standardValidatedSchemas = applyStandardValidations(
    baseSchemas,
    params,
  );
  const businessValidatedSchemas = applyBusinessRules(
    standardValidatedSchemas,
    params,
  );
  return assembleCompositeSchema(businessValidatedSchemas, params);
};

// Separate business rules application
function applyBusinessRules(schemas, { entity }) {
  return Object.entries(schemas).reduce((acc, [key, schema]) => {
    const entityName = key === "main" ? entity : key;
    acc[key] = enhanceSchemaWithBusinessRules(schema, entityName);
    return acc;
  }, {});
}
```

### 3. **Add Form Field Mapping**

```javascript
// In entityClientConfig.js
itemTrx: {
  // ... existing config
  formMapping: {
    "itemTrxHeader.trxTypeId": "trxTypeId",
    "itemTrxHeader.dateField": "trxDate",
    "itemTrxHeader.marketId": "marketId",
    "itemTrxHeader.descField": "descField",
    "itemTrxHeader.numOfLines": "numOfLines"
  }
}
```

### 4. **Create Business Rule Types Registry**

```javascript
// In ZodSchemas.js
export const BUSINESS_RULE_TYPES = {
  eitherOr: (fields, message, path) => (data) => {
    const hasValue = fields.some(
      (field) => data[field] != null && data[field] !== "" && data[field] !== 0,
    );
    return hasValue ? { valid: true } : { valid: false, message, path };
  },

  requiredIf: (config) => (data) => {
    const { targetField, condition, message } = config;
    const conditionMet = evaluateCondition(
      data[condition.field],
      condition.operator,
      condition.value,
    );

    if (conditionMet && (!data[targetField] || data[targetField] === "")) {
      return { valid: false, message, path: [targetField] };
    }
    return { valid: true };
  },

  mutuallyExclusive: (fields, message, path) => (data) => {
    const filledFields = fields.filter(
      (field) => data[field] != null && data[field] !== "" && data[field] !== 0,
    );
    return filledFields.length <= 1
      ? { valid: true }
      : { valid: false, message, path };
  },
};
```

### 5. **Improve Error Handling & Debugging**

```javascript
// Add validation context for better debugging
export const getValidationSchema = (params) => {
  try {
    const context = {
      entity: params.entity,
      operation: params.operation,
      timestamp: new Date().toISOString(),
      dependencies: Object.keys(params.dataDependencies || {}),
    };

    const schema = buildSchema(params);

    // Add debug info to schema
    schema._validationContext = context;

    return schema;
  } catch (error) {
    console.error("Schema generation failed:", {
      entity: params.entity,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
```

## Implementation Priority

### Phase 1 (High Priority)

1. ✅ Extract hardcoded itemTrx validation to config
2. ✅ Add businessRules property to entityClientConfig
3. ✅ Create applyBusinessRules function

### Phase 2 (Medium Priority)

1. ✅ Add form field mapping
2. ✅ Create business rule types registry
3. ✅ Refactor getValidationSchema into smaller functions

### Phase 3 (Low Priority)

1. ✅ Add validation debugging/logging
2. ✅ Create validation testing utilities
3. ✅ Performance optimization

## Benefits of This Approach

1. **Maintainability**: Business rules defined in config, not code
2. **Extensibility**: Easy to add new rule types and entities
3. **Testability**: Smaller, focused functions are easier to test
4. **Debugging**: Better error messages and validation context
5. **Consistency**: Standardized approach across all entities
6. **Performance**: Only apply rules that are configured

## Migration Strategy

1. Keep existing hardcoded validation as fallback
2. Add businessRules to config gradually
3. Test new approach alongside existing
4. Remove hardcoded validation once confident
5. Update documentation and examples
