import { connection } from "next/server";
import { supabase } from "./supabase";

//dummy data
const _usr_name = "sa";
const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

const _data = {
  _org_uuid: ORG_UUID,
  _usr_uuid: USR_UUID,
  _item_trx_desc: "test sales trans",
  _trx_date: "3/2/2024",
  _item_trx_id: 3,
  _item_id: "2",
  // _from_bin: 9,
  _to_bin: 3,
  _qty_in: 3,
  _qty_out: 2,
};

export const getItems = async function () {
  const _data = {
    _org_uuid: ORG_UUID,
    _usr_uuid: USR_UUID,
  };
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
};

export const getLocations = async function () {
  const _data = {
    _org_uuid: ORG_UUID,
    _usr_uuid: USR_UUID,
  };
  await connection();
  const { data, error } = await supabase.rpc("fn_get_locations", { _data });
  // console.log(data, error);
  if (error) {
    console.log(error);
    throw new Error("Locations could not be loaded.");
  }
  return data;
};

export const getBins = async function () {
  const _data = {
    _org_uuid: ORG_UUID,
    _usr_uuid: USR_UUID,
  };
  await connection();
  const { data, error } = await supabase.rpc("fn_get_bins", { _data });
  // console.log(data, error);
  if (error) {
    console.log(error);
    throw new Error("Bins could not be loaded.");
  }
  return data;
};

export const getItemClasses = async function () {
  const _data = {
    _org_uuid: ORG_UUID,
    _usr_uuid: USR_UUID,
  };
  await connection();
  const { data, error } = await supabase.rpc("fn_get_items_classes", { _data });
  // console.log(data, error);
  if (error) {
    console.log(error);
    throw new Error("ItemClass could not be loaded.");
  }
  return data;
};

export const getMarketTypes = async function () {
  const _data = {
    _org_uuid: ORG_UUID,
    _usr_uuid: USR_UUID,
  };
  await connection();
  const { data, error } = await supabase.rpc("fn_get_market_types", { _data });
  // console.log(data, error);
  if (error) {
    console.log(error);
    throw new Error("Market Types could not be loaded.");
  }
  return data;
};

export const getMarkets = async function () {
  const _data = {
    _org_uuid: ORG_UUID,
    _usr_uuid: USR_UUID,
  };
  await connection();
  const { data, error } = await supabase.rpc("fn_get_markets", { _data });
  // console.log(data, error);
  if (error) {
    console.log(error);
    throw new Error("Markets could not be loaded.");
  }
  return data;
};

export const getTrxTypes = async function () {
  const _data = {
    _org_uuid: ORG_UUID,
    _usr_uuid: USR_UUID,
  };
  await connection();
  const { data, error } = await supabase.rpc("fn_get_trx_types", { _data });
  // console.log(data, error);
  if (error) {
    console.log(error);
    throw new Error("Transaction Types could not be loaded.");
  }
  return data;
};
