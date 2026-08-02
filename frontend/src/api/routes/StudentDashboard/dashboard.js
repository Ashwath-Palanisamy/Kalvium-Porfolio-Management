import jwt from "../../Helpers/jwt";
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