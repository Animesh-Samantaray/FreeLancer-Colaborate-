import React, { useState, useEffect } from "react";
import { FiPlus, FiSave } from "react-icons/fi";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Button from "./Button";
import { createTaskApi, updateTaskApi } from "../api/apiServices";

const TaskModal = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  milestoneId,
  task = null,
  projectFreelancers = [],
}) => {
  const isEdit = Boolean(task);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [freelancer, setFreelancer] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title || "");
        setDescription(task.description || "");
        const freelancerId =
          typeof task.freelancer === "object"
            ? task.freelancer?._id
            : task.freelancer || "";
        setFreelancer(freelancerId);
        setPriority(task.priority || "Medium");
        if (task.dueDate) {
          const d = new Date(task.dueDate);
          setDueDate(d.toISOString().split("T")[0]);
        } else {
          setDueDate("");
        }
      } else {
        setTitle("");
        setDescription("");
        setPriority("Medium");
        setDueDate("");
        if (projectFreelancers.length > 0) {
          const first = projectFreelancers[0];
          setFreelancer(typeof first === "object" ? first._id || first.id : first);
        } else {
          setFreelancer("");
        }
      }
    }
  }, [isOpen, task, projectFreelancers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }

    if (!freelancer) {
      toast.error("Please select an assigned freelancer.");
      return;
    }

    if (!dueDate) {
      toast.error("Please select a valid due date.");
      return;
    }

    try {
      setSubmitting(true);
      if (isEdit) {
        const res = await updateTaskApi(task._id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate,
          freelancer,
        });
        toast.success(res.message || "Task updated successfully!");
      } else {
        const res = await createTaskApi({
          project: projectId,
          milestone: milestoneId,
          freelancer,
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate,
        });
        toast.success(res.message || "Task created successfully!");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Task Save Error:", err);
      const msg = err?.response?.data?.message || "Failed to save task.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Task Details" : "Create New Task"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
            Task Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement Responsive Login Layout"
            className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500 transition"
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
            placeholder="Specify technical acceptance criteria, mockups, or sub-deliverables..."
            className="glass-input w-full rounded-2xl border border-white/10 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Assigned Freelancer <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={freelancer}
              onChange={(e) => setFreelancer(e.target.value)}
              className="glass-input w-full rounded-2xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="" disabled className="text-gray-500">
                Select Freelancer...
              </option>
              {projectFreelancers.map((item) => {
                const id = typeof item === "object" ? item._id || item.id : item;
                const name =
                  typeof item === "object"
                    ? item.fullName || item.email || id
                    : item;
                return (
                  <option key={id} value={id} className="bg-[#09090B] text-white">
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
              Priority <span className="text-red-400">*</span>
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="glass-input w-full rounded-2xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="Low" className="bg-[#09090B] text-emerald-400">
                Low Priority
              </option>
              <option value="Medium" className="bg-[#09090B] text-amber-400">
                Medium Priority
              </option>
              <option value="High" className="bg-[#09090B] text-red-400">
                High Priority
              </option>
            </select>
          </div>
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
            className="glass-input w-full rounded-2xl border border-white/10 bg-[#09090B] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            icon={isEdit ? <FiSave /> : <FiPlus />}
          >
            {isEdit ? "Save Task Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
