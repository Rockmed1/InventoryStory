/**
 * SERVER-SIDE CACHE OPTIMIZATION SUGGESTION
 * 
 * Context: Currently, server-side dataServices.js makes separate DB calls for individual item queries
 * even when the "all" cache might already contain that specific record. This mirrors the client-side
 * optimization pattern in useClientData.js where we check the ["item", "all"] cache before making
 * a new query for ["item", id].
 * 
 * Problem: Unnecessary database calls when requesting specific items that might already be cached
 * in the "all" dataset.
 * 
 * Current Client Pattern (useClientData.js):
 * - Check if specific ID exists in cached ["entity", "all"] data
 * - If found, use placeholderData from cache
 * - If not found, make new query for ["entity", id]
 * 
 * Proposed Server Pattern (dataServices.js):
 * - Check if "all" cache exists and contains the specific item
 * - If found, return that item without DB call
 * - If not found, proceed with normal individual query
 */

// OPTION 1: Direct cache check in getItems function
getItems: async (itemId = "all", options = {}) => {
  const { forceRefresh = false, cacheTTL = 300 } = options;

  // If requesting a specific item, try to get it from the "all" cache first
  if (itemId !== "all" && !forceRefresh) {
    // Check if we have the "all" cache
    const allCacheKey = `item-${_org_uuid}`;
    const allCachedData = await unstable_cache(
      async () => {
        // This will return cached data if available, null if not
        return null; // We need a way to peek at cache without executing
      },
      [allCacheKey],
      { tags: [allCacheKey], revalidate: cacheTTL }
    )();

    // If we have all data cached, extract the specific item
    if (allCachedData && Array.isArray(allCachedData)) {
      const specificItem = allCachedData.find(item => item.id === itemId);
      if (specificItem) {
        console.log(`📋 Server cache hit: Found item ${itemId} in "all" cache`);
        return [specificItem]; // Return as array to match expected format
      }
    }
  }

  // Fallback to individual cache or database query
  // ... existing cache logic
};

// OPTION 2: Cache manager approach (RECOMMENDED)
const createCacheManager = (orgUuid) => {
  const cacheStore = new Map(); // In-memory store for this request cycle
  
  return {
    async getFromAllCache(entity, specificId) {
      const allCacheKey = `${entity}-${orgUuid}`;
      
      // Try to get from request-scoped cache first
      if (cacheStore.has(allCacheKey)) {
        const allData = cacheStore.get(allCacheKey);
        return allData.find(item => item.id === specificId);
      }
      
      // Try to get from Next.js cache
      try {
        const allData = await unstable_cache(
          async () => {
            // Return existing cache or null
            const { data } = await supabase.rpc("fn_get_items", {
              _data: { _item_id: null, _org_uuid: orgUuid, _usr_uuid: _usr_uuid },
            });
            return data || [];
          },
          [allCacheKey],
          { tags: [allCacheKey], revalidate: 0 } // Don't revalidate, just check
        )();
        
        if (allData && allData.length > 0) {
          cacheStore.set(allCacheKey, allData); // Store for this request
          return allData.find(item => item.id === specificId);
        }
      } catch (error) {
        // Cache miss or error, continue to individual query
        console.log(`Cache miss for ${entity} all data`);
      }
      
      return null;
    },
    
    setCache(key, data) {
      cacheStore.set(key, data);
    }
  };
};

// Modified getItems with cache manager
getItems: async (itemId = "all", options = {}) => {
  const { forceRefresh = false, cacheTTL = 300 } = options;
  const cacheManager = createCacheManager(_org_uuid);

  // Try cache optimization for specific items
  if (itemId !== "all" && !forceRefresh) {
    const cachedItem = await cacheManager.getFromAllCache("item", itemId);
    if (cachedItem) {
      console.log(`📋 Server cache hit: Found item ${itemId} in "all" cache`);
      return [cachedItem];
    }
  }

  // Proceed with normal caching logic
  if (forceRefresh) {
    revalidateTag(`${itemId ? "item-" + itemId : "item"}-${_org_uuid}`);
  }

  return unstable_cache(
    async () => {
      const filteredData = {
        _item_id: itemId === "all" ? null : itemId,
        ..._data,
      };

      const { data, error } = await supabase.rpc("fn_get_items", {
        _data: filteredData,
      });
      
      if (error) {
        console.error(error);
        throw new Error("Item(s) could not be loaded.");
      }
      
      const result = data || [];
      
      // If we got "all" data, cache it for future specific queries
      if (itemId === "all") {
        cacheManager.setCache(`item-${_org_uuid}`, result);
      }
      
      return result;
    },
    [`${itemId ? "item-" + itemId : "item"}-${_org_uuid}`],
    {
      tags: [`${itemId ? "item-" + itemId : "item"}-${_org_uuid}`],
      revalidate: cacheTTL,
    },
  )();
},

/**
 * BENEFITS:
 * 1. Reduced DB calls: If "all" cache exists and contains the item, no DB query needed
 * 2. Consistent with client pattern: Same optimization strategy
 * 3. Fallback safety: Still works if cache miss occurs
 * 4. Performance: Faster response times for individual item requests
 * 
 * CHALLENGES:
 * - Next.js unstable_cache doesn't have direct "peek" functionality
 * - Need to handle cache invalidation properly
 * - Request-scoped caching helps but adds complexity
 * 
 * IMPLEMENTATION PRIORITY: Medium - Good optimization but not critical for core functionality
 */