import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export function clientEntityConfig(entity, id = "all") {
  const ENTITY_CONFIG = {
    item: {
      label: "Item",
      displayName: "Item",
      get: "getItems",
      dependencies: ["itemClass", id],
      clientQueryOptions: () =>
        queryOptions({
          queryKey: [entity, id ?? "all"],
          queryFn: () => useApiData(entity, id),
          staleTime: staleTime,
        }),
    },
  };

  const config = ENTITY_CONFIG[entity];

  return config;
}

const queryKeys = {
  //queryKeys factory
};

export default function useClientData({
  entity,
  id = "all",
  staleTime = 1000 * 60 * 5, // 5 minutes,
  gcTime = 1000 * 60 * 10, // 10 minutes garbage collection
  select = null,
}) {
  // console.log("useClientData entity: ", entity);
  // console.log("useClientDataidField: ", id);

  const queryClient = useQueryClient();

  //check if we find the specific id in the "all" cache first
  const cachedData = useMemo(() => {
    if (id === "all") return undefined;

    const allData = queryClient.getQueryData([entity, "all"]);

    // console.log(`${entity}-allData: `, allData);

    if (allData && Array.isArray(allData)) {
      const record = allData.find((_) => _.idField === id);
      // console.log(`${entity}-record: `, record);
      // const results = {
      //   data: [record],
      //   isLoading: false,
      //   isError: false,
      // };
      return [record];
    }

    return undefined;
  }, [queryClient, entity, id]);

  const results = useQuery({
    queryKey: [entity, id],
    queryFn: () => useApiData(entity, id),
    staleTime: staleTime,
    gcTime,
    select,
    //Show cached data immediately
    placeholderData: cachedData,
    //RQ will handle staleness based on the original cache
  });

  // console.log("useClientData debug:", {
  //   entity,
  //   id,
  //   cachedData,
  //   resultsData: results.data,
  //   isCachedDataArray: Array.isArray(cachedData),
  //   isResultsDataArray: Array.isArray(results.data),
  // });

  // console.log(`${entity}-results: `, results.data);
  return results;
}

/**
 * A generic, client-side data fetching function.
 * It constructs a URL to the optimized API routes and fetches data.
 *
 * @param {string} entity - The name of the entity to fetch (e.g., "itemTrx", "item").
 * @param {string | number} [id] - An optional ID to fetch a specific record.
 * @param {object} [options] - Additional options like type, limit, etc.
 * @returns {Promise<any>} A promise that resolves to the fetched data.
 * @throws {Error} If the network response is not ok.
 */
export async function useApiData(entity, id = "all" /* , options = {} */) {
  let url;

  if (id === "all" || id === undefined) {
    // Use query parameter style for collections
    // const params = new URLSearchParams()
    // if (options.limit) params.set('limit', options.limit)
    // if (options.type) params.set('type', options.type)
    url = `/api/v1/entities/${entity}`;
    // if (params.toString()) {
    //   url += `?${params}`
    // }
  } else {
    // Use path parameter style for specific IDs
    url = `/api/v1/entities/${entity}/${id}`;

    // Add query parameters if needed
    // const params = new URLSearchParams()
    // if (options.type) params.set('type', options.type)
    // if (params.toString()) {
    //   url += `?${params}`
    // }
  }

  // console.log("url: ", url);

  const res = await fetch(url);

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    const errorPayload = await res.json();
    const errorMessage =
      errorPayload.error || errorPayload.message || "Failed to fetch data";
    throw new Error(errorMessage);
  }

  return res.json();
}

// const {
//   data: entityList,
//   isLoading,
//   isError,
//   error,
// } = useQuery({
//   queryKey: [entity, "all"],
//   queryFn: () => useApiDatay, "all"),
//   staleTime: 1000 * 60 * 5, // 5 minutes
//   select: (data) => {
//     if (!Array.isArray(data)) return [];
//     return data.map((_) => ({
//      idField: _.idField,
//       nameField: _.name,
//     }));
//   },
// });
