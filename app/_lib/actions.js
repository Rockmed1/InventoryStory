"use server";

import { revalidateTag } from "next/cache";
// import { auth } from "./auth"; // Placeholder for your actual auth function
import { connection } from "next/server";
import { supabase } from "./supabase";
import { schema } from "./ZodSchemas";

/**
 * A factory function to create standardized database server actions.
 * This reduces boilerplate by handling authentication, data extraction,
 * database calls, error handling, and cache revalidation in one place.
 *
 * @param {string} rpcName - The name of the Supabase RPC function to call.
 * @param {string} revalidateTagKey - The base key for the cache tag to revalidate (e.g., 'locations').
 * @returns {Function} An async server action function compatible with useActionState.
 */

function dbAction(rpcName, revalidateTagKey, actionSchema) {
  return async function (prevState, formData) {
    // 1. Authenticate the user on the server.
    // Server Actions should not use hooks. They get auth state directly.
    const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
    const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";
    // const session = await auth();
    const session = { _org_uuid: ORG_UUID, _usr_uuid: USR_UUID };

    if (!session?._org_uuid || !session?._usr_uuid) return redirect("/");
    const { _org_uuid, _usr_uuid } = session;

    // validate the session data
    const validatedAppContext = schema.appContextSchema.safeParse({
      _org_uuid,
      _usr_uuid,
    });

    if (!validatedAppContext.success) {
      return {
        error: z.prettifyError(validatedAppContext.error),
      };
    }

    // prepare and validate the form data
    const destructuredFormData = Object.fromEntries(formData);

    const validatedData = schema[actionSchema].safeParse({
      ...destructuredFormData,
    });

    if (!validatedData.success) {
      return {
        success: false,
        formData: destructuredFormData,
        zodErrors: validatedData.error.flatten().fieldErrors,
        message: "Missing Fields. Operation aborted.",
      };
    }

    const _data = { _org_uuid, _usr_uuid, ...validatedData.data };

    // console.log(_data);
    await connection();

    // For testing
    // await new Promise((res) => setTimeout(res, 2000));

    // 2. Prepare the data for the RPC call.

    // const destructuredFormData = Object.fromEntries(formData);

    // const validatedData = schema[actionSchema].safeParse({
    //   _org_uuid,
    //   _usr_uuid,
    //   ...destructuredFormData,
    // });

    // if (!validatedData.success) {
    //   return {
    //     success: false,
    //     formData: destructuredFormData,
    //     zodErrors: validatedData.error.flatten().fieldErrors,
    //     message: "Missing Fields. Operation aborted.",
    //   };
    // }

    // const _data = validatedData.data;
    // console.log(_data);
    // console.log(typeof payload);

    // 3. Call the specified Supabase RPC function.
    const { data, error } = await supabase.rpc(rpcName, {
      _data,
    });

    // 4. Handle errors.
    if (error || !data?.success) {
      const errorMessage = error?.message || `Failed to execute ${rpcName}.`;
      console.error(`Error in ${rpcName}:`, errorMessage);
      return {
        success: false,
        formData: destructuredFormData,
        zodErrors: validatedData.Error?.flatten().fieldErrors,
        message: errorMessage,
      };
      // throw new Error(errorMessage);
    }

    // 5. Revalidate the appropriate cache tag on success.
    if (revalidateTagKey) {
      revalidateTag(`${revalidateTagKey}-${_org_uuid}`);
    }

    // console.log(prevState);
    // return new form state
    return {
      // ...prevState,
      success: data.success,
      formData: destructuredFormData,
      zodErrors: null,
      message: null,
    };
  };
}

// --- Define and export your server actions using the factory ---

export const createLocation = dbAction("fn_create_location", "locations");
export const createBin = dbAction("fn_create_bin", "bins");
export const createItemClass = dbAction("fn_create_item_class", "itemClasses");
export const createMarketType = dbAction(
  "fn_create_market_type",
  "marketTypes",
);
export const createTrxType = dbAction("fn_create_trx_type", "trxTypes");
export const createMarket = dbAction("fn_create_market", "markets");
export const createItem = dbAction("fn_create_item", "items", "itemSchema");

// --- Other Actions ---

export async function createTrx(prevState, formData) {
  console.log("Transaction form data:", formData);
  // Placeholder for transaction logic
}
export async function dummyServerAction(param) {
  console.log(`${param} button has been pressed`);
}
