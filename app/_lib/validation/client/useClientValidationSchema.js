import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  generateQueryKeys,
  getEntityAndDependencies,
} from "../../../_utils/helpers";
import { useApiData } from "../../data/client/useClientData";
import { buildValidationSchema } from "../buildValidationSchema";

//Data preparation wrapper for getValidationScheme
export function useClientValidationSchema({
  entity,
  operation = "create",
  editedEntityId = null,
}) {
  // console.log(`📝 useValidation was called with: `, {
  //   entity,
  //   operation,
  //   editedEntityId,
  // });

  // 2. Determine the unique set of entities to fetch.
  const entitiesToFetch = useMemo(() => {
    return getEntityAndDependencies(entity);
  }, [entity]);

  // console.log("useClientValidationSchema entities to fetch: ", entitiesToFetch);
  // 3. Fetch data for all entities, selecting only the required fields.
  const results = useQueries({
    queries: entitiesToFetch.map((entitytoFetch) => {
      const fieldsToSelect =
        entitytoFetch !== entity
          ? new Set(["idField", "nameField", "trxDirectionId"])
          : null;

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
              return buildValidationSchema({
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
