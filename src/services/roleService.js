import api from "./api";

// Get pending requests
export const getPendingRequests = () =>
  api.get("/admin/dairy-owner-requests");

// Approve
export const approveRole = (userId) =>
  api.put(`/admin/approve-dairy-owner/${userId}`);

// Reject
export const rejectRole = (userId) =>
  api.put(`/admin/reject-dairy-owner/${userId}`);
