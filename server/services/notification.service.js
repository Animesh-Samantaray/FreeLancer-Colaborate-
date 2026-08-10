import { getIO } from "../configs/socket.js";

/**
 
 * @param {Object} options
 * @param {String} options.recipient - ID of the user receiving the notification
 * @param {String} [options.sender] - ID of the user who triggered the notification
 * @param {String} options.type - Notification type enum
 * @param {String} options.title - Notification title
 * @param {String} options.message - Notification descriptive message
 * @param {String} [options.projectId] - Associated project ID (optional)
 * @param {String} [options.conversationId] - Associated conversation ID (optional)
 * @param {String} [options.milestoneId] - Associated milestone ID (optional)
 * @param {String} [options.taskId] - Associated task ID (optional)
 */

export const createAndSendNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  projectId = null,
  conversationId = null,
  milestoneId = null,
  taskId = null,
}) => {
  try {
    if (!recipient) {
      console.warn("Notification skipped: recipient is required.");
      return null;
    }

   
    if (sender && recipient.toString() === sender.toString()) {
      console.log(`📡 Notification skipped: Sender (${sender}) and recipient (${recipient}) are the same.`);
      return null;
    }

    try {
      const io = getIO();
      const roomName = `user:${recipient.toString()}`;
      
     
      const notificationPayload = {
        _id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        recipient,
        sender,
        type,
        title,
        message,
        projectId,
        conversationId,
        milestoneId,
        taskId,
        createdAt: new Date(),
      };

      io.to(roomName).emit("notification", notificationPayload);
      console.log(`📡 Real-time Socket.IO notification sent to ${roomName}: ${type} ("${title}")`);
    } catch (socketErr) {
      console.warn("Socket.IO not initialized or room not found:", socketErr.message);
    }

    return null;
  } catch (error) {
    console.error("Error in createAndSendNotification:", error);
    return null;
  }
};
