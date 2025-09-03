"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import useClientData from "../_lib/data/client/useClientData";

export function useUrlParam(param) {
  // console.log("useUrlParam: ", param);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathName = usePathname();

  const paramValue = useMemo(() => {
    return searchParams.get(param);
  }, [searchParams]);

  const toggle = useCallback(
    (value) => {
      const params = new URLSearchParams(searchParams);

      if (paramValue === value.toString()) {
        params.delete(param);
      } else {
        params.set(param, value.toString());
      }

      router.replace(`${pathName}?${params.toString()}`, { scroll: false });
    },
    [paramValue, router, pathName],
  );

  return { paramValue, toggle };
  // return useMemo(() => ({ paramValue, toggle }), [paramValue, toggle]);
}

export function useSyncRedirectUrl() {
  let { paramValue: redirect_url } = useUrlParam("redirect_url");

  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

  if (redirect_url === baseUrl) {
    redirect_url = "/dashboard";
  }

  const encodedUrl = encodeURIComponent(redirect_url);

  const afterSignInUrl = `api/v1/auth/clerk-sync${redirect_url ? `?return_url=${encodedUrl}` : ""}`;

  // console.log(
  //   "redirect_url: ",
  //   redirect_url,
  //   "afterSignInUrl: ",
  //   afterSignInUrl,
  // );

  return afterSignInUrl;
}

export function useTrxDirectionId(trxTypeId) {
  const { data: trxTypeData } = useClientData({
    entity: "trxType",
    id: trxTypeId,
    options: {
      enabled: !!trxTypeId, // Only fetch if trxTypeId is not null/undefined
      // staleTime: 0, // No caching
      // gcTime: 0, // No garbage collection
      // refetchOnMount: true,
      // refetchOnWindowFocus: false,
    },
  });

  const trxDirectionId = useMemo(() => {
    if (!trxTypeId || !trxTypeData || !Array.isArray(trxTypeData)) return null;

    const selectedTrxType = trxTypeData.find(
      (row) => row.idField === trxTypeId,
    );

    return selectedTrxType?.trxDirectionId || null;
  }, [trxTypeId, trxTypeData]);

  return trxDirectionId;
}

export function useCurrentQoh({ itemId, binId }) {
  // console.log("useCurrentQoh was called with: ", { itemId, binId });

  const { data: QOH } = useClientData({
    entity: "itemQoh",
    itemId,
    binId,
    options: {
      enabled: !!(itemId && binId),
      staleTime: 0,
      refetctOnWindowFocus: false,
    },
  });

  // console.log("QOH: ", QOH);
  return QOH || 0;
}
