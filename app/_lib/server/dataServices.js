"server-only";

import { getEntityFieldMapping } from "@/app/_utils/helpers-server";
import { revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { appContextSchema } from "../validation/getValidationSchema";
import { supabase } from "./supabase";

//!Factory pattern is used as it is better for multi-tennant applications caching to ensure org scoped operations

export async function createDataService() {
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

  return {
    getItems: async (params) => {
      const { id: itemId = "all", options = {} } = params;

      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`item-${_org_uuid}-${itemId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_id: itemId === "all" ? null : itemId,
            ..._data,
          };
          //TODO: confirm fetch from cache first before making db call

          // console.log(filteredData);
          // For testing
          // await new Promise(res => setTimeout(res, 2000));
          const { data, error } = await supabase.rpc("fn_get_items", {
            _data: filteredData,
          });
          // console.log(data, error);
          if (error) {
            console.error(error);
            throw new Error("Item(s) could not be loaded.");
          }
          // console.log("itemServerData: ", data);

          return data || [];
        },
        [`item-${_org_uuid}-${itemId}`],
        {
          tags: [`item-${_org_uuid}-${itemId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getLocations: async (params) => {
      const { id: locationId = "all", options = {} } = params;

      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`location-${_org_uuid}-${locationId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _loc_id: locationId === "all" ? null : locationId,
            ..._data,
          };
          const { data, error } = await supabase.rpc("fn_get_locations", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Locations could not be loaded.");
          }
          return data || [];
        },
        [`location-${_org_uuid}-${locationId}`],
        {
          tags: [`location-${_org_uuid}-${locationId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getBins: async (params) => {
      const { id: binId = "all", options = {} } = params;
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`bin-${_org_uuid}-${binId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _bin_id: binId === "all" ? null : binId,
            ..._data,
          };
          const { data, error } = await supabase.rpc("fn_get_bins", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Bins could not be loaded.");
          }
          return data || [];
        },
        [`bin-${_org_uuid}-${binId}`],
        {
          tags: [`bin-${_org_uuid}-${binId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getItemClasses: async (params) => {
      const { id: itemClassId = "all", options = {} } = params;
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`itemClass-${_org_uuid}-${itemClassId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_class_id: itemClassId === "all" ? null : itemClassId,
            ..._data,
          };
          const { data, error } = await supabase.rpc("fn_get_items_classes", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("ItemClass could not be loaded.");
          }
          return data || [];
        },
        [`itemClass-${_org_uuid}-${itemClassId}`],
        {
          tags: [`itemClass-${_org_uuid}-${itemClassId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getMarketTypes: async (params) => {
      const { id: marketTypeId = "all", options = {} } = params;

      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`marketType-${_org_uuid}-${marketTypeId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _market_type_id: marketTypeId === "all" ? null : marketTypeId,
            ..._data,
          };
          const { data, error } = await supabase.rpc("fn_get_market_types", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Market Types could not be loaded.");
          }
          return data || [];
        },
        [`marketType-${_org_uuid}-${marketTypeId}`],
        {
          tags: [`marketType-${_org_uuid}-${marketTypeId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getMarkets: async (params) => {
      const { id: marketId = "all", options = {} } = params;

      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`market-${_org_uuid}-${marketId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _market_id: marketId === "all" ? null : marketId,
            ..._data,
          };
          const { data, error } = await supabase.rpc("fn_get_markets", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Markets could not be loaded.");
          }
          return data || [];
        },
        [`market-${_org_uuid}-${marketId}`],
        {
          tags: [`market-${_org_uuid}-${marketId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getTrxTypes: async (params) => {
      const { id: trxTypeId = "all", options = {} } = params;
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`trxType-${_org_uuid}-${trxTypeId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _trx_type_id: trxTypeId === "all" ? null : trxTypeId,
            ..._data,
          };
          const { data, error } = await supabase.rpc("fn_get_trx_types", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Transaction Types could not be loaded.");
          }
          return data || [];
        },
        [`trxType-${_org_uuid}-${trxTypeId}`],
        {
          tags: [`trxType-${_org_uuid}-${trxTypeId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getTrxDirections: async (params) => {
      const { id: trxDirectionId = "all" } = params;
      // Remove forceRefresh logic since we're caching forever
      // const { forceRefresh = false, cacheTTL = 300 } = options;

      // if (forceRefresh) {
      //   revalidateTag(`trxDirection-${_org_uuid}-${trxDirectionId}`);
      // }

      return unstable_cache(
        async () => {
          const filteredData = {
            _trx_direction_id: trxDirectionId === "all" ? null : trxDirectionId,
            ..._data,
          };
          const { data, error } = await supabase.rpc("fn_get_trx_directions", {
            _data: filteredData,
          });
          if (error) {
            console.log(error);
            throw new Error("Transaction Directions could not be loaded.");
          }
          return data || [];
        },
        [`trxDirection-${_org_uuid}-${trxDirectionId}`],
        {
          tags: [`trxDirection-${_org_uuid}-${trxDirectionId}`],
          revalidate: false, //Cache forever
        },
      )();
    },

    getItemQoh: async (params) => {
      const { itemId, binId, options = {} } = params;

      if (!itemId || !binId)
        throw new Error(
          `🚨 itemId and binId are required for getItemQoh. recieved itemId: ${itemId} and binId: ${binId}`,
        );
      const { forceRefresh = false, cacheTTL = 300 } = options;

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
          };

          // console.log("dbReadyData: ", dbReadyData);

          const { data, error } = await supabase.rpc("fn_get_item_qoh", {
            _data: dbReadyData,
          });

          // console.log("data: ", data, "error: ", error);

          if (error) {
            console.log(error);
            throw new Error("Item QOH could not be loaded.");
          }
          return data || [];
        },
        [`itemQoh-${_org_uuid}-${itemId}-${binId}`],
        {
          tags: [`itemQoh-${_org_uuid}-${itemId}-${binId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getItemTrx: async (params) => {
      const { id: itemTrxId = "all", options = {} } = params;
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`itemTrx-${_org_uuid}-${itemTrxId}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = {
            _item_trx_id: itemTrxId === "all" ? null : itemTrxId,
            ..._data,
          };

          const { data, error } = await supabase.rpc("fn_get_item_trans", {
            _data: filteredData,
          });

          // console.log(data, error);
          if (error) {
            console.log(error);
            throw new Error("Item Transactions could not be loaded.");
          }
          return data || [];
        },
        [`itemTrx-${_org_uuid}-${itemTrxId}`],
        {
          tags: [`itemTrx-${_org_uuid}-${itemTrxId}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getItemTrxDetails: async (params) => {
      const { id: itemTrxId, options = {} } = params;
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`itemTrxDetails-${itemTrxId}-${_org_uuid}`);
      }

      // console.log("getItemTrxDetails itemTrxId:", itemTrxId);

      return unstable_cache(
        async () => {
          const filteredData = { _item_trx_id: itemTrxId, ..._data };

          const { data, error } = await supabase.rpc(
            "fn_get_item_trx_details",
            {
              _data: filteredData,
            },
          );
          // console.log(data, error);
          if (error) {
            console.log(error);
            throw new Error("Item Transaction Details could not be loaded.");
          }
          return data || [];
        },
        [`itemTrxDetails-${itemTrxId}-${_org_uuid}`],
        {
          tags: [`itemTrxDetails-${itemTrxId}-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },
  };
}
// export const getItems = async function () {
//   const _data = {
//     _org_uuid: ORG_UUID,
//     _usr_uuid: USR_UUID,
//   };
//   // For testing
//   // await new Promise(res => setTimeout(res, 2000));

//   //Cashing:
//   // no-store is deprecated
//   // The connection() function allows you to indicate rendering should wait for an incoming user request before continuing.

//
//   const { data, error } = await supabase.rpc("fn_get_items", {
//     _data,
//   });
//   // console.log(data, error);

//   if (error) {
//     console.error(error);
//     throw new Error("Items could not be loaded.");
//   }
//   return data;
// };

// export const getLocations = cache(
//   async function (_org_uuid) {
//     if (!org_uuid) throw new Error("Organization UUID is required");

//
//     const { data, error } = await supabase.rpc("fn_get_locations", { _data });
//     // console.log(data, error);
//     if (error) {
//       console.log(error);
//       throw new Error("Locations could not be loaded.");
//     }
//     return data;
//   },
//   ["locations"], // A unique key for this specific query
//   { tags: ["locations"] }, // The tag we will use to revalidate this data
// );

// export const getBins = cache(
//   async function () {
//     const _data = {
//       _org_uuid: ORG_UUID,
//       _usr_uuid: USR_UUID,
//     };
//
//     const { data, error } = await supabase.rpc("fn_get_bins", { _data });
//     // console.log(data, error);
//     if (error) {
//       console.log(error);
//       throw new Error("Bins could not be loaded.");
//     }
//     return data;
//   },
//   ["bins"],
//   { tags: ["bins"] },
// );

// export const getItemClasses = async function () {
//   const _data = {
//     _org_uuid: ORG_UUID,
//     _usr_uuid: USR_UUID,
//   };
//
//   const { data, error } = await supabase.rpc("fn_get_items_classes", { _data });
//   // console.log(data, error);
//   if (error) {
//     console.log(error);
//     throw new Error("ItemClass could not be loaded.");
//   }
//   return data;
// };

// export const getMarketTypes = async function () {
//   const _data = {
//     _org_uuid: ORG_UUID,
//     _usr_uuid: USR_UUID,
//   };
//
//   const { data, error } = await supabase.rpc("fn_get_market_types", { _data });
//   // console.log(data, error);
//   if (error) {
//     console.log(error);
//     throw new Error("Market Types could not be loaded.");
//   }
//   return data;
// };

// export const getMarkets = async function () {
//   const _data = {
//     _org_uuid: ORG_UUID,
//     _usr_uuid: USR_UUID,
//   };
//
//   const { data, error } = await supabase.rpc("fn_get_markets", { _data });
//   // console.log(data, error);
//   if (error) {
//     console.log(error);
//     throw new Error("Markets could not be loaded.");
//   }
//   return data;
// };

// export const getTrxTypes = async function () {
//   const _data = {
//     _org_uuid: ORG_UUID,
//     _usr_uuid: USR_UUID,
//   };
//
//   const { data, error } = await supabase.rpc("fn_get_trx_types", { _data });
//   // console.log(data, error);
//   if (error) {
//     console.log(error);
//     throw new Error("Transaction Types could not be loaded.");
//   }
//   return data;
// };
