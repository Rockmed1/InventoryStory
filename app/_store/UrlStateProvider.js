"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, use, useCallback, useMemo } from "react";

const UrlStateContext = createContext();

function useUrlParam(param) {
  console.log("useUrlParam: ", param);

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

export function UrlStateProvider({ param, children }) {
  console.log("UrlStateProvider: ", param);
  const urlState = useUrlParam(param);

  return (
    <UrlStateContext.Provider value={urlState}>
      {children}
    </UrlStateContext.Provider>
  );
}

export function useUrlParamContext() {
  const context = use(UrlStateContext);
  if (context === undefined) {
    throw new Error("useUrlParamContext must be used within UrlStateProvider");
  }
  return context;
}
