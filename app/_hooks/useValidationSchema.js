import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import entityClientConfig from "../_lib/client/entityClientConfig";
import { getValidationSchema } from "../_lib/getValidationSchema";
import { useData } from "../_utils/helpers-client";

export function useValidationSchema(
  entity,
  operation = "create",
  editedEntityId = null,
) {
  // 1. Get the config for the primary entity.
  const entityConfig = useMemo(() => entityClientConfig(entity), [entity]);

  // 2. Determine the unique set of entities to fetch.
  const entitiesToFetch = useMemo(() => {
    const dependencies = new Set([entity]); // Always include the primary entity
    if (entityConfig.foreignKeys) {
      for (const remoteConfig of Object.values(entityConfig.foreignKeys)) {
        const remoteEntity = Object.keys(remoteConfig)[0];
        dependencies.add(remoteEntity);
      }
    }
    return Array.from(dependencies);
  }, [entity, entityConfig]);

  // 3. Fetch data for all entities, selecting only the required fields.
  const results = useQueries({
    queries: entitiesToFetch.map((entityName) => {
      const fieldsToSelect =
        entityName !== entity ? new Set(["id", "name"]) : null;
      // Find which field this dependency is referenced by. add the remote primary key field to the
      for (const remoteConfig of Object.values(entityConfig.foreignKeys)) {
        const [remoteEntity, remotePkField] = Object.entries(remoteConfig)[0];
        if (remoteEntity === entityName) {
          fieldsToSelect.add(remotePkField);
        }
      }

      // console.log("useValidationSchema entity: ", entity);
      // console.log("useValidationSchema entityName: ", entityName);
      // console.log(
      //   "useValidationSchema entity === entityName :",
      //   entity === entityName,
      // );

      // for update grab one record only for the main Entity . this is not needed if we are grabbing the whole set for name unique check
      // const isWithId = entity === entityName ? id : "all";

      const select = fieldsToSelect
        ? (data) => {
            if (!Array.isArray(data)) return [];
            //Select the required fields only
            const selectFields = Array.from(fieldsToSelect);
            return data.map((row) => {
              const rows = {};
              for (const field of selectFields) {
                if (row.hasOwnProperty(field)) {
                  //only add the fields that are needed
                  rows[field] = row[field];
                }
              }
              return rows;
            });
          }
        : undefined;

      return {
        queryKey: [entityName, "all"],
        queryFn: async () => await useData(entityName), //useData directly not useClientData
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
        select,
      };
    }),

    // 4. Combine results into a single, rich return object.
    combine: (results) => {
      const isLoading = results.some((r) => r.isLoading);
      const isError = results.some((r) => r.isError);
      const errors = results.map((r) => r.error).filter(Boolean);
      const isSuccess = results.every((r) => r.isSuccess);

      // Don't wait for ALL queries to succeed, use available data
      const availableData = {};
      entitiesToFetch.forEach((entityName, index) => {
        if (results[index].isSuccess && results[index].data) {
          availableData[entityName] = results[index].data;
        }
      });

      // Only return null if NO data is available
      const dataDependencies =
        Object.keys(availableData).length > 0 ? availableData : null;

      const schema = dataDependencies
        ? (() => {
            // console.log("Generating schema with available data:", {
            //   entity,
            //   availableEntities: Object.keys(dataDependencies),
            //   operation,
            //   // id: id,
            // });
            return getValidationSchema(
              entity,
              dataDependencies,
              operation,
              editedEntityId,
            );
          })()
        : null;

      // console.log("Query debug:", {
      //   entitiesToFetch,
      //   queryStatuses: results.map((r, i) => ({
      //     entity: entitiesToFetch[i],
      //     status: r.status,
      //     error: r.error?.message,
      //     data: r.data?.length,
      //   })),
      // });

      return {
        schema,
        isLoading,
        isError,
        dataDependencies,
        entities: entitiesToFetch,
        errors,
        debug: {
          queryStates: results.map((r) => ({
            status: r.status,
            fetchStatus: r.fetchStatus,
          })),
          entityStatus: entitiesToFetch.map((e, i) => ({
            entity: e,
            status: results[i].status,
          })),
        },
      };
    },
  });

  return results;
}
