import entityConfig from "../_lib/appConfig.js";

export function destructuredFormData(state, formData) {
  const formDataObject = Object.fromEntries(formData.entries());

  // 3. Combine and return the two arrays
  return { ...state, ...formDataObject };
}

/*  */
export function parseIdAndName(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => `${item.id} - ${item.name}`);
}

export function removeLocDesc(data) {
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

// Helper function to get field mappings from appConfig (CLIENT-SAFE)
export function getFieldMappings(entity) {
  const config = entityConfig(entity);
  if (!config || !config.fieldMappings) {
    throw new Error(`Field mappings for '${entity}' not found in appConfig.`);
  }
  return {
    idField: config.fieldMappings.idField,
    nameField: config.fieldMappings.nameField,
    displayName: config.displayName,
  };
}