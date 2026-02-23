import api from "../../services/api";

// ==============================
// USERS
// ==============================
export const getAllUsers = () =>
  api.get("/admin/users");

export const addRole = (userId, role) =>
  api.put(`/admin/users/${userId}/add-role`, null, {
    params: { role }
  });

export const removeRole = (userId, role) =>
  api.put(`/admin/users/${userId}/remove-role`, null, {
    params: { role }
  });

// ==============================
// REQUESTS
// ==============================
export const getPendingRequests = () =>
  api.get("/admin/dairy-owner-requests");

export const approveRole = (userId) =>
  api.put(`/admin/approve-dairy-owner/${userId}`);

export const rejectRole = (userId) =>
  api.put(`/admin/reject-dairy-owner/${userId}`);
