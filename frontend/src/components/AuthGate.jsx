import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../../backend/src/config/supabase";

function AuthGate({ children }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setUser(data.session?.user ?? null);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <h1>Loading...</h1>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default AuthGate;