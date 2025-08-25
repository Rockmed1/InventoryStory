"server-only";

import { getEntityFieldMapping } from "@/app/_utils/helpers-server";
import { revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { appContextSchema } from "../validation/getValidationSchema";
import { supabase } from "./supabase";

//!Factory pattern is used as it is better for multi-tennant applications caching to ensure org scoped operations

export async function createDataService(globalOptions = {}) {
  // if (!org_uuid) throw new Error("Organization UUID is required");

  //1- authenticate the user
  const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";
  const session = { _org_uuid: ORG_UUID, _usr_uuid: USR_UUID };
  // const session = {}; for testing

  // const session = await auth();

  if (!session?._org_uuid || !session?._usr_uuid) return redirect("/");
  const { _usr_uuid, _org_uuid } = session;

  // if (_org_uuid !== org_uuid) throw new Error("Unauthorized 🚫"); //unauthorized

  let _data = { _org_uuid, _usr_uuid };

  const validatedAppContext = await appContextSchema.safeParseAsync({
    _org_uuid,
    _usr_uuid,
  });

  if (!validatedAppContext.success) {
    return {
      error: z.prettifyError(validatedAppContext.error),
    };
  }

  const {
    forceRefresh: globalForceRefresh = false,
    cacheTTL: globalCacheTTL = 300,
    skipCache: globalSkipCache = false,
    ...additionalGlobalOptions
  } = globalOptions;

  return {
    getItems: async (params) => {
      const { id: itemId = "all", options = {}, ...otherParams } = params;

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
        const filteredData = {
          _item_id: itemId === "all" ? null : itemId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_items", {
          _data: filteredData,
        });
        if (error) throw new Error("Item(s) could not be loaded.");
        return data ?? [];
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
          return data ?? [];
        },
        [`item-${_org_uuid}-${itemId}`],
        {
          tags: [`item-${_org_uuid}-${itemId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
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

      if (forceRefresh) {
        revalidateTag(`location-${_org_uuid}-${locationId}`);
      }

      if (skipCache) {
        const filteredData = {
          _loc_id: locationId === "all" ? null : locationId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_locations", {
          _data: filteredData,
        });
        if (error) throw new Error("Locations could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _loc_id: locationId === "all" ? null : locationId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_locations", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Locations could not be loaded.");
          }
          return data ?? [];
        },
        [`location-${_org_uuid}-${locationId}`],
        {
          tags: [`location-${_org_uuid}-${locationId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getBins: async (params) => {
      const { id: binId = "all", options = {}, ...otherParams } = params;
      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`bin-${_org_uuid}-${binId}`);
      }

      if (skipCache) {
        const filteredData = {
          _bin_id: binId === "all" ? null : binId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_bins", {
          _data: filteredData,
        });
        if (error) throw new Error("Bins could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _bin_id: binId === "all" ? null : binId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_bins", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Bins could not be loaded.");
          }
          return data ?? [];
        },
        [`bin-${_org_uuid}-${binId}`],
        {
          tags: [`bin-${_org_uuid}-${binId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getItemClasses: async (params) => {
      const { id: itemClassId = "all", options = {}, ...otherParams } = params;
      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`itemClass-${_org_uuid}-${itemClassId}`);
      }

      if (skipCache) {
        const filteredData = {
          _item_class_id: itemClassId === "all" ? null : itemClassId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_items_classes", {
          _data: filteredData,
        });
        if (error) throw new Error("ItemClass could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_class_id: itemClassId === "all" ? null : itemClassId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_items_classes", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("ItemClass could not be loaded.");
          }
          return data ?? [];
        },
        [`itemClass-${_org_uuid}-${itemClassId}`],
        {
          tags: [`itemClass-${_org_uuid}-${itemClassId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getMarketTypes: async (params) => {
      const { id: marketTypeId = "all", options = {}, ...otherParams } = params;

      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`marketType-${_org_uuid}-${marketTypeId}`);
      }

      if (skipCache) {
        const filteredData = {
          _market_type_id: marketTypeId === "all" ? null : marketTypeId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_market_types", {
          _data: filteredData,
        });
        if (error) throw new Error("Market Types could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _market_type_id: marketTypeId === "all" ? null : marketTypeId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_market_types", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Market Types could not be loaded.");
          }
          return data ?? [];
        },
        [`marketType-${_org_uuid}-${marketTypeId}`],
        {
          tags: [`marketType-${_org_uuid}-${marketTypeId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getMarkets: async (params) => {
      const { id: marketId = "all", options = {}, ...otherParams } = params;

      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`market-${_org_uuid}-${marketId}`);
      }

      if (skipCache) {
        const filteredData = {
          _market_id: marketId === "all" ? null : marketId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_markets", {
          _data: filteredData,
        });
        if (error) throw new Error("Markets could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _market_id: marketId === "all" ? null : marketId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_markets", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Markets could not be loaded.");
          }
          return data ?? [];
        },
        [`market-${_org_uuid}-${marketId}`],
        {
          tags: [`market-${_org_uuid}-${marketId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getTrxTypes: async (params) => {
      const { id: trxTypeId = "all", options = {}, ...otherParams } = params;

      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`trxType-${_org_uuid}-${trxTypeId}`);
      }

      if (skipCache) {
        const filteredData = {
          _trx_type_id: trxTypeId === "all" ? null : trxTypeId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_trx_types", {
          _data: filteredData,
        });
        if (error) throw new Error("Transaction Types could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _trx_type_id: trxTypeId === "all" ? null : trxTypeId,
            ..._data,
            ...otherParams,
          };

          const { data, error } = await supabase.rpc("fn_get_trx_types", {
            _data: filteredData,
          });

          if (error) {
            console.log(error);
            throw new Error("Transaction Types could not be loaded.");
          }
          return data ?? [];
        },
        [`trxType-${_org_uuid}-${trxTypeId}`],
        {
          tags: [`trxType-${_org_uuid}-${trxTypeId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getTrxDirections: async (params) => {
      const {
        id: trxDirectionId = "all",
        options = {},
        ...otherParams
      } = params;
      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`trxDirection-${_org_uuid}-${trxDirectionId}`);
      }

      if (skipCache) {
        const filteredData = {
          _trx_direction_id: trxDirectionId === "all" ? null : trxDirectionId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_trx_directions", {
          _data: filteredData,
        });
        if (error)
          throw new Error("Transaction Directions could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _trx_direction_id: trxDirectionId === "all" ? null : trxDirectionId,
            ..._data,
            ...otherParams,
          };
          const { data, error } = await supabase.rpc("fn_get_trx_directions", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Transaction Directions could not be loaded.");
          }
          return data ?? [];
        },
        [`trxDirection-${_org_uuid}-${trxDirectionId}`],
        {
          tags: [`trxDirection-${_org_uuid}-${trxDirectionId}`],
          revalidate: false, //Cache forever
          ...additionalMethodOptions,
        },
      )();
    },

    getItemQoh: async (params) => {
      const { itemId, binId, options = {}, ...otherParams } = params;

      // console.log("getItemQoh was called with: ", { params });

      if (!itemId || !binId)
        throw new Error(
          `🚨 itemId and binId are required for getItemQoh. recieved itemId: ${itemId} and binId: ${binId}`,
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

      if (skipCache) {
        const mappedFields = getEntityFieldMapping("itemQoh");
        const dbReadyData = {
          [mappedFields["itemId"]]: itemId,
          [mappedFields["binId"]]: binId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_item_qoh", {
          _data: dbReadyData,
        });
        if (error) throw new Error("Item QOH could not be loaded.");

        console.log("getItemQoh skipCache returned: ", data);
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const mappedFields = getEntityFieldMapping("itemQoh");
          const dbReadyData = {
            [mappedFields["itemId"]]: itemId,
            [mappedFields["binId"]]: binId,
            ..._data,
            ...otherParams,
          };

          const { data, error } = await supabase.rpc("fn_get_item_qoh", {
            _data: dbReadyData,
          });

          if (error) {
            console.log(error);
            throw new Error("Item QOH could not be loaded.");
          }
          // console.log("getItemQoh unstable_cache returned: ", data);

          return data ?? [];
        },
        [`itemQoh-${_org_uuid}-${itemId}-${binId}`],
        {
          tags: [`itemQoh-${_org_uuid}-${itemId}-${binId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getItemTrx: async (params) => {
      const { id: itemTrxId = "all", options = {}, ...otherParams } = params;
      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`itemTrx-${_org_uuid}-${itemTrxId}`);
      }

      if (skipCache) {
        const filteredData = {
          _item_trx_id: itemTrxId === "all" ? null : itemTrxId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_item_trans", {
          _data: filteredData,
        });
        if (error) throw new Error("Item Transactions could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_trx_id: itemTrxId === "all" ? null : itemTrxId,
            ..._data,
            ...otherParams,
          };

          const { data, error } = await supabase.rpc("fn_get_item_trans", {
            _data: filteredData,
          });

          if (error) {
            console.log(error);
            throw new Error("Item Transactions could not be loaded.");
          }
          return data ?? [];
        },
        [`itemTrx-${_org_uuid}-${itemTrxId}`],
        {
          tags: [`itemTrx-${_org_uuid}-${itemTrxId}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },

    getItemTrxDetails: async (params) => {
      const { id: itemTrxId, options = {}, ...otherParams } = params;
      const {
        forceRefresh = globalForceRefresh,
        cacheTTL = globalCacheTTL,
        skipCache = globalSkipCache,
        ...additionalMethodOptions
      } = { ...additionalGlobalOptions, ...options };

      if (forceRefresh) {
        revalidateTag(`itemTrxDetails-${itemTrxId}-${_org_uuid}`);
      }

      if (skipCache) {
        const filteredData = {
          _item_trx_id: itemTrxId,
          ..._data,
          ...otherParams,
        };
        const { data, error } = await supabase.rpc("fn_get_item_trx_details", {
          _data: filteredData,
        });
        if (error)
          throw new Error("Item Transaction Details could not be loaded.");
        return data ?? [];
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_trx_id: itemTrxId,
            ..._data,
            ...otherParams,
          };

          const { data, error } = await supabase.rpc(
            "fn_get_item_trx_details",
            {
              _data: filteredData,
            },
          );
          if (error) {
            console.log(error);
            throw new Error("Item Transaction Details could not be loaded.");
          }
          return data ?? [];
        },
        [`itemTrxDetails-${itemTrxId}-${_org_uuid}`],
        {
          tags: [`itemTrxDetails-${itemTrxId}-${_org_uuid}`],
          revalidate: cacheTTL,
          ...additionalMethodOptions,
        },
      )();
    },
  };
}

// export async function getServerData({ entity, options = {}, ...otherParams }) {
//   if (!entity) throw new Error(`🚨 no entity was provided for getServerData.`);

//   const dataService = await createDataService(options);
//   const { get } = entityServerOnlyConfig(entity);

//   if (!get) {
//     throw new Error(
//       `Data service method not found for entity '${entity}' in entityServerOnlyConfig.`,
//     );
//   }

//   const entityData = await dataService[get]({ ...otherParams, options });
//   return entityData;
// }
