"server only";

import StoreHydrator from "../_store/StoreHydrator";
import {
  getDataAndDependencies,
  getDependenciesData,
} from "../_utils/helpers-server";

// Serialize data to make it safe for client components
function serializeData(data) {
  return JSON.parse(JSON.stringify(data));
}

export default async function ClientCacheHydrator({
  entity,
  entityParams = {},
  dependenciesOnly = true,
}) {
  // console.log(entity);
  // Choose the appropriate fetch function based on needs
  const entitiesData = dependenciesOnly
    ? await getDependenciesData(entity, entityParams)
    : await getDataAndDependencies(entity, entityParams);

  // Serialize the data to ensure it's safe for client components
  const serializedData = serializeData(entitiesData);

  // console.log(entitiesData);
  return <StoreHydrator entitiesData={serializedData} />;
}
