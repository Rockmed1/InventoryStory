import entityClientConfig from "@/app/_lib/client/entityClientConfig";
import { errorMessages, schemas } from "@/app/_lib/ZodSchemas";
import { z } from "zod";

export const appContextSchema = z.object({
  _usr_uuid: z.string().uuid({ message: errorMessages.invalid("usr_uuid") }),
  _org_uuid: z.string().uuid({ message: errorMessages.invalid("org_uuid") }),
});

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
  exists: (
    schema,
    data,
    field,
    displayName,
    // operation = "create",
    keyField = "id",
  ) => {
    const enhancedSchema = schema.extend({
      [field]: schema.shape[field].refine(
        (value) => {
          const baseType = getBaseType(schema.shape[field]);

          if (!value) return true; // Don't validate null or undefined values
          if (data.length === 0) return false; // If no  data, it can't exist

          // console.log("Assert exists - data: ", data);
          // console.log("Assert exists - field: ", field);
          // console.log("Assert exists - displayName: ", displayName);
          // console.log("Assert exists - keyField: ", keyField);
          if (baseType === "ZodNumber") {
            return data.some((row) => row[keyField] === value);
          }

          if (baseType === "ZodString") {
            const normalizedValue = value.toLowerCase().trim();

            // console.log("🐛 Checking each row:");
            const result = data.some((row) => {
              // row.name &&
              //   row.name.toLowerCase().trim() === normalizedValue,
              // console.log("🐛 Checking row:", row, "row.name:", row.name);
              // console.log("🐛 Match result:", row.name?.toLowerCase().trim() === normalizedValue);
              return row.name?.toLowerCase().trim() === normalizedValue;
            });
            // console.log("🐛 Final validation result:", result);
            return result;
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

  isUnique: (
    schema,
    data,
    field,
    displayName,
    operation = "create",
    editedEntityId = null,
  ) => {
    // console.log("🐛 isUnique called with:", {
    //   field,
    //   displayName,
    //   operation,
    //   editedEntityId,
    //   dataLength: data.length,
    //   data: data,
    // });
    const baseType = getBaseType(schema.shape[field]);

    // console.log("baseType: ", baseType);
    if (!schema.shape[field]) {
      console.log(
        `Field "${field}" not found in schema. Available fields:`,
        Object.keys(schema.shape),
      );
      return schema; // Return original schema if field doesn't exist
    }

    const lookupData =
      operation === "update"
        ? data.filter((_) => _.id !== editedEntityId)
        : data;

    // console.log("Zod isUnique Lookup data: ", lookupData);
    const enhancedSchema = schema.extend({
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
          if (baseType === "ZodNumber") {
            return !lookupData.some((row) => row.id === parseInt(value));
          }

          if (baseType === "ZodString") {
            // console.log("🐛 About to normalize value:", value);
            const normalizedValue = value.toLowerCase().trim();

            // console.log("🐛 Checking each row:");
            const result = !lookupData.some((row) => {
              // row.name &&
              //   row.name.toLowerCase().trim() === normalizedValue,
              // console.log("🐛 Checking row:", row, "row.name:", row.name);
              // console.log("🐛 Match result:", row.name?.toLowerCase().trim() === normalizedValue);
              return row.name?.toLowerCase().trim() === normalizedValue;
            });
            // console.log("🐛 Final validation result:", result);
            return result;
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

  isChanged: (schema, data = null, entity, editedEntityId = null) => {
    const { changeDetectionFields } = entityClientConfig(entity);
    // console.log("Zod isChanged changeDetectionFields: ", changeDetectionFields);

    if (!changeDetectionFields || !data || !editedEntityId) return schema; //skip if no config or original data

    const preEditData = data.find((_) => _.id === editedEntityId);

    if (!preEditData) return schema; //skip if original record not found

    const enhancedSchema = schema.refine(
      (newData) => {
        // console.log("Zod isChanged preEditData: ", preEditData);
        //check if any field has changed
        return Object.entries(changeDetectionFields).some(
          ([field, preEditField]) => {
            // console.log(
            //   `Zod isChanged ${field}: ${newData[field]}`,
            //   `${preEditField}: ${preEditData[preEditField]}`,
            //   `isNotEqual: ${newData[field] !== preEditData[preEditField]}`,
            // );
            return newData[field] !== preEditData[preEditField];
          },
        );
      },
      {
        message: errorMessages.noChange(),
      },
    );

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
export const getValidationSchema = (
  entity,
  dataDependencies = {},
  operation = "create",
  editedEntityId = null,
) => {
  const baseSchema = getBaseSchema(entity, operation);

  const mainEntityData = dataDependencies[entity] || [];

  const { displayName, foreignKeys } = entityClientConfig(entity);

  let enhancedSchema = baseSchema;

  // Shared for Create and Update
  // Add foreign key validation for all dependencies
  if (foreignKeys) {
    for (const [fkField, remoteConfig] of Object.entries(foreignKeys)) {
      const [remoteEntity, remoteFkField] = Object.entries(remoteConfig)[0];

      if (baseSchema.shape[fkField]) {
        const dependencyData = dataDependencies[remoteEntity] || [];
        const { displayName: depDisplayName } =
          entityClientConfig(remoteEntity);

        enhancedSchema = assert.exists(
          enhancedSchema,
          dependencyData,
          fkField,
          depDisplayName,
          remoteFkField,
        );
      }
    }
  }

  if (operation === "create") {
    enhancedSchema = assert.isUnique(
      enhancedSchema,
      mainEntityData,
      "nameField",
      displayName,
    );
  }

  // For UPDATE: assert id exists
  if (operation === "update") {
    enhancedSchema = assert.isUnique(
      enhancedSchema,
      mainEntityData,
      "nameField",
      displayName,
      "update",
      editedEntityId,
    );

    enhancedSchema = assert.exists(
      enhancedSchema,
      mainEntityData,
      "idField",
      displayName,
    );

    enhancedSchema = assert.isChanged(
      enhancedSchema,
      mainEntityData,
      entity,
      editedEntityId,
    );
  }

  if (entity === "ItemTrx") {
    const existingBins = dataDependencies.bin || [];
    const existingItems = dataDependencies.item || [];
    const existingMarkets = dataDependencies.market || [];
    const existingTrxTypes = dataDependencies.trxType || [];

    // Enhanced header schema with market and trxType validation
    let enhancedHeaderSchema = schemas.itemTrxHeader;

    if (existingMarkets.length > 0) {
      enhancedHeaderSchema = enhancedHeaderSchema.extend({
        _market_id: schemas.itemTrxHeader.shape._market_id.refine(
          (id) => existingMarkets.some((market) => market.id === parseInt(id)),
          { message: (val) => errorMessages.depNotFound(val) },
        ),
      });
    }

    if (existingTrxTypes.length > 0) {
      enhancedHeaderSchema = enhancedHeaderSchema.extend({
        _trx_type_id: schemas.itemTrxHeader.shape._trx_type_id.refine(
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
}; // 1. App context schema
