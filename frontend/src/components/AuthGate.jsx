import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AuthGate({ children }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function checkSession() {
            // Give Supabase a moment to process any incoming URL hash/query tokens from Google
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error("Session error:", error.message);
            }

            if (isMounted) {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        }

        checkSession();

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