import { connection } from 'next/server';
import { supabase } from '../_lib/supabase';
import Table from './Table';

export default async function ItemsTable({ lables }) {
  //dummy data
  const _usr_name = 'sa';

  const _data = {
    _org_uuid: 'ceba721b-b8dc-487d-a80c-15ae9d947084',
    _usr_uuid: '2bfdec48-d917-41ee-99ff-123757d59df1',
    _item_trx_desc: 'test sales trans',
    _trx_date: '3/2/2024',
    _item_trx_id: 3,
    _item_id: '2',
    // _from_bin: 9,
    _to_bin: 3,
    _qty_in: 3,
    _qty_out: 2,
  };
  // For testing
  // await new Promise(res => setTimeout(res, 2000));

  //Cashing:
  // no-store is deprecated
  // The connection() function allows you to indicate rendering should wait for an incoming user request before continuing.
  await connection();
  const { data, error } = await supabase.rpc('fn_get_items', {
    _data,
  });

  // console.log(data, error);

  return <Table data={data} lables={lables} />;
}
