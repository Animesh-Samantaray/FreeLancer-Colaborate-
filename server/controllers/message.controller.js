import Message from "../models/Message.model.js";
import Conversation from "../models/Conversation.model.js";
import { getIO } from "../configs/socket.js";
import { uploadToCloudinary ,deleteFromCloudinary} from "../utils/cloudinaryUpload.js";
import { createAndSendNotification } from "../services/notification.service.js";


export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const file = req.file;

    // Must contain either text or a file
    if (!message?.trim() && !file) {
      return res.status(400).json({
        success: false,
        message: "Message or file is required.",
      });
    }

    // Find conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    // Check participant
    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    // Upload file if provided
    let attachment = null;

    if (file) {
      const uploadedFile = await uploadToCloudinary(file);

      attachment = {
        url: uploadedFile.secure_url,
        publicId: uploadedFile.public_id,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    }

    // Create message
    const newMessage = await Message.create({
      conversation: conversationId,
      sender: userId,
      message: message?.trim() || "",
      attachment,
      readBy: [userId],
    });

    // Populate sender
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullName avatar role");

    // Real-time message
    const io = getIO();

    io.to(conversationId).emit(
      "newMessage",
      populatedMessage
    );

    // Send MESSAGE_RECEIVED or FILE_RECEIVED notification to other participants
    const isFile = !!populatedMessage.attachment;
    const type = isFile ? "FILE_RECEIVED" : "MESSAGE_RECEIVED";
    const title = isFile ? "New File Received" : "New Message";
    const notificationMessage = isFile
      ? `${populatedMessage.sender.fullName} sent you a file: ${populatedMessage.attachment.originalName}`
      : `${populatedMessage.sender.fullName}: ${populatedMessage.message}`;

    if (conversation.participants && conversation.participants.length > 0) {
      for (const participantId of conversation.participants) {
        if (participantId.toString() !== userId.toString()) {
          await createAndSendNotification({
            recipient: participantId,
            sender: userId,
            type,
            title,
            message: notificationMessage,
            projectId: conversation.project,
            conversationId: conversation._id,
          });
        }
      }
    }

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

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId.toString()
    );

    if (!isParticipant) {
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

    const conversation = await Conversation.findById(
      message.conversation
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === userId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
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
    if (message.attachment?.publicId) {
  await deleteFromCloudinary(
    message.attachment.publicId,
    message.attachment.resourceType || "image"
  );
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

