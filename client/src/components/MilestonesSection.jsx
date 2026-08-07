import React, { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiCalendar,
  FiCheckSquare,
  FiAlertCircle,
  FiLoader,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import {
  getProjectMilestonesApi,
  createMilestoneApi,
  updateMilestoneApi,
  updateMilestoneStatusApi,
  deleteMilestoneApi,
  getMilestoneTasksApi,
  getProjectProposalsApi,
  updateTaskStatusApi,
  deleteTaskApi,
} from "../api/apiServices";
import Modal from "./Modal";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";
import TasksList from "./TasksList";
import TaskModal from "./TaskModal";
import TaskDetailModal from "./TaskDetailModal";

const MilestonesSection = ({ projectId, project }) => {
  const { user, role } = useAuth();

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Milestone Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // Milestone Delete confirm state
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);

  // Milestone Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Milestone Status updating ID
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // --- Task State Management ---
  const [tasksMap, setTasksMap] = useState({}); // { [milestoneId]: Task[] }
  const [tasksLoadingMap, setTasksLoadingMap] = useState({}); // { [milestoneId]: boolean }
  const [tasksErrorMap, setTasksErrorMap] = useState({}); // { [milestoneId]: string }
  const [expandedMilestones, setExpandedMilestones] = useState({}); // { [milestoneId]: boolean }

  // Task Modals State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMilestoneId, setTaskModalMilestoneId] = useState(null);
  const [taskModalEditingTask, setTaskModalEditingTask] = useState(null);

  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [taskDetailTaskId, setTaskDetailTaskId] = useState(null);

  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [deletingTaskMilestoneId, setDeletingTaskMilestoneId] = useState(null);
  const [taskStatusUpdatingId, setTaskStatusUpdatingId] = useState(null);

  // Assigned Project Freelancers
  const [projectFreelancers, setProjectFreelancers] = useState([]);

  // Permissions check
  const isClient =
    role === "client" ||
    (project?.client &&
      (project.client._id === user?._id || project.client === user?._id));
  const isFreelancer = role === "freelancer";
  const isAdmin = role === "admin";

  const canCreate = isClient || isAdmin;
  const canEdit = isClient || isAdmin;
  const canDelete = isClient || isAdmin;
  const canChangeStatus = isFreelancer || isAdmin;

  // Task Permissions
  const canCreateTask = isClient || isAdmin;
  const canEditTask = isClient || isAdmin;
  const canDeleteTask = isClient || isAdmin;
  const canChangeTaskStatus = isFreelancer || isAdmin;

  // Fetch project freelancers for assigned dropdown
  const fetchProjectFreelancers = async () => {
    try {
      const list = [];
      // 1. If project object has freelancers array
      if (project?.freelancers && Array.isArray(project.freelancers)) {
        project.freelancers.forEach((f) => {
          if (f) list.push(f);
        });
      }

      // 2. Fetch project proposals to get freelancers with accepted/submitted proposals (Client/Admin only)
      if (projectId && (isClient || isAdmin)) {
        try {
          const propRes = await getProjectProposalsApi(projectId);
          if (propRes?.proposals) {
            propRes.proposals.forEach((p) => {
              if (p?.freelancer) {
                const fId =
                  typeof p.freelancer === "object"
                    ? p.freelancer._id
                    : p.freelancer;
                const exists = list.some((item) => {
                  const itemId = typeof item === "object" ? item._id : item;
                  return itemId === fId;
                });
                if (!exists) {
                  list.push(p.freelancer);
                }
              }
            });
          }
        } catch (e) {
          // ignore error if client cannot access proposals or none exist
        }
      }

      // 3. Fallback: If still no freelancers, fetch all platform freelancers
      if (list.length === 0) {
        try {
          const freeRes = await api.get("/freelancer");
          if (freeRes.data?.freelancers) {
            freeRes.data.freelancers.forEach((pf) => {
              if (pf?.user) {
                list.push(pf.user);
              }
            });
          }
        } catch (e) {
          console.error("Fallback freelancer fetch error:", e);
        }
      }

      setProjectFreelancers(list);
    } catch (err) {
      console.error("Fetch Project Freelancers Error:", err);
    }
  };

  useEffect(() => {
    fetchProjectFreelancers();
  }, [projectId, project]);

  // Fetch single milestone tasks
  const fetchMilestoneTasks = async (milestoneId) => {
    if (!milestoneId) return;
    try {
      setTasksLoadingMap((prev) => ({ ...prev, [milestoneId]: true }));
      setTasksErrorMap((prev) => ({ ...prev, [milestoneId]: null }));
      const res = await getMilestoneTasksApi(milestoneId);
      setTasksMap((prev) => ({
        ...prev,
        [milestoneId]: res.tasks || [],
      }));
    } catch (err) {
      console.error("Fetch Tasks Error for milestone", milestoneId, err);
      const msg = err?.response?.data?.message || "Failed to load tasks.";
      setTasksErrorMap((prev) => ({ ...prev, [milestoneId]: msg }));
    } finally {
      setTasksLoadingMap((prev) => ({ ...prev, [milestoneId]: false }));
    }
  };

  // Fetch all milestones
  const fetchMilestones = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getProjectMilestonesApi(projectId);
      const fetchedMilestones = res.milestones || [];
      setMilestones(fetchedMilestones);

      // Fetch tasks for each milestone
      fetchedMilestones.forEach((m) => {
        fetchMilestoneTasks(m._id);
      });
    } catch (err) {
      console.error("Fetch Milestones Error:", err);
      const msg =
        err?.response?.data?.message || "Failed to load project milestones.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  // Milestone Handlers
  const handleOpenCreateModal = () => {
    setTitle("");
    setDescription("");
    setAmount(project?.budget ? String(project.budget) : "100");
    setDueDate("");
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a milestone title.");
      return;
    }
    if (!amount || Number(amount) < 0) {
      toast.error("Please enter a valid milestone amount.");
      return;
    }
    if (!dueDate) {
      toast.error("Please select a due date.");
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await createMilestoneApi({
        project: projectId,
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        dueDate,
      });
      toast.success(res.message || "Milestone created successfully!");
      setCreateModalOpen(false);
      fetchMilestones();
    } catch (err) {
      console.error("Create Milestone Error:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEditModal = (milestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title || "");
    setDescription(milestone.description || "");
    setAmount(milestone.amount ? String(milestone.amount) : "");
    if (milestone.dueDate) {
      const d = new Date(milestone.dueDate);
      setDueDate(d.toISOString().split("T")[0]);
    } else {
      setDueDate("");
    }
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMilestone) return;
    if (!title.trim()) {
      toast.error("Please enter a milestone title.");
      return;
    }
    if (!amount || Number(amount) < 0) {
      toast.error("Please enter a valid milestone amount.");
      return;
    }
    if (!dueDate) {
      toast.error("Please select a due date.");
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await updateMilestoneApi(editingMilestone._id, {
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        dueDate,
      });
      toast.success(res.message || "Milestone updated successfully!");
      setEditModalOpen(false);
      setEditingMilestone(null);
      fetchMilestones();
    } catch (err) {
      console.error("Update Milestone Error:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteMilestone = async () => {
    if (!deletingMilestoneId) return;
    try {
      setFormSubmitting(true);
      const res = await deleteMilestoneApi(deletingMilestoneId);
      toast.success(res.message || "Milestone deleted successfully!");
      setDeletingMilestoneId(null);
      fetchMilestones();
    } catch (err) {
      console.error("Delete Milestone Error:", err);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      setStatusUpdatingId(milestoneId);
      const res = await updateMilestoneStatusApi(milestoneId, newStatus);
      toast.success(res.message || "Milestone status updated!");
      setMilestones((prev) =>
        prev.map((m) => (m._id === milestoneId ? { ...m, status: newStatus } : m))
      );
      fetchMilestones();
    } catch (err) {
      console.error("Update Status Error:", err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // --- Task Action Handlers ---
  const toggleExpandMilestone = (milestoneId) => {
    setExpandedMilestones((prev) => {
      const current = Boolean(prev[milestoneId]);
      const updated = { ...prev, [milestoneId]: !current };
      if (!current && !tasksMap[milestoneId]) {
        fetchMilestoneTasks(milestoneId);
      }
      return updated;
    });
  };

  const handleOpenAddTaskModal = (milestoneId) => {
    setTaskModalMilestoneId(milestoneId);
    setTaskModalEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleOpenEditTaskModal = (task) => {
    setTaskModalMilestoneId(task.milestone);
    setTaskModalEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleViewTask = (taskId) => {
    setTaskDetailTaskId(taskId);
    setTaskDetailModalOpen(true);
  };

  const handleDeleteTaskPrompt = (taskId, milestoneId) => {
    setDeletingTaskId(taskId);
    setDeletingTaskMilestoneId(milestoneId);
  };

  const handleDeleteTaskConfirm = async () => {
    if (!deletingTaskId) return;
    try {
      const res = await deleteTaskApi(deletingTaskId);
      toast.success(res.message || "Task deleted successfully!");
      if (deletingTaskMilestoneId) {
        fetchMilestoneTasks(deletingTaskMilestoneId);
        fetchMilestones();
      }
      setDeletingTaskId(null);
      setDeletingTaskMilestoneId(null);
    } catch (err) {
      console.error("Delete Task Error:", err);
    }
  };

  const handleTaskStatusChange = async (taskId, milestoneId, newStatus) => {
    try {
      setTaskStatusUpdatingId(taskId);
      const res = await updateTaskStatusApi(taskId, newStatus);
      toast.success(res.message || "Task status updated!");
      // Optimistic update
      setTasksMap((prev) => ({
        ...prev,
        [milestoneId]: (prev[milestoneId] || []).map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        ),
      }));
      fetchMilestoneTasks(milestoneId);
      fetchMilestones();
    } catch (err) {
      console.error("Task Status Update Error:", err);
    } finally {
      setTaskStatusUpdatingId(null);
    }
  };

  // Helper to compute derived milestone status from loaded tasks
  const getDerivedMilestoneStatus = (m) => {
    const mTasks = tasksMap[m._id] || [];
    const total = mTasks.length;
    const completed = mTasks.filter((t) => t.status === "Completed").length;
    const inProgress = mTasks.filter((t) => t.status === "In Progress").length;

    if (total > 0 && completed === total) return "Completed";
    if (inProgress > 0 || completed > 0) return "In Progress";
    return m.status || "Pending";
  };

  // Progress Calculations across milestones and tasks
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => getDerivedMilestoneStatus(m) === "Completed"
  ).length;

  let totalTasksAll = 0;
  let completedTasksAll = 0;

  milestones.forEach((m) => {
    const mTasks = tasksMap[m._id] || [];
    totalTasksAll += mTasks.length;
    completedTasksAll += mTasks.filter((t) => t.status === "Completed").length;
  });

  const progressPercent =
    totalTasksAll > 0
      ? Math.round((completedTasksAll / totalTasksAll) * 100)
      : totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Delete Milestone Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingMilestoneId)}
        title="Delete Milestone?"
        message="Are you sure you want to delete this milestone? All associated tasks will also be removed."
        confirmLabel="Delete Milestone"
        cancelLabel="Cancel"
        onConfirm={handleDeleteMilestone}
        onCancel={() => setDeletingMilestoneId(null)}
      />

      {/* Delete Task Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTaskId)}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        cancelLabel="Cancel"
        onConfirm={handleDeleteTaskConfirm}
        onCancel={() => {
          setDeletingTaskId(null);
          setDeletingTaskMilestoneId(null);
        }}
      />

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setTaskModalEditingTask(null);
          setTaskModalMilestoneId(null);
        }}
        onSuccess={() => {
          if (taskModalMilestoneId) {
            fetchMilestoneTasks(taskModalMilestoneId);
            fetchMilestones();
            setExpandedMilestones((prev) => ({
              ...prev,
              [taskModalMilestoneId]: true,
            }));
          }
        }}
        projectId={projectId}
        milestoneId={taskModalMilestoneId}
        task={taskModalEditingTask}
        projectFreelancers={projectFreelancers}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={taskDetailModalOpen}
        onClose={() => {
          setTaskDetailModalOpen(false);
          setTaskDetailTaskId(null);
        }}
        taskId={taskDetailTaskId}
      />

      {/* Header Panel */}
      <div className="glass-card rounded-3xl border border-white/10 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#6366F1]">
                Project Deliverables
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white font-display flex items-center gap-2">
              Milestones & Tasks
              {totalMilestones > 0 && (
                <span className="text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  {completedMilestones}/{totalMilestones} Completed
                </span>
              )}
            </h2>
            <p className="mt-1 text-xs text-gray-400 max-w-xl leading-relaxed">
              Track contract phases, milestone tasks, assigned freelancers, and deliverable deadlines.
            </p>
          </div>

          {canCreate && (
            <Button
              onClick={handleOpenCreateModal}
              icon={<FiPlus />}
              variant="primary"
            >
              Add Milestone
            </Button>
          )}
        </div>

        {/* Progress Bar Header Summary */}
        {totalMilestones > 0 && (
          <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-gray-300">Overall Progress</span>
              <span className="text-[#22C55E] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6366F1] via-[#3B82F6] to-[#22C55E] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton State */}
      {loading ? (
        <div className="grid gap-5">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="glass-card rounded-3xl border border-white/10 p-6 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 bg-white/10 rounded w-1/3" />
                <div className="h-6 bg-white/10 rounded-full w-24" />
              </div>
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/10 rounded w-1/2" />
              <div className="h-10 bg-white/5 rounded-2xl w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="glass-card rounded-3xl border border-red-500/20 bg-red-500/5 p-6 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-400">Could not load milestones</h4>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{error}</p>
            <button
              onClick={fetchMilestones}
              className="mt-3 text-xs font-semibold text-indigo-400 hover:underline cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : milestones.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-3xl border border-white/10 p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-[#6366F1]">
            <FiCheckSquare className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              No milestones have been created yet.
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
              Milestones help structure deliverables, monitor progress, and trigger escrow releases upon completion.
            </p>
          </div>

          {isClient && (
            <div className="pt-2">
              <Button
                onClick={handleOpenCreateModal}
                icon={<FiPlus />}
                variant="primary"
              >
                Create First Milestone
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Milestones List */
        <div className="grid gap-5">
          {milestones.map((milestone) => {
            // Milestone Tasks & Auto Status Calculation
            const milestoneTasks = tasksMap[milestone._id] || [];
            const totalTasks = milestoneTasks.length;
            const pendingTasks = milestoneTasks.filter(
              (t) => t.status === "Pending" || !t.status
            ).length;
            const inProgressTasks = milestoneTasks.filter(
              (t) => t.status === "In Progress"
            ).length;
            const completedTasks = milestoneTasks.filter(
              (t) => t.status === "Completed"
            ).length;

            // Derived milestone status based on tasks
            const isAllTasksCompleted = totalTasks > 0 && completedTasks === totalTasks;
            const isAnyTaskActive = inProgressTasks > 0 || completedTasks > 0;

            const displayStatus = isAllTasksCompleted
              ? "Completed"
              : isAnyTaskActive
              ? "In Progress"
              : milestone.status || "Pending";

            const isCompleted = displayStatus === "Completed";
            const isInProgress = displayStatus === "In Progress";

            const cardProgressPercent =
              totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : isCompleted
                ? 100
                : isInProgress
                ? 50
                : 0;

            const isUpdating = statusUpdatingId === milestone._id;
            const isExpanded = Boolean(expandedMilestones[milestone._id]);

            return (
              <div
                key={milestone._id}
                className="glass-card rounded-3xl border border-white/10 p-6 space-y-5 hover:border-white/20 transition-all duration-300"
              >
                {/* Top Row: Title + Status */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-white font-display">
                        {milestone.title}
                      </h3>
                      {milestone.amount > 0 && (
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                          <FiDollarSign className="w-3 h-3" />
                          {milestone.amount}
                        </span>
                      )}
                    </div>
                    {milestone.description && (
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line pt-1">
                        {milestone.description}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
                        isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : isInProgress
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted
                            ? "bg-emerald-400 animate-pulse"
                            : isInProgress
                            ? "bg-indigo-400 animate-pulse"
                            : "bg-amber-400"
                        }`}
                      />
                      {displayStatus}
                    </span>
                  </div>
                </div>

                {/* Due Date & Milestone Progress */}
                <div className="grid gap-4 sm:grid-cols-2 items-center text-xs border-t border-b border-white/5 py-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FiCalendar className="w-4 h-4 text-indigo-400" />
                    <span>Due:</span>
                    <span className="font-semibold text-white">
                      {milestone.dueDate
                        ? new Date(milestone.dueDate).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "No deadline specified"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] text-gray-400">
                      <span>Milestone Progress</span>
                      <span className="font-bold text-gray-200">
                        {cardProgressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-[#22C55E]"
                            : isInProgress
                            ? "bg-[#6366F1]"
                            : "bg-amber-400"
                        }`}
                        style={{ width: `${cardProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Task Section Card Summary */}
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FiCheckSquare className="text-[#6366F1] w-4 h-4" />
                      <span className="text-xs font-bold text-white">
                        Task Section
                      </span>
                      {/* Summary Statistics */}
                      <div className="flex items-center gap-1.5 flex-wrap ml-2">
                        <span className="text-[10px] font-semibold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-gray-300">
                          Total: <strong className="text-white">{totalTasks}</strong>
                        </span>
                        <span className="text-[10px] font-semibold bg-gray-500/10 border border-gray-500/20 px-2 py-0.5 rounded-md text-gray-400">
                          Pending: <strong>{pendingTasks}</strong>
                        </span>
                        <span className="text-[10px] font-semibold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md text-blue-400">
                          In Progress: <strong>{inProgressTasks}</strong>
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-emerald-400">
                          Completed: <strong>{completedTasks}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Task Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {canCreateTask && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddTaskModal(milestone._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#6366F1]/20 border border-[#6366F1]/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-[#6366F1]/30 transition"
                        >
                          <FiPlus className="w-3.5 h-3.5" /> Add Task
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpandMilestone(milestone._id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                      >
                        {isExpanded ? (
                          <>
                            Hide Tasks <FiChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            View Tasks ({totalTasks}){" "}
                            <FiChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tasks List Content (Expandable) */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-white/5">
                      <TasksList
                        tasks={milestoneTasks}
                        loading={Boolean(tasksLoadingMap[milestone._id])}
                        error={tasksErrorMap[milestone._id]}
                        canEdit={canEditTask}
                        canDelete={canDeleteTask}
                        canChangeStatus={canChangeTaskStatus}
                        onEditTask={handleOpenEditTaskModal}
                        onDeleteTask={(tId) =>
                          handleDeleteTaskPrompt(tId, milestone._id)
                        }
                        onStatusChange={(tId, newStat) =>
                          handleTaskStatusChange(tId, milestone._id, newStat)
                        }
                        onViewTask={handleViewTask}
                        statusUpdatingId={taskStatusUpdatingId}
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Actions Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span>
                      Milestone status automatically advances from <strong>Pending</strong> → <strong>In Progress</strong> → <strong>Completed</strong> based on task updates.
                    </span>
                  </div>

                  {/* Client / Admin Edit & Delete Milestone Buttons */}
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-2 justify-end">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(milestone)}
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-white transition"
                        >
                          <FiEdit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit Milestone
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingMilestoneId(milestone._id)}
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Delete Milestone
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Milestone Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Milestone"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Milestone Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Development & UI Integration"
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific features, screen layouts, or deliverables for this phase..."
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                Amount ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input w-full rounded-2xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={formSubmitting}
              icon={<FiPlus />}
            >
              Create Milestone
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Milestone Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingMilestone(null);
        }}
        title="Edit Milestone Details"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Milestone Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Development & UI Integration"
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific features, screen layouts, or deliverables..."
              className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                Amount ($) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500"
                className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                Due Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="glass-input w-full rounded-2xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditModalOpen(false);
                setEditingMilestone(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={formSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MilestonesSection;
