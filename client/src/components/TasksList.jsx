import React from "react";
import {
  FiCheckSquare,
  FiCalendar,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiClock,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

const TasksList = ({
  tasks = [],
  loading = false,
  error = null,
  canEdit = false,
  canDelete = false,
  canChangeStatus = false,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onViewTask,
  statusUpdatingId = null,
}) => {
  // Priority Badges: Low = Green, Medium = Orange, High = Red
  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 border-red-500/20 text-red-400";
      case "Medium":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "Low":
      default:
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
    }
  };

  // Status Badges: Pending = Gray, In Progress = Blue, Completed = Green
  const getStatusBadgeStyle = (status) => {
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

  // Sort tasks by due date ascending
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  if (loading) {
    return (
      <div className="space-y-3 pt-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse flex flex-col gap-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-4 bg-white/10 rounded-full w-20" />
            </div>
            <div className="h-3 bg-white/10 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
        <FiAlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (sortedTasks.length === 0) {
    return (
      <div className="p-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
        <p className="text-xs font-semibold text-gray-400">
          No tasks added to this milestone yet.
        </p>
        <p className="text-[11px] text-gray-500">
          Use "+ Add Task" to break this deliverable into trackable items.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {sortedTasks.map((task) => {
        const isUpdating = statusUpdatingId === task._id;
        const freelancerName =
          typeof task.freelancer === "object"
            ? task.freelancer?.fullName || "Assigned Freelancer"
            : "Assigned Freelancer";

        return (
          <div
            key={task._id}
            className="group glass-card rounded-2xl border border-white/10 p-4 hover:border-white/20 transition-all duration-200 space-y-3"
          >
            {/* Top row: Title + Priority & Status Badges */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white font-display">
                    {task.title}
                  </h4>
                  {/* Priority Badge */}
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getPriorityBadgeStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority || "Medium"}
                  </span>
                </div>
                {task.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Status Badge / Display */}
              <div className="shrink-0 flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${getStatusBadgeStyle(
                    task.status
                  )}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      task.status === "Completed"
                        ? "bg-emerald-400"
                        : task.status === "In Progress"
                        ? "bg-blue-400 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  {task.status || "Pending"}
                </span>
              </div>
            </div>

            {/* Middle row: Assigned Freelancer & Due Date */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 pt-2 border-t border-white/5">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <FiUser className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-medium text-white">{freelancerName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Due:{" "}
                    <strong className="text-gray-200">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "No deadline"}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-auto">
                {/* View task detail */}
                <button
                  type="button"
                  onClick={() => onViewTask(task._id)}
                  title="View Task Details"
                  className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition"
                >
                  <FiEye className="w-3.5 h-3.5" />
                </button>

                {/* Freelancer Status Selector Dropdown */}
                {canChangeStatus && (
                  <div className="relative inline-block">
                    <select
                      disabled={isUpdating}
                      value={task.status || "Pending"}
                      onChange={(e) => onStatusChange(task._id, e.target.value)}
                      className="glass-input rounded-xl border border-white/10 bg-[#09090B] px-2.5 py-1 text-xs font-semibold text-white outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="Pending" className="bg-[#09090B] text-gray-400">
                        Pending
                      </option>
                      <option value="In Progress" className="bg-[#09090B] text-blue-400">
                        In Progress
                      </option>
                      <option value="Completed" className="bg-[#09090B] text-emerald-400">
                        Completed
                      </option>
                    </select>
                    {isUpdating && (
                      <FiLoader className="w-3 h-3 animate-spin text-indigo-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                )}

                {/* Client / Admin Edit button */}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEditTask(task)}
                    title="Edit Task"
                    className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Client / Admin Delete button */}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task._id)}
                    title="Delete Task"
                    className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TasksList;
