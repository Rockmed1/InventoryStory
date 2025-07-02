import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { supabase } from "./supabase";

//!Factory pattern is used as it is better for multi-tennant applications caching to ensure org scoped operations

export function createDataService(org_uuid) {
  if (!org_uuid) throw new Error("Organization UUID is required");

  //1- authenticate the user
  const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";
  const session = { _org_uuid: ORG_UUID, _usr_uuid: USR_UUID };
  // const session = {}; for testing

  // const session = await auth();

  if (!session?._org_uuid || !session?._usr_uuid) return redirect("/");
  const { _usr_uuid, _org_uuid } = session;

  if (_org_uuid !== org_uuid) throw new Error("Unauthorized 🚫"); //unauthorized

  const _data = { _org_uuid, _usr_uuid };

  return {
    getItems: cache(
      async () => {
        // For testing
        // await new Promise(res => setTimeout(res, 2000));

        //Cashing:
        // no-store is deprecated
        // The connection() function allows you to indicate rendering should wait for an incoming user request before continuing.

        await connection();
        const { data, error } = await supabase.rpc("fn_get_items", {
          _data,
        });
        // console.log(data, error);
        if (error) {
          console.error(error);
          throw new Error("Items could not be loaded.");
        }
        return data;
      },
      [`items-${org_uuid}`], // A unique key for this specific query
      { tags: [`items-${org_uuid}`] }, // The tag we will use to revalidate this data
    ),

    getLocations: cache(
      async () => {
        await connection();
        const { data, error } = await supabase.rpc("fn_get_locations", {
          _data,
        });
        // console.log(data, error);
        if (error) {
          console.log(error);
          throw new Error("Locations could not be loaded.");
        }
        return data;
      },
      [`locations-${org_uuid}`],
      { tags: [`locations-${org_uuid}`] },
    ),

    getBins: cache(
      async () => {
        await connection();
        const { data, error } = await supabase.rpc("fn_get_bins", { _data });
        // console.log(data, error);
        if (error) {
          console.log(error);
          throw new Error("Bins could not be loaded.");
        }
        return data;
      },
      [`bins-${org_uuid}`],
      { tags: [`bins-${org_uuid}`] },
    ),

    getItemClasses: cache(
      async () => {
        await connection();
        const { data, error } = await supabase.rpc("fn_get_items_classes", {
          _data,
        });
        // console.log(data, error);
        if (error) {
          console.log(error);
          throw new Error("ItemClass could not be loaded.");
        }
        return data;
      },
      [`itemClasses-${org_uuid}`],
      { tags: [`itemClasses-${org_uuid}`] },
    ),

    getMarketTypes: cache(
      async () => {
        await connection();
        const { data, error } = await supabase.rpc("fn_get_market_types", {
          _data,
        });
        // console.log(data, error);
        if (error) {
          console.log(error);
          throw new Error("Market Types could not be loaded.");
        }
        return data;
      },
      [`marketTypes-${org_uuid}`],
      { tags: [`marketTypes-${org_uuid}`] },
    ),

    getMarkets: cache(
      async () => {
        await connection();
        const { data, error } = await supabase.rpc("fn_get_markets", { _data });
        // console.log(data, error);
        if (error) {
          console.log(error);
          throw new Error("Markets could not be loaded.");
        }
        return data;
      },
      [`markets-${org_uuid}`],
      { tags: [`markets-${org_uuid}`] },
    ),

    getTrxTypes: cache(
      async () => {
        await connection();
        const { data, error } = await supabase.rpc("fn_get_trx_types", {
          _data,
        });
        // console.log(data, error);
        if (error) {
          console.log(error);
          throw new Error("Transaction Types could not be loaded.");
        }
        return data;
      },
      [`trxTypes-${org_uuid}`],
      { tags: [`trxTypes-${org_uuid}`] },
    ),
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

//   await connection();
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

//     await connection();
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
//     await connection();
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
//   await connection();
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
//   await connection();
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
//   await connection();
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
//   await connection();
//   const { data, error } = await supabase.rpc("fn_get_trx_types", { _data });
//   // console.log(data, error);
//   if (error) {
//     console.log(error);
//     throw new Error("Transaction Types could not be loaded.");
//   }
//   return data;
// };
