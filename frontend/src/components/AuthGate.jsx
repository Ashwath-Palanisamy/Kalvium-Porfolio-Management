import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AuthGate({ children }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function initAuth() {
            // Check if Supabase passed tokens via URL hash (e.g., #access_token=...)
            const hash = window.location.hash;
            if (hash && hash.includes("access_token")) {
                // Let Supabase parse and store the session from the hash parameters automatically
                await supabase.auth.getSession();
                // Clean the token hash from the URL bar for security and cleanliness
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Fetch the active session
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Session error:", error.message);
            }

            if (isMounted) {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        }

        initAuth();

        // Listen for future auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}><h1>Loading...</h1></div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default AuthGate;