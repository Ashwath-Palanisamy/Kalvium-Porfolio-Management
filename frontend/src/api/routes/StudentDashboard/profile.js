import jwt from "../../Helpers/jwt";
import apiClient from "../../config/app";

async function getProfile() {
    const token = await jwt();

    if (!token) {
        console.error("No active session found");
        return;
    }

    try {
        const response = await apiClient.get("/api/auth/profile", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        console.log(token)

        return response.data; 
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
}