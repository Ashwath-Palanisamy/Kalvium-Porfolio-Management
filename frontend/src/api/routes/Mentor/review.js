import apiClient from "../../config/app";
import jwt from "../../Helpers/jwt";

// NOT IMPLEMENTED — Mentor Review (rapid-solve queue) is disabled.
// These helpers throw immediately so no UI can silently call the old endpoints.

const notImplemented = () => {
  throw new Error("Mentor Review is not implemented");
};

export async function getMentorReviewQueue() {
  notImplemented();
}

export async function approveMentorReview(studentUserId) {
  notImplemented();
}

export async function rejectMentorReview(studentUserId) {
  notImplemented();
}
