"use server";

import { revalidateTag } from "next/cache";
// import { auth } from "./auth"; // Placeholder for your actual auth function
import { supabase } from "./supabase";
import { formDataTransformer } from "./transformers";
import { appContextSchema, getSchema } from "./ZodSchemas";

/**
 * A factory function to create standardized database server actions.
 * This reduces boilerplate by handling authentication, data extraction,
 * database calls, error handling, and cache revalidation in one place.
 *
 * @param {string} rpcName - The name of the Supabase RPC function to call.
 * @param {string} entity - The entity type used for validation and cache revalidation (e.g., 'location').
 * @returns {Function} An async server action function compatible with useActionState.
 */

function dbAction(rpcName, entity, operation) {
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
    const validatedAppContext = appContextSchema.safeParse({
      _org_uuid,
      _usr_uuid,
    });

    if (!validatedAppContext.success) {
      return {
        error: z.prettifyError(validatedAppContext.error),
      };
    }

    // prepare and validate the form data
    let destructuredFormData;

    // Special handling for itemTrans entity
    if (entity === "itemTrans") {
      // Transform FormData using unified pipeline for complex transactions
      destructuredFormData = formDataTransformer.transform(formData);
      console.log("Transformed itemTrans data:", destructuredFormData);
    } else {
      // Standard FormData handling for other entities
      destructuredFormData = Object.fromEntries(formData);
    }

    const schema = getSchema(entity, operation);

    const validatedData = schema.safeParse({
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
    // await connection();

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
        zodErrors: validatedData.error?.flatten().fieldErrors,
        message: errorMessage,
      };
      // throw new Error(errorMessage);
    }

    // 5. Revalidate the appropriate cache tag on success.
    if (entity) {
      revalidateTag(`${entity}-${_org_uuid}`);
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

export const createLocation = dbAction(
  "fn_create_location",
  "location",
  "create",
);
export const createBin = dbAction("fn_create_bin", "bin", "create");
export const createItemClass = dbAction(
  "fn_create_item_class",
  "itemClass",
  "create",
);
export const createMarketType = dbAction(
  "fn_create_market_type",
  "marketType",
  "create",
);
export const createTrxType = dbAction(
  "fn_create_trx_type",
  "trxType",
  "create",
);
export const createMarket = dbAction("fn_create_market", "market", "create");
export const createItem = dbAction("fn_create_item", "item", "create");

// --- Update Actions ---
export const updateLocation = dbAction(
  "fn_update_location",
  "location",
  "update",
);
export const updateBin = dbAction("fn_update_bin", "bin", "update");
export const updateItemClass = dbAction(
  "fn_update_item_class",
  "itemClass",
  "update",
);
export const updateItem = dbAction("fn_update_item", "item", "update");
export const updateMarketType = dbAction(
  "fn_update_market_type",
  "marketType",
  "update",
);
export const updateMarket = dbAction("fn_update_market", "market", "update");
export const updateTrxType = dbAction(
  "fn_update_trx_type",
  "trxType",
  "update",
);

// --- Other Actions ---

export const createItemTrans = dbAction(
  "fn_create_item_trx",
  "itemTrans",
  "create",
);

export async function dummyServerAction(param) {
  console.log(`${param} button has been pressed`);
}
