import { getEntityPattern } from "./helpers";

export const formUtils = {
  // Get all touched paths
  getTouchedPaths: (entity, form) => {
    const touched = form.formState.touchedFields;
    const entityPattern = getEntityPattern(entity);
    const paths = [];

    const touchedFields = entityPattern === "line" ? touched[entity] : touched;

    if (
      entityPattern === "line" &&
      touchedFields &&
      Array.isArray(touchedFields)
    ) {
      touchedFields.forEach((lineItem, index) => {
        if (lineItem && typeof lineItem === "object") {
          Object.keys(lineItem).forEach((fieldName) => {
            if (lineItem[fieldName]) {
              paths.push(`${entity}.${index}.${fieldName}`);
            }
          });
        }
      });
    } else {
      Object.keys(touchedFields).forEach((fieldName) => {
        paths.push(`${entity}.${fieldName}`);
      });
    }

    return paths;
  },

  // Get touched paths for specific line
  getTouchedPathsForLine: (entity, form, lineIndex) => {
    const touchedFields = form.formState.touchedFields;
    const paths = [];

    if (touchedFields?.[entity]?.[lineIndex]) {
      const lineItem = touchedFields.itemTrxDetails[lineIndex];
      Object.keys(lineItem).forEach((fieldName) => {
        if (lineItem[fieldName]) {
          paths.push(`itemTrxDetails.${lineIndex}.${fieldName}`);
        }
      });
    }

    return paths;
  },

  // Get touched field names for specific line
  getTouchedFieldsForLine: (entity, form, lineIndex) => {
    const touchedFields = form.formState.touchedFields;
    const fields = [];

    if (touchedFields?.[entity]?.[lineIndex]) {
      const lineItem = touchedFields?.[entity][lineIndex];
      Object.keys(lineItem).forEach((fieldName) => {
        if (lineItem[fieldName]) {
          fields.push(fieldName);
        }
      });
    }

    return fields;
  },

  // Check if specific field is touched
  isFieldTouched: (entity, form, lineIndex, fieldName) => {
    const touched = form.formState.touchedFields;
    const entityPattern = getEntityPattern(entity);

    const touchedFields =
      entityPattern === "line" ? touched?.[entity]?.[lineIndex] : touched;

    return touchedFields?.[fieldName] || false;
  },

  // Get all touched lines (lines with at least one touched field)
  getTouchedLines: (entity, form) => {
    const touchedFields = form.formState.touchedFields;
    const touchedLines = [];

    if (touchedFields?.[entity] && Array.isArray(touchedFields?.[entity])) {
      touchedFields[entity].forEach((lineItem, index) => {
        if (lineItem && typeof lineItem === "object") {
          const hasTouchedFields = Object.values(lineItem).some(Boolean);
          if (hasTouchedFields) {
            touchedLines.push(index);
          }
        }
      });
    }

    return touchedLines;
  },

  getAllErrorPaths: (form) => {
    //TODO: make this work for line and all others...
    const errors = form.formState.errors;
    const errorPaths = [];

    const extractErrorPaths = (errorObj, currentPath = "") => {
      Object.keys(errorObj).forEach((key) => {
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        if (errorObj[key] && typeof errorObj[key] === "object") {
          // Check if this is an actual error object (has message, type, etc.)
          if (errorObj[key].message || errorObj[key].type) {
            errorPaths.push(newPath);
          } else if (Array.isArray(errorObj[key])) {
            // Handle array fields (like itemTrxDetails)
            errorObj[key].forEach((item, index) => {
              if (item && typeof item === "object") {
                extractErrorPaths(item, `${newPath}.${index}`);
              }
            });
          } else {
            // Recursively check nested objects
            extractErrorPaths(errorObj[key], newPath);
          }
        }
      });
    };

    extractErrorPaths(errors);
    return errorPaths;
  },
};
