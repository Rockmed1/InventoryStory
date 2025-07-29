import { queryOptions, useQuery } from "@tanstack/react-query";
import { useClientData } from "../_utils/helpers-client";

export function clientEntityConfig(entity) {
  const ENTITY_CONFIG = {
    item: {
      label: "Item",
      displayName: "Item",
      get: "getItems",
      dependencies: ["itemClass"],
      clientQueryOptions: () =>
        queryOptions({
          queryKey: [entity, id ?? "all"],
          queryFn: () => useClientData(entity, id),
          staleTime: staleTime,
        }),
    },
  };

  const config = ENTITY_CONFIG[entity];

  return config;
}

const queryKeys = {};

export const useData = (entity, id, staleTime = 5 * 60 * 1000) =>
  useQuery({
    queryKey: [entity, id ?? "all"],
    queryFn: () => useClientData(entity, id),
    staleTime: staleTime,
  });
