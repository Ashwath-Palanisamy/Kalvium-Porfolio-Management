import { supabase } from "../../lib/supabase";

async function jwt() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        return null;
    }

    return session.access_token;
}

export default jwt;