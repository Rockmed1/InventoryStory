"server-only";

import { revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { appContextSchema } from "../ZodSchemas";
import { supabase } from "./supabase";

//!Factory pattern is used as it is better for multi-tennant applications caching to ensure org scoped operations

export function createDataService() {
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

  const validatedAppContext = appContextSchema.safeParse({
    _org_uuid,
    _usr_uuid,
  });

  if (!validatedAppContext.success) {
    return {
      error: z.prettifyError(validatedAppContext.error),
    };
  }

  return {
    getItems: async (options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`item-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          // For testing
          // await new Promise(res => setTimeout(res, 2000));
          const { data, error } = await supabase.rpc("fn_get_items", {
            _data,
          });
          // console.log(data, error);
          if (error) {
            console.error(error);
            throw new Error("Items could not be loaded.");
          }
          return data || [];
        },
        [`item-${_org_uuid}`],
        {
          tags: [`item-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getLocations: async (options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`location-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const { data, error } = await supabase.rpc("fn_get_locations", {
            _data,
          });
          if (error) {
            console.log(error);
            throw new Error("Locations could not be loaded.");
          }
          return data || [];
        },
        [`location-${_org_uuid}`],
        {
          tags: [`location-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getBins: async (options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`bin-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const { data, error } = await supabase.rpc("fn_get_bins", { _data });
          if (error) {
            console.log(error);
            throw new Error("Bins could not be loaded.");
          }
          return data || [];
        },
        [`bin-${_org_uuid}`],
        {
          tags: [`bin-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getItemClasses: async (options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`itemClass-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const { data, error } = await supabase.rpc("fn_get_items_classes", {
            _data,
          });
          if (error) {
            console.log(error);
            throw new Error("ItemClass could not be loaded.");
          }
          return data || [];
        },
        [`itemClass-${_org_uuid}`],
        {
          tags: [`itemClass-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getMarketTypes: async (options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`marketType-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const { data, error } = await supabase.rpc("fn_get_market_types", {
            _data,
          });
          if (error) {
            console.log(error);
            throw new Error("Market Types could not be loaded.");
          }
          return data || [];
        },
        [`marketType-${_org_uuid}`],
        {
          tags: [`marketType-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getMarkets: async (options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`market-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const { data, error } = await supabase.rpc("fn_get_markets", {
            _data,
          });
          if (error) {
            console.log(error);
            throw new Error("Markets could not be loaded.");
          }
          return data || [];
        },
        [`market-${_org_uuid}`],
        {
          tags: [`market-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getTrxTypes: async (options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`trxType-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const { data, error } = await supabase.rpc("fn_get_trx_types", {
            _data,
          });
          if (error) {
            console.log(error);
            throw new Error("Transaction Types could not be loaded.");
          }
          return data || [];
        },
        [`trxType-${_org_uuid}`],
        {
          tags: [`trxType-${_org_uuid}`],
          revalidate: cacheTTL,
        },
      )();
    },

    getItemTrx: async (item_trx_id, options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`ItemTrx-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = item_trx_id ? { item_trx_id, ..._data } : _data;

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
        [`${item_trx_id ? "itemTrx-" + item_trx_id : "ItemTrx"}-${_org_uuid}`],
        {
          tags: [
            `${
              item_trx_id ? "itemTrx-" + item_trx_id : "ItemTrx"
            }-${_org_uuid}`,
          ],
          revalidate: cacheTTL,
        },
      )();
    },

    getItemTrxDetails: async (item_trx_id, options = {}) => {
      const { forceRefresh = false, cacheTTL = 300 } = options;

      if (forceRefresh) {
        revalidateTag(`itemTrxDetails-${item_trx_id}-${_org_uuid}`);
      }

      return unstable_cache(
        async () => {
          const filteredData = { item_trx_id, ..._data };

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
        [`itemTrxDetails-${item_trx_id}-${_org_uuid}`],
        {
          tags: [`itemTrxDetails-${item_trx_id}-${_org_uuid}`],
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
