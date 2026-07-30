import {createSupabase} from "@supabase/supabase-js"

const supabase = createSupabase(
    process.env.SUPABASE_URI,
    process.env.SUPABASE_ANON_KEY
)

export default supabase;