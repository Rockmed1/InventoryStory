"use server";

import { revalidateTag } from "next/cache";
import { connection } from "next/server";
import UseAuth from "../../_hooks/useAuth";
import { destructuredFormData } from "../../_utils/helpers";
import { supabase } from "./supabase";

export default async function dummyServerAction(param) {
  console.log(`${param} button has been pressed`);
}

// //dummy data
// const _usr_name = "sa";
// const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
// const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

// const _data = {
//   _org_uuid: ORG_UUID,
//   _usr_uuid: USR_UUID,
//   _item_trx_desc: "test sales trans",
//   _trx_date: "3/2/2024",
//   _item_trx_id: 3,
//   _item_id: "2",
//   // _from_bin: 9,
//   _to_bin: 3,
//   _qty_in: 3,
//   _qty_out: 2,
// };

export async function createLocation(initialState, formData) {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  await connection();
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));
  const _data = destructuredFormData(
    { _org_uuid, _usr_uuid, ...initialState },
    formData,
  );
  // console.log(_data);
  const { data, error } = await supabase.rpc("fn_create_location", {
    _data,
  });

  // console.log(data, error);
  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidateTag(`locations-${_org_uuid}`);
  return data;
  // return true;
}

export async function createBin(initialState, formData) {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  await connection();
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  const _data = destructuredFormData(
    { _org_uuid, _usr_uuid, ...initialState },
    formData,
  );

  console.log(_data);

  const { data, error } = await supabase.rpc("fn_create_bin", {
    _data,
  });
  console.log(data, error);

  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidateTag(`bins-${_org_uuid}`);
  return data;
  // return true;
}

export async function createItemClass(initialState, formData) {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  await connection();
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));
  const _data = destructuredFormData(
    { _org_uuid, _usr_uuid, ...initialState },
    formData,
  );
  console.log(_data);
  const { data, error } = await supabase.rpc("fn_create_item_class", {
    _data,
  });
  // console.log(data, error);
  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidateTag(`itemClasses-${_org_uuid}`);
  return data;
  // return true;
}

export async function createMarketType(initialState, formData) {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  await connection();
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));
  const _data = destructuredFormData(
    { _org_uuid, _usr_uuid, ...initialState },
    formData,
  );
  console.log(_data);
  const { data, error } = await supabase.rpc("fn_create_market_type", {
    _data,
  });
  // console.log(data, error);
  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidateTag(`marketTypes-${_org_uuid}`);
  return data;
  // return true;
}

export async function createTrxType(initialState, formData) {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  await connection();
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));
  const _data = destructuredFormData(
    { _org_uuid, _usr_uuid, ...initialState },
    formData,
  );
  console.log(_data);
  const { data, error } = await supabase.rpc("fn_create_trx_type", {
    _data,
  });
  // console.log(data, error);
  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidateTag(`trxTypes-${_org_uuid}`);
  return data;
  // return true;
}

export async function createMarket(initialState, formData) {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  await connection();
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));
  const _data = destructuredFormData(
    { _org_uuid, _usr_uuid, ...initialState },
    formData,
  );
  console.log(_data);
  const { data, error } = await supabase.rpc("fn_create_market", {
    _data,
  });
  // console.log(data, error);
  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidateTag(`markets-${_org_uuid}`);
  return data;
  // return true;
}

export async function createItem(initialState, formData) {
  //1- authenticate the user
  const { _org_uuid, _usr_uuid } = UseAuth();

  await connection();
  // For testing
  // await new Promise((res) => setTimeout(res, 2000));
  const _data = destructuredFormData(
    { _org_uuid, _usr_uuid, ...initialState },
    formData,
  );
  console.log(_data);
  const { data, error } = await supabase.rpc("fn_create_item", {
    _data,
  });
  // console.log(data, error);
  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidateTag(`items-${_org_uuid}`);
  return data;
  // return true;
}

export async function createTrx(initialState, formData) {
  console.log(formData);
}
