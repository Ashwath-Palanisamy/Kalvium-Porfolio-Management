import apiClient from "../../config/app";
import jwt from "../../Helpers/jwt";

// ==========================================
// LEETCODE EXCEPTION REQUESTS (mentor)
// Fast count endpoint keeps the Assigned badge instant; the list call
// is only made when the mentor opens the Exception Requests page.
// ==========================================

let cachedCount = null;
let cachedAt = 0;
const COUNT_TTL_MS = 60 * 1000;

export async function getExceptionRequestCount({ force = false } = {}) {
  const now = Date.now();
  if (!force && cachedCount !== null && now - cachedAt < COUNT_TTL_MS) {
    return { pendingCount: cachedCount };
  }
  const token = await jwt();
  if (!token) return { pendingCount: cachedCount ?? 0 };
  try {
    const res = await apiClient.get("/mentor/dashboard/exception-requests/count", {
      headers: { Authorization: `Bearer ${token}` },
    });
    cachedCount = res.data?.pendingCount ?? 0;
    cachedAt = now;
    return { pendingCount: cachedCount };
  } catch (err) {
    console.error("Exception count error:", err?.response?.data || err.message);
    return { pendingCount: cachedCount ?? 0 };
  }
}

export function invalidateExceptionCountCache() {
  cachedCount = null;
  cachedAt = 0;
}

export async function getExceptionRequests() {
  const token = await jwt();
  if (!token) return { requests: [], pendingCount: 0 };
  try {
    const res = await apiClient.get("/mentor/dashboard/exception-requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (typeof res.data?.pendingCount === "number") {
      cachedCount = res.data.pendingCount;
      cachedAt = Date.now();
    }
    return res.data;
  } catch (err) {
    console.error("Exception requests error:", err?.response?.data || err.message);
    throw err;
  }
}

export async function approveExceptionRequest(id, mentor_note = "") {
  const token = await jwt();
  if (!token) throw new Error("No active session");
  const res = await apiClient.patch(
    `/mentor/dashboard/exception-requests/${id}/approve`,
    { mentor_note },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  invalidateExceptionCountCache();
  return res.data;
}

export async function rejectExceptionRequest(id, mentor_note = "") {
  const token = await jwt();
  if (!token) throw new Error("No active session");
  const res = await apiClient.patch(
    `/mentor/dashboard/exception-requests/${id}/reject`,
    { mentor_note },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  invalidateExceptionCountCache();
  return res.data;
}
