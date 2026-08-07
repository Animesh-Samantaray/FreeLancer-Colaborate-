import React, { useEffect, useState } from "react";
import {
  FiCalendar,
  FiUser,
  FiFolder,
  FiCheckSquare,
  FiAlertCircle,
  FiClock,
  FiTag,
  FiLoader,
} from "react-icons/fi";
import Modal from "./Modal";
import Button from "./Button";
import { getTaskByIdApi } from "../api/apiServices";

const TaskDetailModal = ({ isOpen, onClose, taskId }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!taskId || !isOpen) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getTaskByIdApi(taskId);
        setTask(res.task || null);
      } catch (err) {
        console.error("Fetch Task Detail Error:", err);
        setError(err?.response?.data?.message || "Failed to load task details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId, isOpen]);

  if (!isOpen) return null;

  // Badge helpers
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "Medium":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Low":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-400";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      case "In Progress":
        return "bg-blue-500/10 border-blue-500/20 text-blue-400";
      case "Pending":
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-400";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      maxWidth="max-w-xl"
    >
      {loading ? (
        <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-3">
          <FiLoader className="w-8 h-8 animate-spin text-[#6366F1]" />
          <p className="text-xs">Fetching task details...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-400 space-y-3">
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : task ? (
        <div className="space-y-6">
          {/* Header row with badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                Task Brief
              </span>
              <h3 className="text-xl font-bold text-white font-display mt-2">
                {task.title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${getPriorityBadge(
                  task.priority
                )}`}
              >
                {task.priority || "Medium"} Priority
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border ${getStatusBadge(
                  task.status
                )}`}
              >
                {task.status || "Pending"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Description
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed bg-white/5 border border-white/10 p-4 rounded-2xl whitespace-pre-line">
              {task.description || "No description provided."}
            </p>
          </div>

          {/* Assigned Freelancer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
              <span className="text-xs text-gray-400 font-semibold block">
                Assigned Freelancer
              </span>
              <p className="text-sm font-bold text-white">
                {typeof task.freelancer === "object"
                  ? task.freelancer?.fullName || "Assigned Freelancer"
                  : task.freelancer}
              </p>
              {typeof task.freelancer === "object" && task.freelancer?.email && (
                <p className="text-xs text-gray-400">{task.freelancer.email}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1">
              <span className="text-xs text-gray-400 font-semibold block">
                Due Date
              </span>
              <p className="text-sm font-bold text-white">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "No due date"}
              </p>
            </div>
          </div>

          {/* Project & Milestone references if populated */}
          {(task.project || task.milestone) && (
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl space-y-2 text-xs">
              {task.project && (
                <div className="flex justify-between items-center text-gray-400">
                  <span>Project:</span>
                  <span className="font-semibold text-white">
                    {typeof task.project === "object"
                      ? task.project?.title
                      : task.project}
                  </span>
                </div>
              )}
              {task.milestone && (
                <div className="flex justify-between items-center text-gray-400">
                  <span>Milestone:</span>
                  <span className="font-semibold text-white">
                    {typeof task.milestone === "object"
                      ? task.milestone?.title
                      : task.milestone}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end pt-2 border-t border-white/10">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default TaskDetailModal;
