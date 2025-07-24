import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";
import UseAuth from "../_hooks/useAuth";

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

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: get org-specific client
    const { _org_uuid } = UseAuth();

    if (!orgQueryClients.has(_org_uuid)) {
      orgQueryClients.set(_org_uuid, makeQueryClient());
    }

    return orgQueryClients.get(_org_uuid);
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
