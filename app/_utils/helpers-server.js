import "server-only";

import entityConfig from "../_lib/appConfig.js";
import { createDataService } from "../_lib/dataServices.js";

// Helper function to fetch entity data using appConfig (SERVER-ONLY)
export async function getData(entity, ...params) {
  const dataService = createDataService();
  const { get } = entityConfig(entity);

  if (!get) {
    throw new Error(
      `Data service method not found for entity '${entity}' in appConfig.`,
    );
  }

  // Call the dataService method with optional parameters
  const entityData = await dataService[get](...params);

  return entityData;
}

// Helper function to fetch dependency data for an entity (SERVER-ONLY)
export async function getDependenciesData(entity) {
  const config = entityConfig(entity);
  const dependencies = config?.dependencies || [];

  const dataDependencies = {};

  for (const dependency of dependencies) {
    try {
      const dependencyData = await getData(dependency);
      dataDependencies[dependency] = dependencyData;
    } catch (error) {
      console.warn(`Failed to fetch dependency data for ${dependency}:`, error);
      dataDependencies[dependency] = [];
    }
  }

  return dataDependencies;
}
