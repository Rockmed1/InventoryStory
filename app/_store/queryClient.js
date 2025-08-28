import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000, //garbage collection time
      },
      dehydrate: {
        // This is the key setting for streaming with HydrationBoundary
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: (error) => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false;
        },
      },
    },
  });
}

// Map to store QueryClient instances per organization
const orgQueryClients = new Map();

export function getQueryClient(orgId = null) {
  if (isServer || !orgId) {
    // Server: always make a new query client
    // Default client for both server and no-org cases
    return makeQueryClient(); // Default client
  } else {
    // Browser: get org-specific client
    if (!orgQueryClients.has(orgId)) {
      orgQueryClients.set(orgId, makeQueryClient());
    }
    return orgQueryClients.get(orgId);
  }
}

// Optional: Cleanup function for when user logs out
export function clearOrgQueryClient(org_uuid) {
  if (orgQueryClients.has(org_uuid)) {
    const client = orgQueryClients.get(org_uuid);
    client.clear(); // Clear all cached data
    orgQueryClients.delete(org_uuid);
  }
}
// // Improvement 1: Smarter Client Cache TTL

// // Current: Same TTL for all data
// // staleTime: 1 * 60 * 1000, // 1 minute

// // Better: Entity-specific TTL
// const getStaleTime = (entity) => {
//   switch (entity) {
//     case "item":
//       return 2 * 60 * 1000; // Items change frequently
//     case "location":
//       return 10 * 60 * 1000; // Locations rarely chan
//     case "trxDirection":
//       return Infinity; // Static data
//     default:
//       return 5 * 60 * 1000;
//   }
// };

// // Improvement 2: Background Refresh on Org Return

// // When returning to previous org, refresh stale data in background
// const queryClient = useMemo(() => {
//   if (orgChanged && existingOrgClient) {
//     // Mark stale data for background refresh
//     existingOrgClient.invalidateQueries({
//       predicate: (query) => {
//         const age = Date.now() - query.state.dataUpdatedAt;
//         return age > 5 * 60 * 1000; // 5 minutes
//       },
//     });
//   }
//   return existingOrgClient;
// }, [_org_uuid]);

// //Improvement 3: Selective Cache Clearing

// // Instead of keeping all org caches forever
// export function clearOldOrgCaches() {
//   const maxCaches = 3; // Keep last 3 orgs
//   if (orgQueryClients.size > maxCaches) {
//     const oldestOrg =
//       /* logic to find oldest */
//       orgQueryClients.delete(oldestOrg);
//   }
// }
