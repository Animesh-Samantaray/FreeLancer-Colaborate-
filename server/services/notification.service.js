
import { getIO } from "../configs/socket.js";

export const createAndSendNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
}) => {
  try {
    if (!recipient) {
      console.warn("Notification skipped: recipient is required.");
      return null;
    }

    // Never notify the person who triggered the action
    if (
      sender &&
      sender.toString() === recipient.toString()
    ) {
      return null;
    }

    const io = getIO();

    const roomName = `user:${recipient.toString()}`;

    const notification = {
      type,
      title,
      message,
      createdAt: new Date(),
    };

    // Send real-time notification to that user's browser
    io.to(roomName).emit(
      "notification",
      notification
    );

    console.log(
      `📡 Notification sent to ${roomName}: ${title}`
    );

    return notification;

  } catch (error) {
    console.error(
      "❌ Notification Error:",
      error
    );

    return null;
  }
};

