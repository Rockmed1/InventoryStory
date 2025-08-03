"use server";

import { getServerData } from "../../_utils/helpers-server";
import entityClientConfig from "../client/entityClientConfig";
import { getValidationSchema } from "../getValidationSchema";

/**
 * A server-side utility to generate a Zod validation schema.
 * It fetches all necessary dependency data in parallel before constructing the schema.
 *
 * @param {string} entity - The name of the primary entity for validation.
 * @param {string} operation - The operation type ('create' or 'update').
 * @returns {Promise<import('zod').ZodSchema>} A promise that resolves to the complete Zod schema.
 */
export async function getServerValidationSchema(
  entity,
  operation = "create",
  editedEntityId = null,
) {
  // 1. Determine the unique set of entities to fetch based on foreign keys.
  const entityConfig = entityClientConfig(entity);
  const entitiesToFetch = new Set([entity]); // Always include the primary entity

  if (entityConfig.foreignKeys) {
    for (const remoteConfig of Object.values(entityConfig.foreignKeys)) {
      const remoteEntity = Object.keys(remoteConfig)[0];
      entitiesToFetch.add(remoteEntity);
    }
  }

  // 2. Create an array of data-fetching promises.
  const fetchPromises = Array.from(entitiesToFetch).map((entityName) =>
    getServerData(entityName).catch((error) => {
      // Log the error but return an empty array so one failed query doesn't block all validation.
      console.error(`Failed to fetch server data for ${entityName}:`, error);
      return [];
    }),
  );

  // 3. Execute all data-fetching promises in parallel.
  const results = await Promise.all(fetchPromises);

  // 4. Assemble the dataDependencies object.
  const dataDependencies = Array.from(entitiesToFetch).reduce(
    (acc, entityName, index) => {
      acc[entityName] = results[index];
      return acc;
    },
    {},
  );

  // 5. Pass the fully prepared data to the schema factory and return the schema.
  const schema = dataDependencies
    ? (() => {
        // console.log("Generating schema with available data:", {
        //   entity,
        //   availableEntities: Object.keys(dataDependencies),
        //   operation,
        // });
        return getValidationSchema(
          entity,
          dataDependencies,
          operation,
          editedEntityId,
        );
      })()
    : null;

  return schema;
}
