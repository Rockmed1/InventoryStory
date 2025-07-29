import { useQueries } from "@tanstack/react-query";
import entityClientConfig from "../_lib/client/entityClientConfig";
import { getClientValidationSchema } from "../_lib/ZodSchemas";
import { useClientData } from "../_utils/helpers-client";

export function useValidationSchema(entity, operation = "create") {
  const { dependencies } = entityClientConfig(entity);
  const allEntities = [entity, ...(dependencies || [])];

  //data fetching
  const queries = useQueries({
    queries: allEntities.map((entityName) => ({
      queryKey: [entityName],
      queryFn: async () => await useClientData(entityName),
      staleTime: 1000 * 60 * 5, // 5 minutes
      select: (data) => {
        if (!Array.isArray(data)) return [];
        return data.map((_) => ({
          id: _.id,
          name: _.name,
        }));
      },
      // Enable garbage collection
      gcTime: 1000 * 60 * 10, // 10 minutes
    })),

    //✨ Combine all query results
    combine: (results) => {
      const isLoading = results.some((result) => result.isLoading);
      const isError = results.some((result) => result.isError);
      const errors = results.filter((r) => r.error).map((r) => r.error);
      const hasData = results.every((result) => result.data !== undefined);

      console.log("isLoading: ", isLoading);
      console.log("isError: ", isError);
      console.log("hasData: ", hasData);
      //Transform results into the expected data structure
      const dataDependencies =
        hasData && !isLoading & !isError
          ? allEntities.reduce((acc, entityName, index) => {
              acc[entityName] = results[index].data || [];
              return acc;
            }, {})
          : null;

      console.log(
        "About to call getClientValidationSchema with:",
        entity,
        dataDependencies,
        operation,
      );
      // pass the data to the validation schema factory
      const schema = dataDependencies
        ? getClientValidationSchema(entity, dataDependencies, operation)
        : null;

      console.log("schema: ", schema);

      return {
        // Core return values
        schema,
        isLoading,
        isError,

        // Enhanced return values
        dataDependencies,
        entities: allEntities,
        errors,

        // Debugging info
        debug: {
          queryStates: results.map((r) => ({
            status: r.status,
            fetchStatus: r.fetchStatus,
            dataUpdatedAt: r.dataUpdatedAt,
          })),
          entityStatus: allEntities.map((entity, i) => ({
            entity,
            loaded: !!results[i].data,
            error: !!results[i].error,
          })),
        },
      };
    },
  });

  return queries;
}
