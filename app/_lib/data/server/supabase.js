import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'utils' } },
);

// export async function setSearchPath() {
//   const { error } = await supabase.rpc('set_config', {
//     key: 'search_path',
//     value: 'usrs, public',

//     // Add your schema here
//   });

//   if (error) {
//     console.error('Error setting search path:', error);
//   }
// }
