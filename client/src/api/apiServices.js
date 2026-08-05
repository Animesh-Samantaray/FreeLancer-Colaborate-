import api from "./axios";

/* ==========================================================================
   PROPOSAL API SERVICES
   ========================================================================== */

// Freelancer submits a proposal
export const createProposalApi = async (data) => {
  const response = await api.post("/proposal", data);
  return response.data;
};

// Freelancer views all of their proposals
export const getMyProposalsApi = async () => {
  const response = await api.get("/proposal/my");
  return response.data;
};

// Client views proposals for a specific project
export const getProjectProposalsApi = async (projectId) => {
  const response = await api.get(`/proposal/project/${projectId}`);
  return response.data;
};

// Client accepts or rejects a proposal (status: "Accepted" | "Rejected")
export const updateProposalStatusApi = async (id, status) => {
  const response = await api.put(`/proposal/${id}`, { status });
  return response.data;
};

// Freelancer withdraws proposal or Admin deletes it
export const deleteProposalApi = async (id) => {
  const response = await api.delete(`/proposal/${id}`);
  return response.data;
};

/* ==========================================================================
   INVITATION API SERVICES
   ========================================================================== */

// Client sends an invitation to a freelancer
export const createInvitationApi = async (data) => {
  const response = await api.post("/invitation", data);
  return response.data;
};

// Client views invitations sent for a project
export const getProjectInvitationsApi = async (projectId) => {
  const response = await api.get(`/invitation/project/${projectId}`);
  return response.data;
};

// Client withdraws/deletes an invitation
export const deleteInvitationApi = async (id) => {
  const response = await api.delete(`/invitation/${id}`);
  return response.data;
};

// Freelancer views invitations received
export const getMyInvitationsApi = async () => {
  const response = await api.get("/invitation/my");
  return response.data;
};

// Freelancer accepts or rejects an invitation (status: "Accepted" | "Rejected")
export const updateInvitationStatusApi = async (id, status) => {
  const response = await api.put(`/invitation/${id}`, { status });
  return response.data;
};
