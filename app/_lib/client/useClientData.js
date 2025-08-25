import { generateQueryKeys } from "@/app/_utils/helpers";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useClientData({
  entity,
  options = {},
  ...otherParams
}) {
  const {
    staleTime = 1000 * 60 * 5, // 5 minutes
    gcTime = 1000 * 60 * 10, // 10 minutes
    select = null,
    enabled = true,
    refetchOnWindowFocus = true,
    ...additionalReactQueryOptions
  } = options;

  const queryClient = useQueryClient();

  const apiParams = { entity, ...otherParams, id: otherParams.id ?? "all" };

  // console.log("apiParams: ", apiParams);
  const cachedData = useMemo(() => {
    if (apiParams.id === "all") return undefined;

    const allData = queryClient.getQueryData(
      generateQueryKeys({ entity, id: "all" }),
    );

    if (allData && Array.isArray(allData)) {
      const record = allData.find((_) => _.idField === apiParams.id);
      // console.log("record: ", record);
      return record ? [record] : undefined;
    }

    return undefined;
  }, [queryClient, entity, otherParams]);

  const results = useQuery({
    queryKey: generateQueryKeys(apiParams),
    queryFn: () => useApiData(apiParams),
    staleTime,
    gcTime,
    select,
    enabled,
    refetchOnWindowFocus,
    ...additionalReactQueryOptions,
    placeholderData: cachedData,
  });

  // If the query is disabled, override the data to be undefined
  // to prevent cached data from being returned.
  if (enabled === false) {
    return { ...results, data: undefined };
  }

  return results;
}

export async function useApiData({ entity, ...otherParams }) {
  if (!entity) throw new Error(`🚨 no entity was provided for useApiData.`);

  // console.log("useApiData was called with: ", { entity, ...otherParams });
  const { id = "all", ...additionalParams } = otherParams;
  const queryParams = { id, ...additionalParams };

  let url;
  // if (id === "all" || id === null) {
  //   url = `/api/v1/entities/${entity}`;
  // }
  // else {
  //   url = `/api/v1/entities/${entity}/${id}`;
  // }
  url = `/api/v1/entities/${entity}`;

  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, value.toString());
    }
  });

  if (params.toString()) {
    url += `?${params}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    const errorPayload = await res.json();
    const errorMessage =
      errorPayload.error || errorPayload.message || "Failed to fetch data";
    throw new Error(errorMessage);
  }

  const responseData = await res.json();

  return responseData;
}
