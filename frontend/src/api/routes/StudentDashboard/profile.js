import jwt from "../../Helpers/jwt";
import apiClient from "../../config/app";

export async function getProfile() {
    const token = await jwt();

    if (!token) {
        console.error("No active session found");
        return;
    }

    try {
        const response = await apiClient.get("/student/dashboard/profile", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        return response.data; 
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}

export async function updateProfile(params) {
    const token = await jwt();

    if (!token) {
        console.error("No active session found");
        return;
    }

    try {
        const response = await apiClient.put("/student/dashboard/updateprofile", params, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
}