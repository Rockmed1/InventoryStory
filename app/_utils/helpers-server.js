"server-only";

import { createDataService } from "../_lib/server/dataServices.js";
import entityServerOnlyConfig from "../_lib/server/entityServerOnlyConfig.js";

// function getEntityServerConfig(entity) {
//   const config = {
//     ...entityClientConfig(entity),
//     ...entityServerOnlyConfig(entity),
//   };

//   return config;
// }

// Helper function to fetch entity data using appConfig (SERVER-ONLY)
export async function getData(entity, ...params) {
  // console.log(entity);
  const dataService = createDataService();
  const { get } = entityServerOnlyConfig(entity);

  if (!get) {
    throw new Error(
      `Data service method not found for entity '${entity}' in appConfig.`,
    );
  }

  // Call the dataService method with optional parameters
  const entityData = await dataService[get](...params);
  // console.log(entityData);
  return entityData;
}

// Helper function to fetch only dependency data (no main entity) (SERVER-ONLY)
export async function getDependenciesData(entity, entityParams = {}) {
  const config = getEntityServerConfig(entity);
  const dependencies = config?.dependencies || [];

  // console.log(config);
  // Only fetch dependencies, not the main entity
  const fetchPromises = [];
  const entityNames = [];

  // Add dependencies only
  dependencies.forEach((dependency) => {
    const dependencyParams = entityParams[dependency] || [];
    fetchPromises.push(
      getData(dependency, ...dependencyParams).catch((error) => {
        console.warn(
          `Failed to fetch dependency data for ${dependency}:`,
          error,
        );
        return [];
      }),
    );
    entityNames.push(dependency);
  });

  // Execute all fetches in parallel
  const results = await Promise.all(fetchPromises);

  // Map results to entity names
  const dataDependencies = {};
  entityNames.forEach((name, index) => {
    dataDependencies[name] = results[index];
  });

  console.log(dataDependencies);
  return dataDependencies;
}

// Helper function to fetch entity data with its dependencies (SERVER-ONLY)
export async function getDataAndDependencies(entity, entityParams = {}) {
  const config = getEntityServerConfig(entity);
  const dependencies = config?.dependencies || [];

  // Create all fetch promises with entity names
  const fetchPromises = [];
  const entityNames = [];

  // Add main entity
  const mainEntityParams = entityParams[entity] || [];
  fetchPromises.push(
    getData(entity, ...mainEntityParams).catch((error) => {
      console.warn(`Failed to fetch main entity data for ${entity}:`, error);
      return [];
    }),
  );
  entityNames.push(entity);

  // Add dependencies
  dependencies.forEach((dependency) => {
    const dependencyParams = entityParams[dependency] || [];
    fetchPromises.push(
      getData(dependency, ...dependencyParams).catch((error) => {
        console.warn(
          `Failed to fetch dependency data for ${dependency}:`,
          error,
        );
        return [];
      }),
    );
    entityNames.push(dependency);
  });

  // Execute all fetches in parallel
  const results = await Promise.all(fetchPromises);

  // Map results to entity names
  const dataDependencies = {};
  entityNames.forEach((name, index) => {
    dataDependencies[name] = results[index];
  });

  return dataDependencies;
}
