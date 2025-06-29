"use server";

import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { destructureFormAction } from "../_utils/helpers";
import { supabase } from "./supabase";

export default async function dummyServerAction(param) {
  console.log(`${param} button has been pressed`);
}

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

export async function createLocation(initialState, formData) {
  await connection();

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  const _data = destructureFormAction(initialState, formData);
  // console.log(_data);

  const { data, error } = await supabase.rpc("fn_create_location", {
    _data,
  });
  // console.log(data, error);

  if (error || !data.success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }

  revalidatePath("/mysetup");
  return data;
  // return true;
}

export async function createBin(initialState, formData) {
  await connection();

  // For testing
  // await new Promise((res) => setTimeout(res, 2000));

  const _data = destructureFormAction(initialState, formData);
  console.log(_data);

  const { data, error } = await supabase.rpc("fn_create_bin", {
    _data,
  });
  console.log(data, error);

  if (error || !data._success) {
    console.error(data, error.message);
    throw new Error(error.message);
  }
  return data;
  // return true;
}

export async function createItemClass(initialState, formData) {
  console.log(formData);
}

export async function createItem(initialState, formData) {
  console.log(formData);
}

export async function createMarketType(initialState, formData) {
  console.log(formData);
}

export async function createMarket(initialState, formData) {
  console.log(formData);
}

export async function createTrxType(initialState, formData) {
  console.log(formData);
}

export async function createTrx(initialState, formData) {
  console.log(formData);
}
