import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Single source of truth for the authenticated user's role.
 * Reads role from app_metadata only — user_metadata is self-writable by the
 * user and must never decide what UI a session gets (server checks
 * app_metadata too, so this stays consistent with requireRole).
 */
export function getUserRole(user) {
    return user?.app_metadata?.role ?? null;
}

export function useUserRole() {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const syncAuthState = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (isMounted) {
                const nextUser = session?.user ?? null;
                setUser(nextUser);
                setRole(getUserRole(nextUser));
                setLoading(false);
            }
        };

        syncAuthState();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                const nextUser = session?.user ?? null;
                setUser(nextUser);
                setRole(getUserRole(nextUser));
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { user, role, isAuthenticated: Boolean(user), loading };
}

// Backwards-compatible shim: existing Navbar/Hero/CTA only need the boolean.
export function useAuthStatus() {
    const { isAuthenticated, loading } = useUserRole();
    return { isAuthenticated, loading };
}

