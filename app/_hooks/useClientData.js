import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useData } from "../_utils/helpers-client";

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
          queryFn: () => useData(entity, id),
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
  // console.log("useClientData id: ", id);

  const queryClient = useQueryClient();

  //check if we find the specific id in the "all" cache first
  const cachedData = useMemo(() => {
    if (id === "all") return undefined;

    const allData = queryClient.getQueryData([entity, "all"]);

    // console.log(`${entity}-allData: `, allData);

    if (allData && Array.isArray(allData)) {
      const record = allData.find((_) => _.id === id);
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
    queryFn: () => useData(entity, id),
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

// const {
//   data: entityList,
//   isLoading,
//   isError,
//   error,
// } = useQuery({
//   queryKey: [entity, "all"],
//   queryFn: () => useDatay, "all"),
//   staleTime: 1000 * 60 * 5, // 5 minutes
//   select: (data) => {
//     if (!Array.isArray(data)) return [];
//     return data.map((_) => ({
//       id: _.id,
//       name: _.name,
//     }));
//   },
// });
