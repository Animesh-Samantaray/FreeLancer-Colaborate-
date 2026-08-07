import Milestone from "../models/Milestone.model.js";
import Project from "../models/Project.model.js";
import Proposal from "../models/Proposal.model.js";
import Invitation from "../models/Invitation.model.js";

export const createMilestone = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const {
      project: projectId,
      title,
      description,
      amount,
      dueDate,
    } = req.body;

    if (!projectId || !title || !amount || !dueDate) {
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

    if (
      project.client.toString() !== userId &&
      role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const milestone = await Milestone.create({
      project: projectId,
      client: project.client,
      freelancer: project.freelancers?.[0] || null,
      title: title.trim(),
      description,
      amount,
      dueDate,
    });

    project.milestones.push(milestone._id);
    await project.save();

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully.",
      milestone,
    });

  } catch (error) {
    console.error("Create Milestone Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Project owner, assigned/hired freelancer, public project viewers, or admin can view milestones
    const isClient = project.client.toString() === userId;
    const isFreelancer = project.freelancers.some(
      (id) => id.toString() === userId
    );

    let isHiredFreelancer = false;
    if (role === "freelancer" && !isFreelancer) {
      const acceptedProposal = await Proposal.findOne({
        project: projectId,
        freelancer: userId,
        status: "Accepted",
      });
      const acceptedInvitation = await Invitation.findOne({
        project: projectId,
        freelancer: userId,
        status: "Accepted",
      });
      if (acceptedProposal || acceptedInvitation) {
        isHiredFreelancer = true;
      }
    }

    const isPublicProject = project.visibility !== "Private";

    if (!isClient && !isFreelancer && !isHiredFreelancer && !isPublicProject && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const milestones = await Milestone.find({
      project: projectId,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: milestones.length,
      milestones,
    });

  } catch (error) {
    console.error("Get Project Milestones Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getMilestoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Authorization
    const isClient = project.client.toString() === userId;
    const isFreelancer = project.freelancers.some(
      (freelancer) => freelancer.toString() === userId
    );

    if (!isClient && !isFreelancer && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    return res.status(200).json({
      success: true,
      milestone,
    });

  } catch (error) {
    console.error("Get Milestone Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};








export const updateMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Only project owner or admin can update milestone
    if (
      project.client.toString() !== userId &&
      role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const {
      title,
      description,
      amount,
      dueDate,
      status,
    } = req.body;

    if (title) milestone.title = title.trim();
    if (description) milestone.description = description.trim();
    if (amount) milestone.amount = amount;
    if (dueDate) milestone.dueDate = dueDate;
    if (status) milestone.status = status;

    await milestone.save();

    return res.status(200).json({
      success: true,
      message: "Milestone updated successfully.",
      milestone,
    });

  } catch (error) {
    console.error("Update Milestone Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const updateMilestoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const allowedStatuses = [
      "Pending",
      "In Progress",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milestone status.",
      });
    }

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Project owner, hired freelancer, or admin can change milestone status
    const isClient = project.client.toString() === userId;
    const isFreelancer = Array.isArray(project.freelancers) && project.freelancers.some(
      (id) => id.toString() === userId
    );

    if (!isClient && !isFreelancer && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    milestone.status = status;
    await milestone.save();

    return res.status(200).json({
      success: true,
      message: "Milestone status updated successfully.",
      milestone,
    });

  } catch (error) {
    console.error("Update Milestone Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const deleteMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Only project owner or admin can delete
    if (
      project.client.toString() !== userId &&
      role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await Milestone.findByIdAndDelete(id);

    // Remove milestone id from project
    project.milestones.pull(id);
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Milestone deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Milestone Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};