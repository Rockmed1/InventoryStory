import entityClientConfig, {
  fieldClientConfig,
  PATTERN_CONFIG,
} from "../_lib/config/entityClientConfig";

export function destructuredFormData(state, formData) {
  const formDataObject = Object.fromEntries(formData.entries());

  // 3. Combine and return the two arrays
  return { ...state, ...formDataObject };
}

export function createFormData(data) {
  //Convert RHF data to FormData for server action compatibility
  const formData = new FormData();
  Object.entries(data).forEach(([Key, value]) => {
    formData.append(Key, value);
  });
  return formData;
}

/**
 * Retrieves the entire field definition object for a specific field of an entity.
 * @param {string} entity - The name of the entity (e.g., "item").
 * @param {string} field - The name of the field (e.g., "nameField").
 * @returns {object|undefined} The field definition object or undefined if not found.
 * @example
 * // returns: { type: "string", validation: "string100", display: "Name", required: true, unique: true }
 * getFieldDefinition("item", "nameField");
 */

export function getFieldDefinition(entity, field) {
  const config = entityClientConfig(entity);
  return config?.fields?.[field];
}

/**
 * Retrieves the data type for a specific field from the global field configuration.
 * This function does not account for entity-specific overrides of the 'type' property.
 * @param {string} field - The name of the field (e.g., "nameField").
 * @returns {string} The field's data type, defaulting to "string".
 * @example
 * // returns: "string"
 * getFieldType("nameField");
 * // returns: "number"
 * getFieldType("itemClassId");
 */

export function getFieldType(field) {
  const fieldDef = fieldClientConfig(field);
  return fieldDef?._type || "string";
}
/**
 * Retrieves the validation rule key for a specific field of an entity.
 * @param {string} entity - The name of the entity (e.g., "item").
 * @param {string} field - The name of the field (e.g., "nameField").
 * @returns {string|undefined} The validation rule key (e.g., "string100") or undefined if not found.
 * @example
 * // returns: "string100"
 * getFieldValidation("item", "nameField");
 */
export function getFieldValidation(entity, field) {
  const fieldDef = getFieldDefinition(entity, field);
  return fieldDef?.validation;
}

/**
 * Retrieves the display name for a specific field of an entity.
 * @param {string} entity - The name of the entity (e.g., "item").
 * @param {string} field - The name of the field (e.g., "nameField").
 * @returns {string} The display name or the field name itself if not defined.
 * @example
 * // returns: "Name"
 * getFieldDisplayName("item", "nameField");
 */
export function getFieldDisplayName(entity, field) {
  const fieldDef = getFieldDefinition(entity, field);
  return fieldDef?.display.name || field;
}

export function getFieldDisplayLabel(entity, field) {
  const fieldDef = getFieldDefinition(entity, field);
  return fieldDef?.display.label || field;
}

/**
 * Retrieves all foreign key fields and their definitions for a given entity.
 * @param {string} entity - The name of the entity (e.g., "item").
 * @returns {object} An object where keys are the foreign key fields and values are their foreign key definitions.
 * @example
 * // returns: { itemClassId: { entity: "itemClass", field: "idField" } }
 * getForeignKeys("item");
 */
export function getForeignKeys(entity) {
  const config = entityClientConfig(entity);
  return Object.entries(config?.fields || {})
    .filter(([_, def]) => def.foreignKey)
    .reduce((acc, [field, def]) => {
      acc[field] = def.foreignKey;
      return acc;
    }, {});
}

export function getFkField(field) {
  const fieldDef = fieldClientConfig(field);
  return fieldDef?.foreignKey?.field;
}

export function getNotRequiredFields(entity) {
  const config = entityClientConfig(entity);
  return Object.entries(config?.fields || {})
    .filter(([_, def]) => !def.fieldValidation?.required)
    .map(([field, _]) => field);
}

/**
 * Retrieves all fields marked as unique for a given entity.
 * @param {string} entity - The name of the entity (e.g., "item").
 * @returns {string[]} An array of field names that are unique.
 * @example
 * // returns: ["nameField"]
 * getUniqueFields("item");
 */
export function getUniqueFields(entity) {
  const config = entityClientConfig(entity);
  return Object.entries(config?.fields || {})
    .filter(([_, def]) => def.fieldValidation?.unique)
    .map(([field, _]) => field);
}

/**
 * Retrieves the fields used for change detection for a given entity.
 * @param {string} entity - The name of the entity (e.g., "item").
 * @returns {string[]} An array of field names used for change detection.
 * @example
 * // returns: ["nameField", "descField", "itemClassId"]
 * getEntityChangeDetectionFields("item");
 */
export function getEntityChangeDetectionFields(entity) {
  const config = entityClientConfig(entity);
  return config?.changeDetectionFields || [];
}

/**
 * Retrieves a list of entities that are dependencies for validation,
 * including the primary entity and any entities linked via foreign keys.
 * @param {string} entity - The name of the primary entity (e.g., "item").
 * @returns {string[]} An array of unique entity names required for validation.
 * @example
 * // returns: ["item", "itemClass"]
 * getEntityDependencies("item");
 */
export function getEntityDependencies(entity) {
  const foreignKeys = getForeignKeys(entity);
  const foreignEntities = Object.values(foreignKeys).map((fk) => fk.entity);

  return [
    entity, // Always include the main entity
    ...new Set(foreignEntities), // Add unique foreign entities
  ];
}

/**
 * Retrieves an object containing all validation rules for a given entity.
 * @param {string} entity - The name of the entity (e.g., "item").
 * @returns {object} An object where keys are the field names and values are their validation rule keys.
 * @example
 * // returns: { idField: "positiveInteger", nameField: "string100", descField: "text", itemClassId: "positiveInteger" }
 * getEntityFieldsValidation("item");
 */
export function getEntityFieldsValidation(entity) {
  const config = entityClientConfig(entity);
  if (!config?.fields) {
    return {};
  }
  return Object.entries(config.fields).reduce((acc, [field, def]) => {
    if (def.validation) {
      acc[field] = def.validation;
    }
    return acc;
  }, {});
}

export function getEntityDisplayName(entity) {
  const config = entityClientConfig(entity);
  return config.display.name || "⚠️ no entity display name!";
}

export function getEntityDisplayLabel(entity) {
  const config = entityClientConfig(entity);
  return config.display.label || "⚠️ no entity display label!";
}

export function getEntityTableLabels(entity) {
  const config = entityClientConfig(entity);
  return config.displayTableLabels || [];
}

export function getEntityUrlIdentifier(entity) {
  const config = entityClientConfig(entity);
  // console.log(config);
  return config.urlIdentifer || "id";
}

export function getEntityPattern(entity) {
  const config = entityClientConfig(entity);
  return config?.pattern;
}

export function getEntityPatternType(entity) {
  const pattern = getEntityPattern(entity);
  return PATTERN_CONFIG[pattern];
}

export function getCompositeEntities(entity) {
  const config = entityClientConfig(entity);
  if (
    getEntityPatternType(entity) !== "composite" ||
    !config?.compositeEntities
  ) {
    throw new Error(
      `Entity pattern type is not defined as composite or no composite entities available for entity ${entity}`,
    );
  }
  return config.compositeEntities;
}

export function getEntityValidationObj(entity) {
  const entityPatternType = getEntityPatternType(entity);

  const entityValidationObj = {};

  if (entityPatternType === "atomic") {
    entityValidationObj["main"] = entity;
  }
  if (entityPatternType === "composite") {
    entityValidationObj["wrapper"] = entity;
    const { header, line } = getCompositeEntities(entity);
    entityValidationObj[header] = header;
    entityValidationObj[line] = line;
  }

  return { wrapper: entityValidationObj["wrapper"], ...entityValidationObj };
}
