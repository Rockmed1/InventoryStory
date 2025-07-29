import entityServerOnlyConfig from "./server/entityServerOnlyConfig";

// Helper function to set nested values from dot notation or array notation
function setNestedValue(obj, path, value) {
  // Handle array notation: "_trx_details[0]._item_id"
  const arrayMatch = path.match(/^(.+?)\[(\d+)\]\.(.+)$/);
  if (arrayMatch) {
    const [, arrayName, index, fieldName] = arrayMatch;
    if (!obj[arrayName]) obj[arrayName] = [];
    if (!obj[arrayName][index]) obj[arrayName][index] = {};
    obj[arrayName][index][fieldName] = value;
    return;
  }

  // Handle object notation: "_trx_header._trx_date"
  const objectMatch = path.match(/^(.+?)\.(.+)$/);
  if (objectMatch) {
    const [, objName, fieldName] = objectMatch;
    if (!obj[objName]) obj[objName] = {};
    obj[objName][fieldName] = value;
    return;
  }

  // Direct field
  obj[path] = value;
}

// Main FormData transformer
export const formDataTransformer = {
  // Parse FormData to intermediate format
  parse: (formData) => {
    const result = {};

    for (const [key, value] of formData.entries()) {
      // Skip empty values for optional fields and convert to null
      if (
        value === "" &&
        (key.includes("_from_bin") || key.includes("_qty_out"))
      ) {
        setNestedValue(result, key, null);
      } else {
        setNestedValue(result, key, value);
      }
    }

    return result;
  },

  // Transform to final schema with business logic
  toSchema: (parsed) => {
    const details = parsed._trx_details || [];

    return {
      _trx_header: {
        _trx_date: parsed._trx_header?._trx_date,
        _trx_desc: parsed._trx_header?._trx_desc,
        _market_id: parsed._trx_header?._market_id
          ? parseInt(parsed._trx_header._market_id)
          : null,
        _trx_type_id: parsed._trx_header?._trx_type_id
          ? parseInt(parsed._trx_header._trx_type_id)
          : null,
        _num_of_lines: details.length.toString(),
      },
      _trx_details: details.map((detail, index) => ({
        _trx_line_num: (index + 1).toString(),
        _item_id: detail._item_id ? parseInt(detail._item_id) : null,
        _qty_in: detail._qty_in ? parseInt(detail._qty_in) : null,
        _qty_out: detail._qty_out ? parseInt(detail._qty_out) : null,
        _from_bin: detail._from_bin ? parseInt(detail._from_bin) : null,
        _to_bin: detail._to_bin ? parseInt(detail._to_bin) : null,
        _item_trx_desc: detail._item_trx_desc,
      })),
    };
  },

  // Complete pipeline
  transform: (formData) => {
    const parsed = formDataTransformer.parse(formData);
    return formDataTransformer.toSchema(parsed);
  },
};

export function dbReadyData(validatedData, entity) {
  const config = entityServerOnlyConfig(entity);
  if (!config?.fieldMappings) {
    // No field mappings defined, return as-is
    return validatedData;
  }

  const { fieldMappings } = config;
  const massagedData = {};

  // Handle special case for ItemTrx with nested structure
  if (entity === "ItemTrx") {
    // For ItemTrx, the validated data is already in the correct structure from transformers
    return validatedData;
  }

  // For other entities, map field mapping keys to actual database field names
  Object.entries(validatedData).forEach(([key, value]) => {
    // Check if this key is a field mapping key
    const dbFieldName = fieldMappings[key];
    if (dbFieldName) {
      // Use the actual database field name
      massagedData[dbFieldName] = value;
    } else {
      // Keep the original key if no mapping found
      massagedData[key] = value;
    }
  });

  return massagedData;
}
