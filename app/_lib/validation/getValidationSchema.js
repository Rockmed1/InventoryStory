import {
  BUSINESS_VALIDATION_BASE,
  confirmCompositStructure,
  errorMessages,
  FIELD_VALIDATION_RULES,
} from "@/app/_lib/validation/ZodSchemas";
import {
  getCompositeEntities,
  getEntityBusinessValidationBases,
  getEntityChangeDetectionFields,
  getEntityDisplayName,
  getEntityFieldsValidation,
  getEntityPatternType,
  getEntityValidationObj,
  getFieldDisplayName,
  getFieldType,
  getFkField,
  getForeignKeys,
  getNotRequiredFields,
  getUniqueFields,
} from "@/app/_utils/helpers";
import { z } from "zod";

export const appContextSchema = z.object({
  _usr_uuid: z.uuid({ error: errorMessages.invalid("usr_uuid") }),
  _org_uuid: z.uuid({ error: errorMessages.invalid("org_uuid") }),
});

//generate the base schema for field types only
export function generateBaseSchema(entity, operation) {
  const entityFieldsValidation = getEntityFieldsValidation(entity);

  if (!entityFieldsValidation) {
    throw new Error(`Validation for '${entity}' not found.`);
  }
  const zodValidationObject = Object.entries(entityFieldsValidation).reduce(
    (acc, [field, fieldValidation]) => {
      const fieldDisplayName = getFieldDisplayName({ entity, field });

      acc[field] =
        FIELD_VALIDATION_RULES[fieldValidation.type](fieldDisplayName);

      return acc;
    },
    {},
  );

  const baseSchema = z.object(zodValidationObject);

  if (!baseSchema) {
    throw new Error(`Schema for '${entity}' not found.`);
  }

  if (operation === "create") {
    return baseSchema.omit({ idField: true });
  } else if (operation === "update") {
    return baseSchema;
  }

  throw new Error(`Unknown operation: ${operation}`);
}

//Assertion functions:
const FIELD_ASSERT = {
  exists: ({ schema, data, field, entity }) => {
    // console.log("🐛 exists called with:", {
    //   field,
    //   entity,
    //   data,
    //   schema,
    // });

    if (!schema.shape[field]) {
      console.log(
        `Field "${field}" not found in schema. Available fields:`,
        Object.keys(schema.shape),
      );
      return schema; // Return original schema if field doesn't exist
    }

    // const enhancedSchema = schema;
    const fieldDisplayName = getFieldDisplayName({ field, entity });

    const enhancedSchema = schema.extend({
      [field]: schema.shape[field].refine(
        (value) => {
          // console.log(
          //   "🐛 Refine function called with value:",
          //   value,
          //   typeof value,
          // );
          const fieldType = getFieldType(field);
          const lookupField = getFkField(field) || field;

          if (!value) return true; // Don't validate null or undefined values
          if (data.length === 0) return false; // If no data, it can't exist

          // console.log("Assert exists - data: ", data);
          // console.log("Assert exists - field: ", field);
          // console.log("Assert exists - displayName: ", displayName);
          // console.log("Assert exists - lookupField: ", lookupField);

          if (fieldType === "number") {
            return data.some((row) => row[lookupField] === value);
          }

          if (fieldType === "string") {
            const normalizedValue = value.toLowerCase().trim();
            return data.some(
              (row) =>
                row[lookupField]?.toLowerCase().trim() === normalizedValue,
            );
          }
          return true; //unknown type
        },
        {
          message: errorMessages.notFound(fieldDisplayName),
        },
      ),
    });

    return enhancedSchema;
  },

  isForeignKeys: ({ entity, schema, dataDependencies }) => {
    // console.log("🐛 isForeignKeys called with:", {
    //   entity,
    //   dataDependencies,
    //   schema,
    // });
    const foreignKeys = getForeignKeys(entity);

    // console.log(`foreignKeys for entity "${entity}": `, foreignKeys);

    let enhancedSchema = schema;

    if (foreignKeys) {
      for (const [fkField, remoteConfig] of Object.entries(foreignKeys || {})) {
        const remoteEntity = remoteConfig.entity;

        // console.log("foreignKeys fkField: ", fkField);
        // console.log("foreignKeys remoteEntity: ", remoteEntity);

        // console.log("fk schema: ", schema);

        if (schema.shape[fkField]) {
          const fkEntityData = dataDependencies[remoteEntity] || [];

          // console.log("fk dataDependencies: ", dataDependencies);
          // console.log("fkEntityData: ", fkEntityData);
          // const fkEntityDisplayName = getEntityDisplayName(remoteEntity);

          enhancedSchema = FIELD_ASSERT.exists({
            schema: enhancedSchema,
            data: fkEntityData,
            field: fkField,
            entity,
          });
        }
      }
    }
    return enhancedSchema;
  },

  isUnique: ({ entity, schema, data, editedEntityId = null }) => {
    // console.log("🐛 isUnique called with:", {
    //   entity,
    //   schema,
    //   data,
    //   editedEntityId,
    // });

    // console.log("fieldType: ", fieldType);
    const uniqueFields = getUniqueFields(entity);
    // console.log(
    //   "🐛  uniqueFields: ",
    //   uniqueFields,
    //   "schema.shape.hasOwnProperty(field): ",
    //   schema.shape.hasOwnProperty(uniqueFields[0]),
    // );

    if (!uniqueFields) return schema;

    // console.log(
    //   "isUnique filtered uniqueFileds: ",
    //   uniqueFields.filter((field) => {
    //     return schema.shape.hasOwnProperty(field);
    //   }),
    // );

    let enhancedSchema = schema;

    uniqueFields
      .filter((field) => {
        return schema.shape.hasOwnProperty(field);
      })
      .forEach((field) => {
        const fieldDisplayName = getFieldDisplayName({ entity, field });
        const fieldType = getFieldType(field);

        const lookupData = editedEntityId
          ? data.filter((_) => _.idField !== editedEntityId)
          : data;

        enhancedSchema = schema.extend({
          [field]: schema.shape[field].refine(
            (value) => {
              // console.log(
              //   "☑️ Refine function called with value:",
              //   value,
              //   typeof value,
              // );
              if (!value || lookupData.length === 0) return true;

              // console.log("🐛 editedEntityId:", editedEntityId);
              // console.log("🐛 Filtered lookupData:", lookupData);
              if (fieldType === "number") {
                return !lookupData.some(
                  (row) => row.idField === parseInt(value),
                );
              }

              if (fieldType === "string") {
                // console.log("🐛 About to normalize value:", value);
                const normalizedValue = value.toLowerCase().trim();

                // console.log("🐛 Checking each row:");
                const result = !lookupData.some((row) => {
                  // row.name &&
                  //   row.name.toLowerCase().trim() === normalizedValue,
                  // console.log("🐛 Checking row:", row, "row.nameField:", row.name);
                  // console.log("🐛 Match result:", row.name?.toLowerCase().trim() === normalizedValue);
                  return row[field]?.toLowerCase().trim() === normalizedValue;
                });
                // console.log("🏁  isUnique validation result:", result);
                return result;
              }
              return true; // unknown type
            },
            {
              message: errorMessages.duplicate(fieldDisplayName),
            },
          ),
        });
      });

    return enhancedSchema;
  },

  isChanged: ({ schema, data = null, entity, editedEntityId = null }) => {
    const changeDetectionFields = getEntityChangeDetectionFields(entity);

    // console.log("Zod isChanged changeDetectionFields: ", changeDetectionFields);

    if (!changeDetectionFields || !data || !editedEntityId) return schema; //skip if no config or original data or editedEntityId

    const preEditData = data.find((_) => _.idField === editedEntityId);

    if (!preEditData) return schema; //skip if original record not found

    // console.log("🐛 isChanged called with:", {
    //   editedEntityId,
    //   entity,
    //   // data,
    //   schema,
    //   changeDetectionFields,
    //   preEditData,
    // });

    // const enhancedSchema = schema;

    const enhancedSchema = schema.refine(
      (newData) => {
        // console.log("Zod isChanged preEditData: ", preEditData);
        //check if any field has changed
        return changeDetectionFields.some((field) => {
          // console.log(
          //   `🐛 Zod isChanged ${field}: ${newData[field]}`,
          //   ` 🐛 ${preEditField}: ${preEditData[preEditField]}`,
          //   `🐛 isNotEqual: ${newData[field] !== preEditData[preEditField]}`,
          // );
          return newData[field] !== preEditData[field];
        });
      },
      {
        message: errorMessages.noChanges(),
      },
    );

    return enhancedSchema;
  },

  isNotRequired: ({ schema, entity }) => {
    const notRequiredFields = getNotRequiredFields(entity);

    // console.log("entity: ", entity, "notRequiredFields: ", notRequiredFields);

    let enhancedSchema = schema;

    notRequiredFields.forEach((field) => {
      const originalFieldSchema = schema.shape[field];

      // console.log("isNotRequired originalFieldSchema: ", originalFieldSchema);

      if (!originalFieldSchema) return enhancedSchema;

      const newFieldSchema = z
        .preprocess(
          (val) => {
            if (val === "" || val === null || val === undefined) return null;
            return val;
          },
          originalFieldSchema.nullable(), // now validate with null allowed
        )
        .optional(); // allows field to be omitted

      enhancedSchema = enhancedSchema.extend({
        [field]: newFieldSchema,
      });
    });

    return enhancedSchema;
  },
};

export const ENTITY_ASSERT = {
  // Apply all business rules to a schema
  isBusinessRules: ({ schema, entity, context, editedEntityId }) => {
    // console.log("🐛 isBusinessRules called with:", {
    //   entity,
    //   schema,
    //   context, //  { dataDependencies, universalDataService }
    //   editedEntityId,
    // });

    const entityBusinessValidationBases =
      getEntityBusinessValidationBases(entity);
    // console.log(
    //   "entityBusinessValidationBases: ",
    //   entityBusinessValidationBases,
    // );

    if (!entityBusinessValidationBases) return schema;

    const entityPatternType = getEntityPatternType(entity);

    let enhancedSchema = schema;

    Object.entries(entityBusinessValidationBases).forEach(
      ([base, baseDefinition]) => {
        if ((entityPatternType === "atomic") & (base === "compositeBased")) {
          enhancedSchema = enhancedSchema.superRefine(async (data, ctx) => {
            ctx.addIssue({
              code: "custom",
              path: ["root"],
              message: errorMessages.atomicEntityCompositRuleNotAllowed(entity),
            });
          });
          return;
        }

        const businessValidationBaseFn = BUSINESS_VALIDATION_BASE[base];

        if (!businessValidationBaseFn) {
          enhancedSchema = enhancedSchema.superRefine(async (data, ctx) => {
            ctx.addIssue({
              code: "custom",
              path: ["root"],
              message: errorMessages.businessValidationBaseFnUndefined(
                entity,
                base,
              ),
            });
          });
          return;
        }

        enhancedSchema = businessValidationBaseFn({
          entity,
          schema: enhancedSchema,
          baseDefinition,
          context, //   { dataDependencies,universalDataService},
        });
      },
    );

    return enhancedSchema;
  },

  compositEntitiesBusinessRules: ({
    entity,
    schema,
    context, //   { dataDependencies,universalDataService},
  }) => {
    // console.log("🐛 compositEntitiesBusinessRules called with:", {
    //   entity,
    //   schema,
    //   context, //  { dataDependencies, universalDataService }
    // });

    let enhancedSchema = schema;

    const { header, line } = getCompositeEntities(entity);

    if (!header || !line) {
      enhancedSchema = enhancedSchema.superRefine(async (data, ctx) => {
        ctx.addIssue({
          code: "custom",
          path: ["root"],
          message: errorMessages.missingValidationRequirement(
            entity,
            "composit entities/data",
          ),
        });

        return enhancedSchema;
      });
    }

    for (const subEntity of [header, line]) {
      enhancedSchema = ENTITY_ASSERT.isBusinessRules({
        entity: subEntity,
        schema,
        context,
      });
    }

    return enhancedSchema;
  },

  // Header-line consistency validation
  lineCountConsistency: ({ schema, entity, context }) => {
    const enhancedSchema = schema.superRefine(async (data, ctx) => {
      // console.log("🐛 lineCountConsistency called with:", {
      //   entity,
      //   schema,
      //   context, //  { dataDependencies, universalDataService }
      // });

      //line consitstency has to be for composit entities
      const { composite, header, line, headerData, lineData } =
        confirmCompositStructure(entity, data, ctx);
      // console.log("confirmCompositStructure: ", {
      //   composite,
      //   header,
      //   line,
      //   headerData,
      //   lineData,
      // });

      if (composite) {
        const declaredLines = parseInt(headerData.numOfLines) || 0;
        const actualLines = lineData.length || 0;

        if (declaredLines !== actualLines) {
          ctx.addIssue({
            code: "custom",
            path: [header, "numOfLines"],
            message: errorMessages.numberOfLinesMismatch(
              declaredLines,
              actualLines,
            ),
          });
        }
      }
    });

    return enhancedSchema;
  },
};

// 5. validation function
export const getValidationSchema = ({
  entity,
  dataDependencies = {},
  operation = "create",
  editedEntityId = null,
  universalDataService,
}) => {
  // console.log("🐛 getValidationSchema called with:", {
  //   entity,
  //   dataDependencies,
  //   operation,
  //   editedEntityId,
  //   universalDataService,
  // });

  // isolate the compositWrapper if exists
  const { compositeWrapper, ...entitiesValidationObj } =
    getEntityValidationObj(entity);
  //{main} or {compositWrapper, header, line}

  // console.log(
  //   "compositeWrapper: ",
  //   compositeWrapper,
  //   "entitiesValidationObject: ",
  //   entitiesValidationObj,
  // );

  const schemasObj = {};
  // Apply Field Validation (both atomic and composit subentities)
  for (const [key, entityToValidate] of Object.entries(entitiesValidationObj)) {
    // console.log("key: ", key, "entityToValidate: ", entityToValidate);

    const baseSchema = generateBaseSchema(entityToValidate, operation);

    // console.log("baseSchema: ", baseSchema);
    //Field Validation
    const mainEntityData = dataDependencies[entityToValidate] || [];

    // console.log("🐛 getValidationSChema called with: ", {
    //   entityToValidate,
    //   dataDependencies,
    //   operation,
    //   editedEntityId,
    //   baseSchema,
    //   mainEntityData,
    //   foreignKeys,
    // });

    let interimSchema = baseSchema;
    //add not required:
    interimSchema = FIELD_ASSERT.isNotRequired({
      schema: interimSchema,
      entity: entityToValidate,
    });

    interimSchema = FIELD_ASSERT.isForeignKeys({
      schema: interimSchema,
      entity: entityToValidate,
      dataDependencies,
    });

    interimSchema = FIELD_ASSERT.isUnique({
      entity: entityToValidate,
      schema: interimSchema,
      data: mainEntityData,
      editedEntityId,
    });

    // For UPDATE: FIELD_ASSERT id exists and there is change
    if (operation === "update") {
      // First, confirm the primary key exists.
      interimSchema = FIELD_ASSERT.exists({
        schema: interimSchema,
        data: mainEntityData,
        field: "idField",
        displayName: getEntityDisplayName(entity),
      });

      // Lastly, apply the isChanged validation.
      interimSchema = FIELD_ASSERT.isChanged({
        schema: interimSchema,
        data: mainEntityData,
        entity,
        editedEntityId,
      });
    }

    //Lastly: park the enganced schema in the schemasObj
    //keys should either be: {main, header, line}
    schemasObj[key] = interimSchema;
  }

  //Schema factory generator
  //if no compositeWrapper then it's an atomic entity with just one schema

  let enhancedSchema;

  // ->  Apply business rules only on atomic entity
  if (!compositeWrapper) {
    const schema = schemasObj["main"];

    enhancedSchema = ENTITY_ASSERT.isBusinessRules({
      entity,
      schema,
      context: { dataDependencies, universalDataService },
      editedEntityId,
    });

    return enhancedSchema;
  }

  // otherwise if there is a compositeWrapper then it's a composite entity and we need to merge the schemas
  const { header, line } = entitiesValidationObj;

  enhancedSchema = z.object({
    [header]: schemasObj["header"],
    [line]: z.array(schemasObj["line"]).min(1, errorMessages.atLeastOne(line)),
  });

  // COMPOSITE VALIDATION WITH BUSINESS RULES on compositeWrapper and sub-entities
  try {
    // console.log("⛳ Applying business rules....");

    enhancedSchema = ENTITY_ASSERT.isBusinessRules({
      entity,
      schema: enhancedSchema,
      context: { dataDependencies, universalDataService },
      editedEntityId,
    });
    // console.log("✅ isBusinessRules completed");
  } catch (error) {
    console.error("❌ isBusinessRules error: ", error);
  }
  return enhancedSchema;
};
