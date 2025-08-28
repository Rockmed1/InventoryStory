# Data Fetching Options Refactor Implementation Plan

## Overview

This document outlines the implementation plan for refactoring `useClientData`, `getServerData`, and `createDataService` to accept an `options` parameter that handles query parameters for both client-side (React Query options) and server-side (cache options) configurations.

## Architecture Principles

1. **Clean Separation**: Client options stay on client, server options stay on server
2. **API Routes Unchanged**: No complexity added to API layer - they only handle data parameters
3. **Extensible Options**: Support for additional options not explicitly listed via spread operator
4. **Default Values**: Built-in defaults with override capability
5. **Consistent Pattern**: All data service methods follow the same pattern

---

## Phase 1: Refactor `useClientData` (Client Options Handling)

### Current Implementation

```javascript
export default function useClientData({
  entity,
  staleTime = 1000 * 60 * 5,
  gcTime = 1000 * 60 * 10,
  select = null,
  ...otherParams
})
```

### New Implementation

```javascript
export default function useClientData({
  entity,
  options = {},
  ...otherParams
}) {
  // Extract client-specific options with defaults
  const {
    staleTime = 1000 * 60 * 5,
    gcTime = 1000 * 60 * 10,
    select = null,
    enabled = true,
    refetchOnWindowFocus = true,
    ...additionalReactQueryOptions // Allow any other React Query options
  } = options;

  const queryClient = useQueryClient();

  // Only data parameters go to API - NO options
  const apiParams = { entity, ...otherParams };

  const cachedData = useMemo(() => {
    // ... existing cache logic
  }, [queryClient, entity, otherParams]);

  const results = useQuery({
    queryKey: generateQueryKeys(apiParams),
    queryFn: () => useApiData(apiParams), // Only data params, no options
    staleTime,
    gcTime,
    select,
    enabled,
    refetchOnWindowFocus,
    ...additionalReactQueryOptions, // Spread any additional React Query options
    placeholderData: cachedData,
  });

  return results;
}
```

---

## Phase 2: Update `getServerData` (Pass Options to createDataService)

### Current Implementation

```javascript
export async function getServerData({ entity, ...otherParams }) {
  const dataService = await createDataService();
  const { get } = entityServerOnlyConfig(entity);
  const entityData = await dataService[get](otherParams);
  return entityData;
}
```

### New Implementation

```javascript
export async function getServerData({ entity, options = {}, ...otherParams }) {
  if (!entity) throw new Error(`🚨 no entity was provided for getServerData.`);

  // Pass options to createDataService
  const dataService = await createDataService(options);
  const { get } = entityServerOnlyConfig(entity);

  if (!get) {
    throw new Error(
      `Data service method not found for entity '${entity}' in entityServerOnlyConfig.`,
    );
  }

  // Pass both data params and options to the specific method
  const entityData = await dataService[get]({ ...otherParams, options });
  return entityData;
}
```

---

## Phase 3: Update `createDataService` (Accept and Pass Server Options)

### New Implementation

```javascript
export async function createDataService(globalOptions = {}) {
  // Global server options with defaults
  const {
    forceRefresh: globalForceRefresh = false,
    cacheTTL: globalCacheTTL = 300,
    skipCache: globalSkipCache = false,
    ...additionalGlobalOptions
  } = globalOptions;

  // ... existing authentication logic

  return {
    getItems: async (params) => {
      const { id: itemId = "all", options = {}, ...otherParams } = params;

      // Merge global options with method-specific options
      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`item-${_org_uuid}-${itemId}`);
      }

      if (skipCache) {
        // Direct database call without cache
        const filteredData = {
          _item_id: itemId === "all" ? null : itemId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_items", {
          _data: filteredData,
        });
        if (error) throw new Error("Item(s) could not be loaded.");
        return data || [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_id: itemId === "all" ? null : itemId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_items", {
            _data: filteredData,
          });
          if (error) throw new Error("Item(s) could not be loaded.");
          return data || [];
        },
        [`item-${_org_uuid}-${itemId}`],
        {
          tags: [`item-${_org_uuid}-${itemId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions, // Allow additional cache options
        },
      )();
    },

    getLocations: async (params) => {
      const { id: locationId = "all", options = {}, ...otherParams } = params;

      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      // ... similar implementation for locations
    },

    // ... all other methods follow the same pattern
  };
}
```

---

## Phase 4: Update All Data Service Methods

Each method (`getItems`, `getLocations`, `getBins`, `getItemClasses`, `getMarkets`, `getMarketTypes`, `getTrxTypes`, `getTrxDirections`, `getItemQoh`, `getItemTrx`, `getItemTrxDetails`) needs to follow this pattern:

### Template for Data Service Methods

```javascript
getItemClasses: async (params) => {
  const { id: itemClassId = "all", options = {}, ...otherParams } = params;

  // Server options with defaults + ability to accept additional options
  const {
    forceRefresh = globalForceRefresh,
    cacheTTL = globalCacheTTL,
    skipCache = globalSkipCache,
    ...additionalMethodOptions
  } = { ...additionalGlobalOptions, ...options };

  if (forceRefresh) {
    revalidateTag(`itemClass-${_org_uuid}-${itemClassId}`);
  }

  return unstable_cache(
    async () => {
      const filteredData = {
        _item_class_id: itemClassId === "all" ? null : itemClassId,
        ..._data,
        ...otherParams // Include any additional data parameters
      };
      const { data, error } = await supabase.rpc("fn_get_items_classes", {
        _data: filteredData,
      });
      if (error) throw new Error("ItemClass could not be loaded.");
      return data || [];
    },
    [`itemClass-${_org_uuid}-${itemClassId}`],
    {
      tags: [`itemClass-${_org_uuid}-${itemClassId}`],
      revalidate: cacheTTL,
      ...additionalMethodOptions
    },
  )();
},
```

### Special Case: `getItemQoh`

```javascript
getItemQoh: async (params) => {
  const { itemId, binId, options = {}, ...otherParams } = params;

  if (!itemId || !binId)
    throw new Error(
      `🚨 itemId and binId are required for getItemQoh. received itemId: ${itemId} and binId: ${binId}`,
    );

  const {
    forceRefresh = globalForceRefresh,
    cacheTTL = globalCacheTTL,
    skipCache = globalSkipCache,
    ...additionalMethodOptions
  } = { ...additionalGlobalOptions, ...options };

  if (forceRefresh) {
    revalidateTag(`itemQoh-${_org_uuid}-${itemId}-${binId}`);
  }

  return unstable_cache(
    async () => {
      const mappedFields = getEntityFieldMapping("itemQoh");
      const dbReadyData = {
        [mappedFields["itemId"]]: itemId,
        [mappedFields["binId"]]: binId,
        ..._data,
        ...otherParams
      };

      const { data, error } = await supabase.rpc("fn_get_item_qoh", {
        _data: dbReadyData,
      });

      if (error) throw new Error("Item QOH could not be loaded.");
      return data || [];
    },
    [`itemQoh-${_org_uuid}-${itemId}-${binId}`],
    {
      tags: [`itemQoh-${_org_uuid}-${itemId}-${binId}`],
      revalidate: cacheTTL,
      ...additionalMethodOptions
    },
  )();
},
```

---

## Phase 5: API Routes Stay Clean (No Options Handling)

API routes remain unchanged as they only handle data parameters:

```javascript
// app/api/v1/entities/[entity]/route.js
export async function GET(request, { params }) {
  const { entity } = await params;
  const { searchParams } = new URL(request.url);
  const allParams = Object.fromEntries(searchParams);

  // Only pass data parameters - no options filtering needed
  const data = await getServerData({ entity, ...allParams });

  return Response.json(data, {
    headers: {
      "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

```javascript
// app/api/v1/entities/[entity]/[id]/route.js
export async function GET(request, { params }) {
  const { entity, id } = await params;
  const { searchParams } = new URL(request.url);
  const allParams = Object.fromEntries(searchParams);

  // Only pass data parameters - no options filtering needed
  const data = await getServerData({ entity, id, ...allParams });

  return Response.json(data, {
    headers: {
      "Cache-Control": "private, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

---

## Phase 6: Usage Examples

### Client Side Usage

#### Basic Usage

```javascript
useClientData({ entity: "item", id: "all" });
```

#### With Client Options

```javascript
useClientData({
  entity: "item",
  id: "all",
  options: {
    staleTime: 30000,
    gcTime: 60000,
    select: (data) => data.slice(0, 10),
    enabled: false, // Any React Query option
    refetchInterval: 5000, // Additional options not explicitly listed
    refetchOnWindowFocus: false,
  },
});
```

#### Complex Data Parameters with Options

```javascript
useClientData({
  entity: "itemQoh",
  itemId: 7,
  binId: 23,
  options: {
    staleTime: 10000,
    enabled: itemId && binId, // Conditional fetching
  },
});
```

### Server Side Usage

#### Basic Usage

```javascript
getServerData({ entity: "item", id: "all" });
```

#### With Server Options

```javascript
getServerData({
  entity: "item",
  id: "all",
  options: {
    forceRefresh: true,
    cacheTTL: 600,
    skipCache: false,
    customCacheKey: "special-key", // Additional options not explicitly listed
  },
});
```

#### With Global Server Options

```javascript
const dataService = await createDataService({
  forceRefresh: true,
  cacheTTL: 1200,
  skipCache: false,
});
```

#### Complex Server Usage

```javascript
getServerData({
  entity: "itemQoh",
  itemId: 7,
  binId: 23,
  options: {
    forceRefresh: true,
    cacheTTL: 60, // Short cache for real-time data
  },
});
```

---

## Migration Strategy

### Step 1: Core Infrastructure Updates

1. **Update `createDataService`** to accept global options parameter
2. **Update all data service methods** (`getItems`, `getLocations`, etc.) to handle options parameter
3. **Update `getServerData`** to pass options to createDataService

### Step 2: Client Infrastructure Updates

4. **Update `useClientData`** to handle client options parameter
5. **Test basic functionality** with new options structure

### Step 3: Component Migration

6. **Update all client components** to use new options structure
7. **Update server components** and validation hooks
8. **Update DropDown and other UI components**

### Step 4: Testing & Validation

9. **Comprehensive testing** of both client and server options
10. **Performance testing** to ensure no regressions
11. **Update documentation** and examples

---

## Files to Update

### Core Files

- `app/_lib/client/useClientData.js`
- `app/_utils/helpers-server.js`
- `app/_lib/server/dataServices.js`

### Component Files (Examples)

- `app/_components/client/AddItemTrxForm.js`
- `app/_components/_ui/client/DropDown.js`
- `app/_hooks/useClientValidationSchema.js`
- All form components using `useClientData`

### Server Files

- `app/_lib/validation/server/getServerValidationSchema.js`
- All server components using `getServerData`

---

## Benefits

1. **Unified Interface**: Both client and server use consistent `options` parameter
2. **Separation of Concerns**: Data parameters vs configuration options clearly separated
3. **Extensibility**: Easy to add new options without changing function signatures
4. **Clean API Layer**: API routes remain simple and focused on data
5. **Maintainability**: Centralized option handling logic
6. **Flexibility**: Support for any React Query or cache option via spread operator
7. **Default Values**: Sensible defaults with easy override capability

---

## Backward Compatibility

During the transition period, consider adding a compatibility layer:

```javascript
export default function useClientData({
  entity,
  // Legacy parameters (deprecated)
  staleTime,
  gcTime,
  select,
  // New structure
  options = {},
  ...otherParams
}) {
  // Handle legacy usage
  const finalOptions = {
    ...options,
    ...(staleTime !== undefined && { staleTime }),
    ...(gcTime !== undefined && { gcTime }),
    ...(select !== undefined && { select }),
  };

  // Show deprecation warning
  if (staleTime !== undefined || gcTime !== undefined || select !== undefined) {
    console.warn(
      "Direct staleTime, gcTime, select parameters are deprecated. Use options object instead.",
    );
  }

  // ... rest of implementation with finalOptions
}
```

This refactor will create a clean, extensible architecture while maintaining the uniform parameter pattern established earlier.
