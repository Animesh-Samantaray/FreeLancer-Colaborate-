import Proposal from "../models/Proposal.model.js";
import Project from "../models/Project.model.js";
import FreelancerProfile from "../models/FreelancerProfile.model.js";

export const createProposal = async (req, res) => {

  try {
    const userId = req.user.id;

    const {
      project: projectId,
      coverLetter,
      bidAmount,
      estimatedDays,
    } = req.body;

    if (!projectId || !coverLetter || !bidAmount || !estimatedDays) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const freelancer = await FreelancerProfile.findOne({
      user: userId,
    });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: "Freelancer profile not found.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.visibility !== "Public") {
      return res.status(400).json({
        success: false,
        message: "Cannot apply to a private project.",
      });
    }

    if (project.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: "Project is not accepting proposals.",
      });
    }

    
    if (project.client.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own project.",
      });
    }

   
    const existingProposal = await Proposal.findOne({
      project: projectId,
      $or: [{ freelancer: userId }, { freelancer: freelancer._id }],
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted a proposal.",
      });
    }

    const proposal = await Proposal.create({
      project: projectId,
      client: project.client,
      freelancer: userId,
      coverLetter,
      bidAmount,
      estimatedDays,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Proposal submitted successfully.",
      proposal,
    });
  } catch (error) {
    console.error("Create Proposal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMyProposals = async (req, res) => {
  try {
    const userId = req.user.id;

    const freelancerProfile = await FreelancerProfile.findOne({ user: userId });

    const filter = freelancerProfile
      ? { $or: [{ freelancer: userId }, { freelancer: freelancerProfile._id }] }
      : { freelancer: userId };

    const proposals = await Proposal.find(filter)
      .populate("project")
      .populate("client", "fullName email avatar role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Get My Proposals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getProjectProposals = async (req, res) => {
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

    if (
      project.client.toString() !== userId &&
      role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    const proposals = await Proposal.find({
      project: projectId,
    })
      .populate("freelancer", "fullName email avatar")
      .populate("client", "fullName email avatar")
      .populate("project", "title budget deadline status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    console.error("Get Project Proposals Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const updateProposal = async (req, res) => {
  try {
    const proposalId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid proposal status.",
      });
    }

    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

    const project = await Project.findById(proposal.project);

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

    proposal.status = status;
    await proposal.save();

    if (status === "Accepted") {
      
      await Proposal.updateMany(
        {
          project: proposal.project,
          _id: { $ne: proposal._id },
        },
        {
          status: "Rejected",
        }
      );

     
      if (
        !project.freelancers.includes(proposal.freelancer)
      ) {
        project.freelancers.push(proposal.freelancer);
      }

      
      project.status = "Hired";

      await project.save();
    }

    return res.status(200).json({
      success: true,
      message: `Proposal ${status.toLowerCase()} successfully.`,
      proposal,
    });
  } catch (error) {
    console.error("Update Proposal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



export const deleteProposal = async (req, res) => {
  try {
    const proposalId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const proposal = await Proposal.findById(proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Proposal not found.",
      });
    }

   
    const freelancerProfile = await FreelancerProfile.findOne({ user: userId });
    const isOwner =
      proposal.freelancer.toString() === userId ||
      (freelancerProfile && proposal.freelancer.toString() === freelancerProfile._id.toString());

    if (!isOwner && role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await Proposal.findByIdAndDelete(proposalId);

    return res.status(200).json({
      success: true,
      message: "Proposal deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Proposal Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

