import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuthStatus() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const syncAuthState = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (isMounted) {
                setIsAuthenticated(Boolean(session?.user));
                setLoading(false);
            }
        };

        syncAuthState();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setIsAuthenticated(Boolean(session?.user));
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { isAuthenticated, loading };
}
