import apiClient from "../../config/app";

// Fetches the list of all students
export const getAllStudents = async () => {
  const response = await apiClient.get('/public/profiles');
  return response.data;
};

export const getFeaturedStudents = async () => {
  const response = await apiClient.get("/public/profiles/featured");
  return response.data;
};

// Fetches a single student by their user_id
export const getStudentByUserId = async (userId) => {
  const response = await apiClient.get(`/public/profiles/${userId}`);
  return response.data;
};

// Fetches GitHub Stats
export const getGithubStats = async (url) => {
  const response = await apiClient.post('/public/github', { url });
  return response.data;
};

// Fetches LeetCode Stats
export const getLeetcodeStats = async (url) => {
  const response = await apiClient.post('/public/leetcode', { url });
  return response.data;
};