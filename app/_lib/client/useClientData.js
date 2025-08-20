import { generateQueryKeys } from "@/app/_utils/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useClientData({
  entity,

  staleTime = 1000 * 60 * 5, // 5 minutes,
  gcTime = 1000 * 60 * 10, // 10 minutes garbage collection
  select = null,
  // All data fetching parameters go into otherParams - UNIFORM PATTERN
  ...otherParams
}) {
  // console.log("useClientData was called with: ", { entity, ...otherParams });
  const queryClient = useQueryClient();

  // Combine all parameters for the API call - UNIFORM PATTERN
  const apiParams = { entity, id: otherParams.id ?? "all", ...otherParams };

  //check if we find the specific id in the "all" cache first
  const cachedData = useMemo(() => {
    if (apiParams.id === "all") return undefined; //then it's not applicable in this case since we are looking for a specific id

    const allData = queryClient.getQueryData(
      generateQueryKeys({ entity, id: "all" }),
    );

    // console.log(`${entity}-allData: `, allData);

    if (allData && Array.isArray(allData)) {
      const record = allData.find((_) => _.idField === apiParams.id);
      // console.log(`${entity}-record: `, record);
      // const results = {
      //   data: [record],
      //   isLoading: false,
      //   isError: false,
      // };
      return [record];
    }

    return undefined;
  }, [queryClient, entity, otherParams]);

  const results = useQuery({
    queryKey: generateQueryKeys(apiParams),
    queryFn: () => useApiData(apiParams),
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
 * Updated to follow the same parameter pattern as getServerData.
 *
 * @param {string} entity - The name of the entity to fetch (e.g., "itemTrx", "item").
 * @param {...*} otherParams - All other parameters including id, itemId, binId, etc.
 * @returns {Promise<any>} A promise that resolves to the fetched data.
 * @throws {Error} If the network response is not ok.
 */
export async function useApiData({ entity, ...otherParams }) {
  // console.log("useApiData otherParams: ", otherParams);

  if (!entity) throw new Error(`🚨 no entity was provided for useApiData.`);

  // Extract id from otherParams, default to "all"
  // All other parameters become query parameters - UNIFORM PATTERN
  // IMPORTANT: Keep id in queryParams for server-side compatibility
  const { id = "all", ...additionalParams } = otherParams;
  const queryParams = { id, ...additionalParams };
  // console.log("useApiData queryParams: ", queryParams);

  // console.log("useApiData id: ", id);

  let url;

  if (id === "all" || id === null) {
    // Use query parameter style for collections
    // const params = new URLSearchParams()
    // if (options.limit) params.set('limit', options.limit)
    // if (options.type) params.set('type', options.type)
    url = `/api/v1/entities/${entity}`;
    // if (params.toString()) {
    //   url += `?${params}`
    // }
    // Add query parameters if needed
  } else {
    // Use path parameter style for specific IDs
    url = `/api/v1/entities/${entity}/${id}`;
  }

  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    //example [{itemId: 7}, {binId: 23}]
    if ((value !== undefined) & (value !== null))
      params.set(key, value.toString());
  });

  if (params.toString()) {
    url += `?${params}`;
  }

  // console.log("useApiData url: ", url);

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
