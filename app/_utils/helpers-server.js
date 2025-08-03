"server-only";

import { createDataService } from "../_lib/server/dataServices.js";
import entityServerOnlyConfig from "../_lib/server/entityServerOnlyConfig.js";

// Helper function to fetch entity data using appConfig (SERVER-ONLY)
export async function getServerData(entity, ...params) {
  // console.log(entity);
  const dataService = createDataService();
  const { get } = entityServerOnlyConfig(entity);

  if (!get) {
    throw new Error(
      `Data service method not found for entity '${entity}' in appConfig.`,
    );
  }

  // Call the dataService method with optional parameters
  // console.log("dataService params: ", ...params);
  const entityData = await dataService[get](...params);
  // console.log(entityData);
  return entityData;
}
