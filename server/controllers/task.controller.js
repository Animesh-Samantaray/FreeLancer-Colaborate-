import Task from "../models/Task.model.js";
import FreelancerProfileModel from "../models/FreelancerProfile.model.js";
import ClientProfileModel from "../models/ClientProfile.model.js";
import Project from "../models/Project.model.js";
import Milestone from "../models/Milestone.model.js";
import User from "../models/User.model.js";


// Helper to automatically update milestone status based on task progression
const syncMilestoneStatus = async (milestoneId) => {
  if (!milestoneId) return;
  try {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) return;

    const tasks = await Task.find({
      _id: { $in: milestone.tasks },
    });

    let newStatus = "Pending";
    if (tasks.length > 0) {
      const allCompleted = tasks.every((t) => t.status === "Completed");
      const anyInProgress = tasks.some(
        (t) => t.status === "In Progress" || t.status === "Completed"
      );

      if (allCompleted) {
        newStatus = "Completed";
      } else if (anyInProgress) {
        newStatus = "In Progress";
      } else {
        newStatus = "Pending";
      }
    }

    if (milestone.status !== newStatus) {
      milestone.status = newStatus;
      await milestone.save();
    }
  } catch (err) {
    console.error("Sync Milestone Status Error:", err);
  }
};

export const createTask = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "freelancer") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const {
      project: projectId,
      milestone: milestoneId,
      freelancer,
      title,
      description,
      priority,
      dueDate,
    } = req.body;

    if (
      !projectId ||
      !milestoneId ||
      !freelancer ||
      !title ||
      !dueDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const milestone = await Milestone.findById(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    // Check freelancer belongs to project
    if (!project.freelancers.includes(freelancer)) {
      return res.status(400).json({
        success: false,
        message: "Freelancer is not assigned to this project.",
      });
    }

    const task = await Task.create({
      project: projectId,
      milestone: milestoneId,
      client: project.client,
      freelancer,
      title: title.trim(),
      description,
      priority,
      dueDate,
    });

    milestone.tasks.push(task._id);
    await milestone.save();

    await syncMilestoneStatus(milestoneId);

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




export const getMilestoneTasks = async (req, res) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await Milestone.findById(milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    const tasks = await Task.find({
      _id: { $in: milestone.tasks },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error("Get Milestone Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id || req.params.taskId;

    const task = await Task.findById(taskId)
      .populate("project", "title")
      .populate("milestone", "title")
      .populate("client", "fullName email avatar")
      .populate("freelancer", "fullName email avatar");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });

  } catch (error) {
    console.error("Get Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const {
      title,
      description,
      priority,
      dueDate,
      freelancer,
    } = req.body;

    if (title) task.title = title.trim();
    if (description) task.description = description.trim();
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (freelancer) task.freelancer = freelancer;

    await task.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task,
    });

  } catch (error) {
    console.error("Update Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    task.status = status;
    await task.save();

    await syncMilestoneStatus(task.milestone);

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully.",
      task,
    });

  } catch (error) {
    console.error("Update Task Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const milestoneId = task.milestone;

    await Milestone.findByIdAndUpdate(
      milestoneId,
      {
        $pull: {
          tasks: task._id,
        },
      }
    );

    await Task.findByIdAndDelete(id);

    await syncMilestoneStatus(milestoneId);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};