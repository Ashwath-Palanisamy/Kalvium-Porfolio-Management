import apiClient from "../../config/app";

export async function getGitHubStats(githubUrl) {
    if (!githubUrl) return null;

    try {
        const response = await apiClient.post("/student/dashboard/github", { url: githubUrl });
        return response.data;
    } catch (err) {
        console.error("GitHub API fetch error:", err?.response?.data || err.message);
        return null;
    }
}

export async function getLeetCodeStats(leetcodeUrl) {
    if (!leetcodeUrl) return null;

    try {
        const response = await apiClient.post("/student/dashboard/leetcode", { url: leetcodeUrl });
        return response.data; 
    } catch (err) {
        console.error("LeetCode API fetch error:", err?.response?.data || err.message);
        return null;
    }
}