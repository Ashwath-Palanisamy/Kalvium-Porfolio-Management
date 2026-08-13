import apiClient from "../../config/app";

export const getLeaderboardData = async () => {
    try {
        const response = await apiClient.get("/public/leetcode-leaderboard");
        return response.data;
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        throw error;
    }
}