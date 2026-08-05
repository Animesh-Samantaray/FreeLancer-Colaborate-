import Invitation from "../models/Invitation.model.js";
import Project from "../models/Project.model.js";
import User from "../models/User.model.js";

export const createInvitation = async (req, res) => {
  try {
    const clientId = req.user.id;

    const { project, freelancer, message } = req.body;

    
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    
    if (existingProject.client.toString() !== clientId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to invite freelancers for this project.",
      });
    }

   
    if (existingProject.visibility !== "Private") {
      return res.status(400).json({
        success: false,
        message: "Invitations are allowed only for private projects.",
      });
    }

    
    const freelancerUser = await User.findById(freelancer);

    if (!freelancerUser || freelancerUser.role !== "freelancer") {
      return res.status(404).json({
        success: false,
        message: "Freelancer not found.",
      });
    }

    
    const alreadyInvited = await Invitation.findOne({
      project,
      freelancer,
    });

    if (alreadyInvited) {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been sent to this freelancer.",
      });
    }

    const invitation = await Invitation.create({
      project,
      client: clientId,
      freelancer,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully.",
      invitation,
    });
  } catch (error) {
    console.error("Create Invitation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};





export const getProjectInvitations = async (req, res) => {
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

    // Only project owner or admin can view invitations
    if (
      project.client.toString() !== userId &&
      role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const invitations = await Invitation.find({
      project: projectId,
    })
      .populate("freelancer", "fullName email avatar role")
      .populate("client", "fullName email avatar role")
      .populate("project", "title status visibility")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Get Project Invitations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteInvitation = async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

   
    if (
      invitation.client.toString() !== userId &&
      role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await Invitation.findByIdAndDelete(invitationId);

    return res.status(200).json({
      success: true,
      message: "Invitation deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Invitation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const getMyInvitations = async (req, res) => {
  try {
    const userId = req.user.id;

    const invitations = await Invitation.find({
      freelancer: userId,
    })
      .populate("project", "title budget deadline status visibility")
      .populate("client", "fullName email avatar role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Get My Invitations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const updateInvitation = async (req, res) => {
  try {
    const invitationId = req.params.id;
    const userId = req.user.id;
    const { status } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invitation status.",
      });
    }

    const invitation = await Invitation.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

    // Only invited freelancer can respond
    if (invitation.freelancer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (invitation.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Invitation has already been responded to.",
      });
    }

    invitation.status = status;
    await invitation.save();

    if (status === "Accepted") {
      const project = await Project.findById(invitation.project);

      if (project) {
        if (
          !project.freelancers.some(
            (id) => id.toString() === userId
          )
        ) {
          project.freelancers.push(userId);
        }

        project.status = "Hired";

        await project.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: `Invitation ${status.toLowerCase()} successfully.`,
      invitation,
    });
  } catch (error) {
    console.error("Update Invitation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};