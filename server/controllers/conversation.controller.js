import Project from "../models/Project.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";

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

    const participants = Array.from(
      new Set([
        project.client.toString(),
        ...(project.freelancers || []).map((f) => f.toString()),
      ])
    );

    const conversation = await Conversation.create({
      project: project._id,
      participants,
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

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    let conversation = await Conversation.findOne({
      project: projectId,
    })
      .populate("participants", "fullName email avatar role")
      .populate("project", "title status");

    if (!conversation) {
      const participants = Array.from(
        new Set([
          project.client.toString(),
          ...(project.freelancers || []).map((f) => f.toString()),
        ])
      );

      const created = await Conversation.create({
        project: project._id,
        participants,
      });

      conversation = await Conversation.findById(created._id)
        .populate("participants", "fullName email avatar role")
        .populate("project", "title status");
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
    const userRole = req.user.role;

    // 1. Find all projects associated with current user
    let projectFilter = {};
    if (userRole === "client") {
      projectFilter = { client: userId };
    } else if (userRole === "freelancer") {
      projectFilter = { freelancers: userId };
    } else if (userRole === "admin") {
      projectFilter = {}; // Admin sees all project chats
    }

    const userProjects = await Project.find(projectFilter);

    // 2. Ensure each project has a Conversation & participants are in sync
    for (const project of userProjects) {
      const currentParticipantIds = Array.from(
        new Set([
          project.client.toString(),
          ...(project.freelancers || []).map((f) => f.toString()),
        ])
      );

      const existingConv = await Conversation.findOne({ project: project._id });

      if (!existingConv) {
        await Conversation.create({
          project: project._id,
          participants: currentParticipantIds,
        });
      } else {
        const existingParticipantIds = existingConv.participants.map((p) => p.toString());
        const missing = currentParticipantIds.filter((id) => !existingParticipantIds.includes(id));
        if (missing.length > 0) {
          existingConv.participants.push(...missing);
          await existingConv.save();
        }
      }
    }

    // 3. Fetch conversations for user
    let query = {};
    if (userRole !== "admin") {
      query = { participants: userId };
    }

    const rawConversations = await Conversation.find(query)
      .populate("project", "title status")
      .populate("participants", "fullName avatar role")
      .sort({ updatedAt: -1 });

    // Filter out orphaned conversations where project was deleted
    const validConversations = rawConversations.filter((c) => c.project !== null);

    // 4. Attach lastMessage preview to each conversation
    const conversationsWithLastMsg = await Promise.all(
      validConversations.map(async (conv) => {
        const lastMsg = await Message.findOne({ conversation: conv._id })
          .populate("sender", "fullName avatar role")
          .sort({ createdAt: -1 });

        const convObj = conv.toObject();
        convObj.lastMessage = lastMsg || null;
        return convObj;
      })
    );

    return res.status(200).json({
      success: true,
      count: conversationsWithLastMsg.length,
      conversations: conversationsWithLastMsg,
    });
  } catch (error) {
    console.error("Get My Conversations Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};