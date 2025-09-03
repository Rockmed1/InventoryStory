"server-only";

import { getEntityFieldMapping } from "@/app/_utils/helpers-server";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import getAuthContext from "../../auth/getAuthContext";
import { appContextSchema } from "../../validation/buildValidationSchema";
import { supabase } from "./supabase";

//!Factory pattern is used as it is better for multi-tennant applications caching to ensure org scoped operations

export async function createDataService(globalOptions = {}) {
  // if (!org_uuid) throw new Error("Organization UUID is required");

  //1- authenticate the user

  // const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  // const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";
  // const session = { _org_uuid: ORG_UUID, _usr_uuid: USR_UUID };
  // // const session = {}; for testing

  // // const session = await auth();

  // if (!session?._org_uuid || !session?._usr_uuid) return redirect("/");
  // const { _usr_uuid, _org_uuid } = session;

  // // if (_org_uuid !== org_uuid) throw new Error("Unauthorized 🚫"); //unauthorized

  // const validatedAppContext = await appContextSchema.safeParseAsync({
  //   _org_uuid,
  //   _usr_uuid,
  // });

  const { userId: _usr_xid, orgId: _org_xid } = await getAuthContext();

  // validate the session data
  const validatedAppContext = await appContextSchema.safeParseAsync({
    _usr_xid,
    _org_xid,
  });

  if (!validatedAppContext.success) {
    console.error(z.prettifyError(validatedAppContext.error));
    return {
      error: z.prettifyError(validatedAppContext.error),
    };
  }

  let _data = { _org_xid, _usr_xid };

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
        revalidateTag(`item-${_org_xid}-${itemId}`);
      }

      if (skipCache) {
        const filteredData = {
          _item_id: itemId === "all" ? null : itemId,
          ..._data,
          ...otherParams,
        };
        // console.log("_data: ", filteredData);
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
        [`item-${_org_xid}-${itemId}`],
        {
          tags: [`item-${_org_xid}-${itemId}`],
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
        revalidateTag(`location-${_org_xid}-${locationId}`);
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
        [`location-${_org_xid}-${locationId}`],
        {
          tags: [`location-${_org_xid}-${locationId}`],
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
        revalidateTag(`bin-${_org_xid}-${binId}`);
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
        [`bin-${_org_xid}-${binId}`],
        {
          tags: [`bin-${_org_xid}-${binId}`],
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
        revalidateTag(`itemClass-${_org_xid}-${itemClassId}`);
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
        [`itemClass-${_org_xid}-${itemClassId}`],
        {
          tags: [`itemClass-${_org_xid}-${itemClassId}`],
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
        revalidateTag(`marketType-${_org_xid}-${marketTypeId}`);
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
        [`marketType-${_org_xid}-${marketTypeId}`],
        {
          tags: [`marketType-${_org_xid}-${marketTypeId}`],
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
        revalidateTag(`market-${_org_xid}-${marketId}`);
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
        [`market-${_org_xid}-${marketId}`],
        {
          tags: [`market-${_org_xid}-${marketId}`],
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
        revalidateTag(`trxType-${_org_xid}-${trxTypeId}`);
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
        [`trxType-${_org_xid}-${trxTypeId}`],
        {
          tags: [`trxType-${_org_xid}-${trxTypeId}`],
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
        revalidateTag(`trxDirection-${_org_xid}-${trxDirectionId}`);
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
        [`trxDirection-${_org_xid}-${trxDirectionId}`],
        {
          tags: [`trxDirection-${_org_xid}-${trxDirectionId}`],
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
        revalidateTag(`itemQoh-${_org_xid}-${itemId}-${binId}`);
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
        [`itemQoh-${_org_xid}-${itemId}-${binId}`],
        {
          tags: [`itemQoh-${_org_xid}-${itemId}-${binId}`],
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
        revalidateTag(`itemTrx-${_org_xid}-${itemTrxId}`);
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
        [`itemTrx-${_org_xid}-${itemTrxId}`],
        {
          tags: [`itemTrx-${_org_xid}-${itemTrxId}`],
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
        revalidateTag(`itemTrxDetails-${itemTrxId}-${_org_xid}`);
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
        [`itemTrxDetails-${itemTrxId}-${_org_xid}`],
        {
          tags: [`itemTrxDetails-${itemTrxId}-${_org_xid}`],
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
