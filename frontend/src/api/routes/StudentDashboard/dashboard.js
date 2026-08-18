import apiClient from "../../config/app";
import jwt from "../../Helpers/jwt";

export async function getGitHubStats(githubUrl) {
    if (!githubUrl) return null;

    const token = await jwt();
    if (!token) return null;

    try {
        const response = await apiClient.post(
            "/student/dashboard/github",
            { url: githubUrl },
            {
                headers: {
                    Authorization: ["Bearer", token].join(" "),
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (err) {
        console.error("GitHub API fetch error:", err?.response?.data || err.message);
        return null;
    }
}

export async function getLeetCodeStats(leetcodeUrl) {
    if (!leetcodeUrl) return null;

    const token = await jwt();
    if (!token) return null;

    try {
        const response = await apiClient.post(
            "/student/dashboard/leetcode",
            { url: leetcodeUrl },
            {
                headers: {
                    Authorization: ["Bearer", token].join(" "),
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data; 
    } catch (err) {
        console.error("LeetCode API fetch error:", err?.response?.data || err.message);
        return null;
    }
}

// ==========================================
// GET Pending Mentor Review Status
// ==========================================
export async function getPendingReviewStatus() {
    const token = await jwt();

    if (!token) {
        console.error("No active session found");
        return {
            hasPendingReview: false,
            pendingReviewCount: 0,
            submissions: [],
            profile: {}
        };
    }

    try {
        const response = await apiClient.get(
            "/student/dashboard/pending-review",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error(
            "Error fetching pending review status:",
            error.response?.data || error.message
        );

        return {
            hasPendingReview: false,
            pendingReviewCount: 0,
            submissions: [],
            profile: {}
        };
    }
}