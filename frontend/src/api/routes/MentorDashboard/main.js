import apiClient from "../../config/app";
import jwt from "../../Helpers/jwt";

// ==========================================
// SQUAD MANAGEMENT
// ==========================================

export async function getSquads() {
  const token = await jwt();
  if (!token) {
    console.error("No active session found");
    return [];
  }

  try {
    const response = await apiClient.get("/mentor/dashboard/getsquads", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.squads || [];
  } catch (error) {
    console.error("Error fetching squads:", error);
    throw error;
  }
}

export async function saveSquad(squads) {
  const token = await jwt();
  if (!token) {
    console.error("No active session found");
    return;
  }

  try {
    const response = await apiClient.post(
      "/mentor/dashboard/savesquad",
      { squads },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error saving squad:", error);
    throw error;
  }
}

export async function getStudents(squadId = null) {
  const token = await jwt();
  if (!token) {
    console.error("No active session found");
    return [];
  }

  try {
    const response = await apiClient.get("/mentor/dashboard/students", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: squadId ? { squad_id: squadId } : {},
    });

    return response.data.students || [];
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

// ==========================================
// INDIVIDUAL STUDENT MANAGEMENT
// ==========================================

export async function getAssignedStudents() {
  const token = await jwt();
  if (!token) {
    console.error("No active session found");
    return [];
  }

  try {
    const response = await apiClient.get("/mentor/dashboard/assigned-students", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.students || [];
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    throw error;
  }
}

export async function assignStudent(studentUserId, squadId) {
  const token = await jwt();
  if (!token) {
    console.error("No active session found");
    return;
  }

  try {
    const response = await apiClient.post(
      "/mentor/dashboard/assign-student",
      { student_user_id: studentUserId, squad_id: squadId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error assigning student:", error);
    throw error;
  }
}

export async function unassignStudent(studentUserId) {
  const token = await jwt();
  if (!token) {
    console.error("No active session found");
    return;
  }

  try {
    const response = await apiClient.post(
      "/mentor/dashboard/unassign-student",
      { student_user_id: studentUserId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error unassigning student:", error);
    throw error;
  }
}

// ==========================================
// BULK & EXTENDED ACTIONS (ADDED)
// ==========================================

/**
 * Assigns an array of students to a roster/squad in parallel execution.
 * @param {Array<{student_user_id: string|number, squad_id: string|number}>} studentList
 */
export async function assignBulkStudents(studentList) {
  if (!Array.isArray(studentList) || studentList.length === 0) return [];

  try {
    const assignPromises = studentList.map((item) =>
      assignStudent(item.student_user_id || item.id, item.squad_id)
    );
    return await Promise.all(assignPromises);
  } catch (error) {
    console.error("Error in bulk assigning students:", error);
    throw error;
  }
}

/**
 * Unassigns multiple students simultaneously.
 * @param {Array<string|number>} studentUserIds
 */
export async function unassignBulkStudents(studentUserIds) {
  if (!Array.isArray(studentUserIds) || studentUserIds.length === 0) return [];

  try {
    const unassignPromises = studentUserIds.map((id) => unassignStudent(id));
    return await Promise.all(unassignPromises);
  } catch (error) {
    console.error("Error in bulk unassigning students:", error);
    throw error;
  }
}

/**
 * Fetches detailed stats/activity breakdown for a specific student.
 * @param {string|number} studentUserId
 */
export async function getStudentStats(studentUserId) {
  const token = await jwt();
  if (!token) {
    console.error("No active session found");
    return null;
  }

  try {
    const response = await apiClient.get(
      `/mentor/dashboard/student-stats/${studentUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for student ${studentUserId}:`, error);
    throw error;
  }
}

// ==========================================
// LEETCODE MENTOR REVIEW
// ==========================================

/**
 * Get all students/submissions waiting for mentor review.
 */
export async function getLeetCodeReviewQueue() {
  const token = await jwt();

  if (!token) {
    console.error("No active session found");
    return [];
  }

  try {
    const response = await apiClient.get(
      "/mentor/dashboard/leetcode-review-queue",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.reviews || [];
  } catch (error) {
    console.error("Error fetching LeetCode review queue:", error);
    throw error;
  }
}


/**
 * Approve a student's suspicious submission.
 */
export async function approveLeetCodeSubmission(submissionId) {
  const token = await jwt();

  if (!token) {
    console.error("No active session found");
    return null;
  }

  try {
    const response = await apiClient.patch(
      `/mentor/dashboard/leetcode-review/${submissionId}/approve`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error approving submission ${submissionId}:`,
      error
    );
    throw error;
  }
}


/**
 * Reject a student's suspicious submission.
 */
export async function rejectLeetCodeSubmission(
  submissionId,
  reason = null
) {
  const token = await jwt();

  if (!token) {
    console.error("No active session found");
    return null;
  }

  try {
    const response = await apiClient.patch(
      `/mentor/dashboard/leetcode-review/${submissionId}/reject`,
      {
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error rejecting submission ${submissionId}:`,
      error
    );
    throw error;
  }
}