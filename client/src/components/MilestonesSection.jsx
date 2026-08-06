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
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  getProjectMilestonesApi,
  createMilestoneApi,
  updateMilestoneApi,
  updateMilestoneStatusApi,
  deleteMilestoneApi,
} from "../api/apiServices";
import Modal from "./Modal";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";

const MilestonesSection = ({ projectId, project }) => {
  const { user, role } = useAuth();

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  // Delete confirm state
  const [deletingMilestoneId, setDeletingMilestoneId] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Individual card action loading state (id -> boolean)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

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

  // Fetch milestones
  const fetchMilestones = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await getProjectMilestonesApi(projectId);
      setMilestones(res.milestones || []);
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

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setTitle("");
    setDescription("");
    setAmount(project?.budget ? String(project.budget) : "100");
    setDueDate("");
    setCreateModalOpen(true);
  };

  // Create Submit
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

  // Open Edit Modal
  const handleOpenEditModal = (milestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title || "");
    setDescription(milestone.description || "");
    setAmount(milestone.amount ? String(milestone.amount) : "");
    // Format date string for input[type="date"]
    if (milestone.dueDate) {
      const d = new Date(milestone.dueDate);
      const formattedDate = d.toISOString().split("T")[0];
      setDueDate(formattedDate);
    } else {
      setDueDate("");
    }
    setEditModalOpen(true);
  };

  // Edit Submit
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

  // Delete Confirm Action
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

  // Freelancer / Admin Status Update Dropdown Handler
  const handleStatusChange = async (milestoneId, newStatus) => {
    try {
      setStatusUpdatingId(milestoneId);
      const res = await updateMilestoneStatusApi(milestoneId, newStatus);
      toast.success(res.message || "Milestone status updated!");
      // Optimistic state update & refetch
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

  // Calculate Progress Stats
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(
    (m) => m.status === "Completed"
  ).length;
  const inProgressMilestones = milestones.filter(
    (m) => m.status === "In Progress"
  ).length;
  const progressPercent =
    totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingMilestoneId)}
        title="Delete Milestone?"
        message="Are you sure you want to delete this milestone? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteMilestone}
        onCancel={() => setDeletingMilestoneId(null)}
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
              Milestones
              {totalMilestones > 0 && (
                <span className="text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                  {completedMilestones}/{totalMilestones} Completed
                </span>
              )}
            </h2>
            <p className="mt-1 text-xs text-gray-400 max-w-xl leading-relaxed">
              Track contract phases, status updates, timelines, and escrow release checkpoints.
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
            const isCompleted = milestone.status === "Completed";
            const isInProgress = milestone.status === "In Progress";
            const isPending = milestone.status === "Pending" || !milestone.status;

            // Individual Card Progress Bar %
            const cardProgressPercent = isCompleted ? 100 : isInProgress ? 50 : 0;

            const isUpdating = statusUpdatingId === milestone._id;

            return (
              <div
                key={milestone._id}
                className="glass-card rounded-3xl border border-white/10 p-6 space-y-5 hover:border-white/20 transition-all duration-300"
              >
                {/* Milestone Top Row */}
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
                      {milestone.status || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Due Date & Progress Bar */}
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

                {/* Bottom Actions Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                  {/* Freelancer / Admin Status Dropdown */}
                  {canChangeStatus ? (
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-gray-400 font-semibold shrink-0">
                        Change Status:
                      </label>
                      <div className="relative flex-1 sm:w-48">
                        <select
                          disabled={isUpdating}
                          value={milestone.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(milestone._id, e.target.value)
                          }
                          className="glass-input w-full rounded-2xl border border-white/10 bg-[#09090B] px-3.5 py-2 text-xs font-semibold text-white outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                        >
                          <option value="Pending" className="bg-[#09090B] text-amber-400">
                            Pending
                          </option>
                          <option value="In Progress" className="bg-[#09090B] text-indigo-400">
                            In Progress
                          </option>
                          <option value="Completed" className="bg-[#09090B] text-emerald-400">
                            Completed
                          </option>
                        </select>
                        {isUpdating && (
                          <FiLoader className="w-3.5 h-3.5 animate-spin text-indigo-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      {isClient
                        ? "Status updates are managed by assigned freelancers upon task completion."
                        : ""}
                    </div>
                  )}

                  {/* Client / Admin Edit & Delete buttons */}
                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-2 justify-end">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEditModal(milestone)}
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10 hover:text-white transition"
                        >
                          <FiEdit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setDeletingMilestoneId(milestone._id)}
                          className="inline-flex items-center gap-1.5 rounded-2xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Task Placeholder Section for Future Compatibility */}
                <div className="mt-4 pt-4 border-t border-white/5 bg-white/[0.02] rounded-2xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-gray-300 font-semibold">
                      <FiCheckSquare className="text-[#6366F1]" /> Tasks
                    </span>
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Task module coming soon
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Individual deliverables and sub-tasks will be tracked here.
                  </p>
                  <button
                    disabled
                    type="button"
                    className="mt-2 text-xs text-gray-500 flex items-center gap-1.5 cursor-not-allowed opacity-50 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 font-medium"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Add Task
                  </button>
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
