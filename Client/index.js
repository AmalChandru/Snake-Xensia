//color schemes
const BG_COLOUR = "#5B8930";
const SNAKE_COLOUR = "#c2c2c2";
const FOOD_COLOUR = "#e66916";

const socket = io("https://aqueous-badlands-52077.herokuapp.com/");

//Set up callback functions for various events on the WebSocket connection
socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);

//Returns element with ID attribute
const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

/**
 * Invoke a new game
 */
function newGame() {
  socket.emit("newGame");
  init();
}

/**
 * Emit code for joining game
 */
function joinGame() {
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

/**
 * Intialisation function
 */
function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  //canvas dimensions
  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

/**
 * Emits info of key pressed
 **/
function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

/**
 * Draw game premises
 * @param {*} state - The game state
 * @returns {} - gaming interface
 */
function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, "red");
}

/**
 * Paints snake for the player
 * @param {*} playerState - state object of the player
 * @param {number} size -  canvas.width / gridsize i.e 600/20
 * @param {string} colour - color of snake
 */
function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

/**
 * Intialises player number
 * @HandlerFunction
 * @param {number} number
 */
function handleInit(number) {
  playerNumber = number;
}

/**
 * Paint game until game is active
 * @HandlerFunction
 * @param {*} gameState
 */
function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

/**
 * Handling Game Over
 * @HandlerFunction
 * @param {*} data
 * @returns {string} - Shows result of the game
 */
function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert("You Win!");
  } else {
    alert("You Lose :(");
  }
}

/**
 * Handle Game code
 * @HandlerFunction
 * @param {*} gameCode
 */
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

/**
 * Handle unknown code
 * @HandlerFunction
 * @returns {string} - show the message "Unknown Game Code"
 */
function handleUnknownCode() {
  reset();
  alert("Unknown Game Code");
}

/**
 * Handle player's more than 2
 * @HandlerFunction
 * @returns {string} - show the message "This game is already in progress"
 */
function handleTooManyPlayers() {
  reset();
  alert("This game is already in progress");
}

/**
 * Resets game
 * @returns {state} - New game premises
 */
function reset() {
  playerNumber = null;
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
