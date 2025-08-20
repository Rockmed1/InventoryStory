"server-only";

import entityServerOnlyConfig from "../_lib/config/server/entityServerOnlyConfig.js";
import { createDataService } from "../_lib/server/dataServices.js";

// Helper function to fetch entity data using appConfig (SERVER-ONLY)
export async function getServerData({ entity, ...otherParams }) {
  if (!entity) throw new Error(`🚨 no entity was provided for getServerData.`);

  // console.log("getServerData entity: ", entity);
  // console.log("getServerData otherParams: ", otherParams);

  const dataService = await createDataService();
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
  const entityData = await dataService[get](otherParams);
  // console.log("getServerData entityData result: ", entityData);
  // console.log("getServerData entityData length: ", entityData?.length);
  return entityData;
}

export function getEntityFieldMapping(entity) {
  const config = entityServerOnlyConfig(entity);
  return config?.fieldMappings;
}
