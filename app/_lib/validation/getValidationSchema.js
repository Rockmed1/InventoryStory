import {
  errorMessages,
  VALIDATION_RULES,
} from "@/app/_lib/validation/ZodSchemas";
import {
  getEntityChangeDetectionFields,
  getEntityDisplayName,
  getEntityFieldsValidation,
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
      const fieldDisplayName = getFieldDisplayName(entity, field);

      acc[field] = VALIDATION_RULES[fieldValidation.type](fieldDisplayName);

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
  exists: ({ schema, data, field, displayName }) => {
    // console.log("🐛 exists called with:", {
    //   field,
    //   displayName,
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
          message: errorMessages.notFound(displayName),
        },
      ),
    });

    return enhancedSchema;
  },

  isUnique: ({ entity, schema, data, editedEntityId = null }) => {
    // console.log("🐛 isUnique called with:", {
    //   field,
    //   displayName,
    //   editedEntityId,
    //   dataLength: data.length,
    //   data: data,
    //   fieldType,
    // });

    // console.log("fieldType: ", fieldType);
    const uniqueFields = getUniqueFields(entity);
    // console.log("🐛  uniqueFields: ", uniqueFields);

    if (!uniqueFields) return schema;

    let enhancedSchema;

    uniqueFields
      .filter((field) => {
        schema.shape.hasOwnProperty(field);
      })
      .map((field) => {
        const fieldDisplayName = getFieldDisplayName(entity, field);
        const fieldType = getFieldType(field);

        const lookupData = editedEntityId
          ? data.filter((_) => _.idField !== editedEntityId)
          : data;

        enhancedSchema = schema.extend({
          [field]: schema.shape[field].refine(
            (value) => {
              // console.log(
              //   "🐛 Refine function called with value:",
              //   value,
              //   typeof value,
              // );
              if (!value || data.length === 0) return true;

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
                // console.log("🐛 Final validation result:", result);
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

  isNotRequired: (schema, entity) => {
    const notRequiredFields = getNotRequiredFields(entity);
    let enhancedSchema = schema;

    notRequiredFields.forEach((field) => {
      const originalFieldSchema = schema.shape[field];
      if (!originalFieldSchema) return;

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

const ENTITY_ASSERT = {};

// 5. validation function
export const getValidationSchema = ({
  entity,
  dataDependencies = {},
  operation = "create",
  editedEntityId = null,
}) => {
  const { wrapper, ...entityValidationObj } = getEntityValidationObj(entity);

  // console.log(
  //   "wrapper: ",
  //   wrapper,
  //   "entityValidationObj: ",
  //   entityValidationObj,
  // );

  const schemasObj = {};

  for (const [key, entity] of Object.entries(entityValidationObj)) {
    // console.log("key: ", key, "entity: ", entity);

    const baseSchema = generateBaseSchema(entity, operation);

    const mainEntityData = dataDependencies[entity] || [];

    //:make this FIELD_ASSERT.isForeignKeys
    const foreignKeys = getForeignKeys(entity);

    // console.log("🐛 getValidationSChema called with: ", {
    //   entity,
    //   dataDependencies,
    //   operation,
    //   editedEntityId,
    //   baseSchema,
    //   mainEntityData,
    //   foreignKeys,
    // });

    let enhancedSchema = baseSchema;
    //add not required:
    enhancedSchema = FIELD_ASSERT.isNotRequired({
      schema: enhancedSchema,
      entity,
    });

    // Shared for Create and Update
    // Add foreign key validation for all dependencies
    if (foreignKeys) {
      for (const [fkField, remoteConfig] of Object.entries(foreignKeys || {})) {
        const remoteEntity = remoteConfig.entity;

        if (baseSchema.shape[fkField]) {
          const fkEntityData = dataDependencies[remoteEntity] || [];

          const fkEntityDisplayName = getEntityDisplayName(remoteEntity);

          enhancedSchema = FIELD_ASSERT.exists({
            schema: enhancedSchema,
            data: fkEntityData,
            field: fkField,
            displayName: fkEntityDisplayName,
          });
        }
      }
    }

    const mainEntityDisplayName = getEntityDisplayName(entity);

    //add unique:
    const uniqueFields = getUniqueFields(entity);
    // console.log("🐛  uniqueFields: ", uniqueFields);

    uniqueFields.map((field) => {
      const fieldDisplayName = getFieldDisplayName(entity, field);
      // console.log("🐛 field: ", field);
      // console.log("🐛  fieldDisplayName: ", fieldDisplayName);

      enhancedSchema = FIELD_ASSERT.isUnique({
        entity,
        schema: enhancedSchema,
        data: mainEntityData,
        editedEntityId,
      });
    });

    // if (operation === "create") {
    //   uniqueFields.map((field) => {
    //     enhancedSchema = FIELD_ASSERT.isUnique(
    //       enhancedSchema,
    //       mainEntityData,
    //       field,
    //       mainEntityDisplayName,
    //     );
    //   });
    // }

    // For UPDATE: FIELD_ASSERT id exists and there is change
    if (operation === "update") {
      // First, confirm the primary key exists.
      enhancedSchema = FIELD_ASSERT.exists({
        schema: enhancedSchema,
        data: mainEntityData,
        field: "idField",
        displayName: mainEntityDisplayName,
      });

      // Lastly, apply the isChanged validation.
      enhancedSchema = FIELD_ASSERT.isChanged({
        schema: enhancedSchema,
        data: mainEntityData,
        entity,
        editedEntityId,
      });
    }

    //Lastly: park the enganced schema in the schemasObj
    schemasObj[key] = enhancedSchema;
  }

  //Schema factory generator
  //if no wrapper then it's an atomic entity with just one schema
  if (!wrapper) return schemasObj["main"];

  // otherwise if there is a wrapper then it's a composite entity and we need to merge the schemas
  const header = entityValidationObj.header;
  const line = entityValidationObj.line;
  let finalSchema = z.object({
    [header]: schemasObj[header],
    [line]: z.array(schemasObj[line]).min(1, errorMessages.atLeastOne(line)),
  });

  return finalSchema;
};
