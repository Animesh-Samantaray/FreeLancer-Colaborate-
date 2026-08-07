import { io } from "socket.io-client";

let socket = null;
let currentConversationId = null;

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
};

export const initSocket = () => {
  if (!socket) {
    const SOCKET_URL = getSocketUrl();
    socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("⚡ Socket connected:", socket.id);
      if (currentConversationId) {
        socket.emit("joinConversation", currentConversationId);
        console.log(`⚡ Re-joined conversation room: ${currentConversationId}`);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentConversationId = null;
};

export const joinConversationRoom = (conversationId) => {
  if (!conversationId) return;
  currentConversationId = conversationId;
  const s = getSocket();
  if (s && s.connected) {
    s.emit("joinConversation", conversationId);
  }
};

export const leaveConversationRoom = (conversationId) => {
  if (!conversationId) return;
  if (currentConversationId === conversationId) {
    currentConversationId = null;
  }
  if (socket && socket.connected) {
    socket.emit("leaveConversation", conversationId);
  }
};

export const subscribeToNewMessage = (callback) => {
  const s = getSocket();
  s.on("newMessage", callback);
  return () => {
    s.off("newMessage", callback);
  };
};

export const subscribeToMessageDeleted = (callback) => {
  const s = getSocket();
  s.on("messageDeleted", callback);
  return () => {
    s.off("messageDeleted", callback);
  };
};

export const subscribeToMessageRead = (callback) => {
  const s = getSocket();
  s.on("messageRead", callback);
  return () => {
    s.off("messageRead", callback);
  };
};
