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

/* ==========================================================================
   MILESTONE API SERVICES
   ========================================================================== */

// Create a new milestone for a project (Client / Admin)
export const createMilestoneApi = async (data) => {
  const response = await api.post("/milestone", data);
  return response.data;
};

// Get all milestones for a project
export const getProjectMilestonesApi = async (projectId) => {
  const response = await api.get(`/milestone/project/${projectId}`);
  return response.data;
};

// Get single milestone details by ID
export const getMilestoneByIdApi = async (id) => {
  const response = await api.get(`/milestone/${id}`);
  return response.data;
};

// Update milestone details (Title, Description, Amount, Due Date) (Client / Admin)
export const updateMilestoneApi = async (id, data) => {
  const response = await api.put(`/milestone/${id}`, data);
  return response.data;
};

// Update milestone status (Pending, In Progress, Completed) (Freelancer / Admin)
export const updateMilestoneStatusApi = async (id, status) => {
  const response = await api.patch(`/milestone/${id}/status`, { status });
  return response.data;
};

// Delete a milestone (Client / Admin)
export const deleteMilestoneApi = async (id) => {
  const response = await api.delete(`/milestone/${id}`);
  return response.data;
};
/* ==========================================================================
   TASK API SERVICES
   ========================================================================== */

// Create a new task (Client / Admin)
export const createTaskApi = async (data) => {
  const response = await api.post("/task", data);
  return response.data;
};

// Get all tasks for a milestone
export const getMilestoneTasksApi = async (milestoneId) => {
  const response = await api.get(`/task/milestone/${milestoneId}`);
  return response.data;
};

// Get single task details by ID
export const getTaskByIdApi = async (id) => {
  const response = await api.get(`/task/${id}`);
  return response.data;
};

// Update task details (Client / Admin)
export const updateTaskApi = async (id, data) => {
  const response = await api.put(`/task/${id}`, data);
  return response.data;
};

// Update task status (Pending, In Progress, Completed) (Freelancer / Admin)
export const updateTaskStatusApi = async (id, status) => {
  const response = await api.patch(`/task/${id}/status`, { status });
  return response.data;
};

// Delete a task (Client / Admin)
export const deleteTaskApi = async (id) => {
  const response = await api.delete(`/task/${id}`);
  return response.data;
};

/* ==========================================================================
   CONVERSATION API SERVICES
   ========================================================================== */

// Get all conversations for current user
export const getMyConversationsApi = async () => {
  const response = await api.get("/conversation");
  return response.data;
};

// Create a conversation for a project (Client / Admin)
export const createConversationApi = async (projectId) => {
  const response = await api.post(`/conversation/project/${projectId}`);
  return response.data;
};

// Get conversation for a specific project
export const getProjectConversationApi = async (projectId) => {
  const response = await api.get(`/conversation/project/${projectId}`);
  return response.data;
};

/* ==========================================================================
   MESSAGE API SERVICES
   ========================================================================== */

// Send a message in a conversation
export const sendMessageApi = async (conversationId, message) => {
  const response = await api.post(`/message/${conversationId}`, { message });
  return response.data;
};

// Get all messages in a conversation
export const getConversationMessagesApi = async (conversationId) => {
  const response = await api.get(`/message/${conversationId}`);
  return response.data;
};

// Mark a message as read
export const markMessageReadApi = async (messageId) => {
  const response = await api.patch(`/message/read/${messageId}`);
  return response.data;
};

// Delete a message (Sender / Admin)
export const deleteMessageApi = async (messageId) => {
  const response = await api.delete(`/message/${messageId}`);
  return response.data;
};