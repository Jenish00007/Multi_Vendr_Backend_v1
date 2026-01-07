const { Server } = require("socket.io");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join user-specific room for targeted notifications
    socket.on("joinUserRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  // Make io available throughout the app
  return io;
}

module.exports = initializeSocket;

let ioInstance = null

function setIO(io) {
  ioInstance = io
}

function getIO() {
  return ioInstance
}

module.exports = { setIO, getIO }
