const socketIO = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIO(server);
};

const emitSocket = (event) => {
  try {
    io.emit(event);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { initializeSocket, emitSocket };
