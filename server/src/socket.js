const socketIO = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIO(server);
};

const emitSocket = (event, ...parameters) => {
  try {
    io.emit(event, ...parameters);
  } catch (error) {
    console.log(error);
  }
};

addSocketHandler = (event, callback) => {
  io.on("connection", (socket) => {
    socket.on(event, callback);
  });
};

module.exports = { addSocketHandler, initializeSocket, emitSocket };
