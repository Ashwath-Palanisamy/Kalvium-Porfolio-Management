import apiClient from "../../config/app";
import jwt from "../../Helpers/jwt";

// ==========================================
// LEETCODE EXCEPTION REQUESTS (student)
// ==========================================

export async function getMyExceptionRequests() {
    const token = await jwt();
    if (!token) return { requests: [], latest: null, hasAccepted: false };
    try {
        const response = await apiClient.get("/student/dashboard/exception-request", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (err) {
        console.error("Exception requests fetch error:", err?.response?.data || err.message);
        return { requests: [], latest: null, hasAccepted: false };
    }
}

export async function submitExceptionRequest(reason, days = 3) {
    const token = await jwt();
    if (!token) throw new Error("No active session found");
    const response = await apiClient.post(
        "/student/dashboard/exception-request",
        { reason, days },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return response.data;
}
