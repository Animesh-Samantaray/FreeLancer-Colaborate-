let ioInstance;

export const initializeSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {

    console.log("User Connected:", socket.id);

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`${socket.id} joined ${conversationId}`);
    });

    socket.on("joinUserRoom", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`${socket.id} joined notification room: user:${userId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`${socket.id} left ${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });

  });
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io is not initialized.");
  }
  return ioInstance;
};