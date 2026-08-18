import { supabase } from "../../../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL;

export async function getMentorReviewQueue() {
    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
        throw new Error("You are not authenticated");
    }

    const response = await fetch(
        `${API_URL}/mentor/dashboard/review-queue`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                "Content-Type": "application/json"
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to load review queue"
        );
    }

    return data;
}