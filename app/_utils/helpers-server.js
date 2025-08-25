"server-only";

import entityServerOnlyConfig from "../_lib/config/server/entityServerOnlyConfig.js";
import { createDataService } from "../_lib/server/dataServices.js";
import {
  getCompositeEntities,
  getEntityPattern,
  getEntityPatternType,
} from "./helpers.js";

// Helper function to fetch entity data using appConfig (SERVER-ONLY)
export async function getServerData({ entity, options = {}, ...otherParams }) {
  if (!entity) throw new Error(`🚨 no entity was provided for getServerData.`);

  // console.log("getServerData called with: ", {
  //   entity,
  //   options,
  //   ...otherParams,
  // });

  const dataService = await createDataService(options);
  const { get } = entityServerOnlyConfig(entity);

  if (!get) {
    throw new Error(
      `Data service method not found for entity '${entity}' in entityServerOnlyConfig.`,
    );
  }

  // console.log("get: ", get);
  // console.log("dataService[get]:", dataService);
  // console.log(
  //   "getServerData calling dataService[get] with params: ",
  //   otherParams,
  // );
  // console.log("getServerData dataService method name: ", get);

  // Call the dataService method with optional parameters
  const entityData = await dataService[get]({ ...otherParams, options });
  // console.log("getServerData entityData result: ", entityData);
  // console.log("getServerData entityData length: ", entityData?.length);
  return entityData;
}

export function getEntityFieldMapping(entity) {
  const config = entityServerOnlyConfig(entity);
  return config?.fieldMappings;
}
export function dbReadyData(validatedData, entity) {
  const isComposit = getEntityPatternType(entity) === "composite";

  function processFlatDataObj(dataObj, fieldMappings) {
    const massagedData = {};

    Object.entries(dataObj).forEach(([key, value]) => {
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

  if (isComposit) {
    const massagedData = {};
    const compositeEntities = getCompositeEntities(entity);

    const mainEntityFieldMappings = getEntityFieldMapping(entity);

    Object.values(compositeEntities).forEach((subEntity) => {
      const fieldMappings = getEntityFieldMapping(subEntity);
      const subEntityPattern = getEntityPattern(subEntity);

      const mappedSubEntityName =
        mainEntityFieldMappings[subEntity] || subEntity;

      if (subEntityPattern === "header") {
        massagedData[mappedSubEntityName] = processFlatDataObj(
          validatedData[subEntity],
          fieldMappings,
        );
      }

      if (subEntityPattern === "line") {
        massagedData[mappedSubEntityName] = validatedData[subEntity].map(
          (lineData) => {
            return processFlatDataObj(lineData, fieldMappings);
          },
        );
      }
    });

    return massagedData;
  } else {
    const fieldMappings = getEntityFieldMapping(entity);

    return processFlatDataObj(validatedData, fieldMappings);
  }
}
