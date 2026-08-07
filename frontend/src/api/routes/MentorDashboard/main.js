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

    return response.data.squads;
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
// INDIVIDUAL STUDENT MANAGEMENT (squad_students)
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