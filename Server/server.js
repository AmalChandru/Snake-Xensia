//importing requied instances
const io = require("socket.io")();
const {
  gameIntialisation,
  gameContinuation,
  newVelocity,
} = require("./gameLogic");
const { frameRate } = require("./fixedValue");
const { makeid } = require("./utilities");

const state = {};
const clientRooms = {};

io.on("connection", (client) => {
  client.on("keydown", keyDownHandler);
  client.on("newGame", newGameHandler);
  client.on("joinGame", joinGameHandler);

  /**
   * Handle joining event
   * @HandlerFunction
   * @param {*} roomName
   */
  function joinGameHandler(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit("init", 2);

    startGameInterval(roomName);
  }

  /**
   * Handle New Game
   */
  function newGameHandler() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    state[roomName] = gameIntialisation();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  }

  /**
   * Handle keydown events
   * @param {*} keyCode
   */
  function keyDownHandler(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = newVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameContinuation(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / frameRate);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  // Send this event to everyone in the room.
  io.sockets.in(room).emit("gameOver", JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
