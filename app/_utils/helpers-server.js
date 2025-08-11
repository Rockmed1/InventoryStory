"server-only";

import entityServerOnlyConfig from "../_lib/config/server/entityServerOnlyConfig.js";
import { createDataService } from "../_lib/server/dataServices.js";

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
  // console.log("Server entityData: ", entityData);
  return entityData;
}
