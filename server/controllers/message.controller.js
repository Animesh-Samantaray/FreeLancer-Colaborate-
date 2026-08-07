import Message from "../models/Message.model.js";
import Conversation from "../models/Conversation.model.js";
import { getIO } from "../configs/socket.js";
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const newMessage = await Message.create({
      conversation: conversationId,
      sender: userId,
      message,
      readBy: [userId],
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullName avatar role");

    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    const io = getIO();
    io.to(conversationId).emit("newMessage", populatedMessage);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: populatedMessage,
    });

  } catch (error) {
    console.error("Send Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "fullName avatar role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });

  } catch (error) {
    console.error("Get Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();

      const io = getIO();

io.to(message.conversation.toString()).emit("messageRead", {
  messageId: message._id,
  userId,
});
    }


    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: message,
    });

  } catch (error) {
    console.error("Mark Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found.",
      });
    }

    if (
      message.sender.toString() !== userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    await Message.findByIdAndDelete(messageId);

    const io = getIO();

io.to(message.conversation.toString()).emit("messageDeleted", {
  messageId: message._id,
});

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });

  } catch (error) {
    console.error("Delete Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

