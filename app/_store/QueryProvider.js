"use client";
// Since QueryClientProvider relies on useContext under the hood, we have to put 'use client' on top
import { useOrganization } from "@clerk/nextjs";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "./queryClient";

export default function QueryProvider({ children }) {
  const { organization, isLoaded } = useOrganization();

  console.log(organization);

  // Handle loading state
  if (!isLoaded) {
    const queryClient = getQueryClient(); // Default client during loading
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  // Get orgId from Clerk (use Clerk's org ID directly)
  const orgId = organization?.id;
  const queryClient = getQueryClient(orgId);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
