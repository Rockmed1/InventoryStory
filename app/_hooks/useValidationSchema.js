import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useApiData } from "../_lib/client/useClientData";
import { getValidationSchema } from "../_lib/validation/getValidationSchema";
import { generateQueryKeys, getEntityAndDependencies } from "../_utils/helpers";

//Data preparation wrapper for getValidationScheme
export function useValidationSchema({
  entity,
  operation = "create",
  editedEntityId = null,
}) {
  // console.log(`📝 useValidation was called with: `, {
  //   entity,
  //   operation,
  //   editedEntityId,
  // });

  // 1. Get the config for the primary entity.
  // const entityConfig = useMemo(() => entityClientConfig(entity), [entity]);

  // 2. Determine the unique set of entities to fetch.
  const entitiesToFetch = useMemo(() => {
    return getEntityAndDependencies(entity);
  }, [entity]);

  // console.log("useValidationSchema entities to fetch: ", entitiesToFetch);
  // 3. Fetch data for all entities, selecting only the required fields.
  const results = useQueries({
    queries: entitiesToFetch.map((entitytoFetch) => {
      const fieldsToSelect =
        entitytoFetch !== entity
          ? new Set(["idField", "nameField", "trxDirectionId"])
          : null;
      // Find which field this dependency is referenced by. add the remote primary key field to the entity
      // for (const remoteConfig of Object.values(entityConfig.foreignKeys)) {
      //   const [remoteEntity, remotePkField] = Object.entries(remoteConfig)[0];
      //   if (remoteEntity === entitytoFetch) {
      //     fieldsToSelect.add(remotePkField);
      //   }
      // }

      // console.log("useValidationSchema entity: ", entity);
      // console.log("useValidationSchema entitytoFetch: ", entitytoFetch);
      // console.log(
      //   "useValidationSchema entity === entitytoFetch :",
      //   entity === entitytoFetch,
      // );
      // console.log("useValidationSchema fields to select: ", fieldsToSelect);

      // for update grab one record only for the main Entity . this is not needed if we are grabbing the whole set for name unique check
      // const isWithId = entity === entitytoFetch ? id : "all";

      const select = fieldsToSelect
        ? (data) => {
            // console.log("select fieldsToSelect data: ", data);

            if (!Array.isArray(data)) return [];

            //Select the required fields only
            const selectFields = Array.from(fieldsToSelect);

            // console.log("select selectFields data: ", selectFields);

            return data.map((row) => {
              const rows = {};
              for (const field of selectFields) {
                // console.log("field: ", field);
                // console.log(
                // "row.hasOwnProperty(field):",
                // row.hasOwnProperty(field),
                // );
                if (row.hasOwnProperty(field)) {
                  //only add the fields that are needed
                  rows[field] = row[field];
                }
              }
              // console.log("rows: ", rows);
              return rows;
            });
          }
        : undefined; //this will select all fields

      const apiParam = { entity: entitytoFetch, id: "all" };

      return {
        queryKey: generateQueryKeys(apiParam),
        queryFn: () => useApiData(apiParam), //useApiData directly not useClientData
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

      // console.log("useValidation combine entitiesTofetch: ", entitiesToFetch);

      // console.log("useValidation combine results: ", results);
      const availableData = {};
      entitiesToFetch.forEach((entitytoFetch, index) => {
        // console.log(
        //   `useValidation combine for ${entitytoFetch} - results[index=${index}]: `,
        //   results[index],
        // );
        // if (results[index].isError) {
        //   console.error(
        //     `Error loading ${entitytoFetch}:`,
        //     results[index].error,
        //   );
        // }

        // if (isSuccess)
        // Don't wait for ALL queries to succeed, use available data
        if (results[index].isSuccess && results[index].data) {
          availableData[entitytoFetch] = results[index].data;
        }
      });

      // console.log("useValidation availableData: ", availableData);
      // Only return null if NO data is available
      const dataDependencies =
        Object.keys(availableData).length > 0 ? availableData : null;

      // console.log(
      //   "useValidation ",
      //   new Date().getMilliseconds(),
      //   "dataDependencies: ",
      //   dataDependencies,
      //   "isSuccess: ",
      //   isSuccess,
      //   "isLoading: ",
      //   isLoading,
      //   "isError: ",
      //   isError,
      //   "results: ",
      //   results,
      // );

      const schema =
        isSuccess &&
        dataDependencies &&
        Object.keys(dataDependencies).length === entitiesToFetch.length
          ? (() => {
              // console.log("Generating schema with available data:", {
              //   entity,
              //   availableEntities: Object.keys(dataDependencies),
              //   operation,
              //   //idField: id,
              // });
              return getValidationSchema({
                entity,
                dataDependencies,
                operation,
                editedEntityId,
                universalDataService: useApiData, //injecting the data fetching mechanism for the client
              });
            })()
          : null; //if any data is missing the schema is set to null

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
