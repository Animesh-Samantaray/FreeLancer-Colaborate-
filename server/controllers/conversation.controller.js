import Project from "../models/Project.model.js";
import Conversation from "../models/Conversation.model.js";



export const createConversation = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const existingConversation = await Conversation.findOne({
      project: projectId,
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists.",
        conversation: existingConversation,
      });
    }

    const conversation = await Conversation.create({
      project: project._id,
      participants: [project.client, ...project.freelancers],
    });

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      conversation,
    });
  } catch (error) {
    console.error("Create Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getProjectConversation = async (req, res) => {
  try {
    const { projectId } = req.params;

    const conversation = await Conversation.findOne({
      project: projectId,
    })
      .populate("participants", "fullName email avatar role")
      .populate("project", "title");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Get Conversation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("project", "title status")
      .populate("participants", "fullName avatar role")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Get My Conversations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};