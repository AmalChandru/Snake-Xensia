//importing gridsize from constants.js
const { gridSize } = require("./fixedValue");

//exporting written functions
module.exports = {
  gameContinuation,
  newVelocity,
  gameIntialisation,
};

/**
 * Game Intialisation
 * @returns {state} - new game state with food placed at a random place
 */
function gameIntialisation() {
  const state = createGameState();
  foodCreation(state);
  return state;
}

/**
 * Creating game state
 */
function createGameState() {
  return {
    player: {
      pos: {
        x: 3,
        y: 10,
      },
      vel: {
        x: 1,
        y: 0,
      },
      snake: [
        { x: 1, y: 10 },
        { x: 2, y: 10 },
        { x: 3, y: 10 },
      ],
    },
    food: {
      x: 7,
      y: 7,
    },
    gridsize: gridSize,
  };
}

/**
 * Function for game continuation
 * @param {*} state game state as an input
 */
function gameContinuation(state) {
  if (!state) {
    return;
  }

  const firstPlayer = state.player[0];
  const secondPlayer = state.players[1];

  firstPlayer.pos.x += firstPlayer.vel.x;
  firstPlayer.pos.y += firstPlayer.vel.y;

  secondPlayer.pos.x += secondPlayer.vel.x;
  secondPlayer.pos.y += secondPlayer.vel.y;

  //winner deciding conditionala
  if (
    firstPlayer.pos.x < 0 ||
    firstPlayer.pos.x > gridSize ||
    firstPlayer.pos.y < 0 ||
    firstPlayer.pos.y > gridSize
  ) {
    return 2;
  }

  if (
    secondPlayer.pos.x < 0 ||
    secondPlayer.pos.x > gridSize ||
    secondPlayer.pos.y < 0 ||
    secondPlayer.pos.y > gridSize
  ) {
    return 1;
  }

  //whether the head of the snake of firstPlayer is in the same pixel as that of the food
  if (
    state.food.x === firstPlayer.pos.x &&
    state.food.y === firstPlayer.pos.y
  ) {
    //pushing one object to snake state
    firstPlayer.snake.push({ ...firstPlayer.pos });
    //changing the positions
    firstPlayer.pos.x += firstPlayer.vel.x;
    firstPlayer.pos.y += firstPlayer.vel.y;
    foodCreation(state);
  }

  //whether the head of the snake of secondPlayer is in the same pixel as that of the food
  if (
    state.food.x === secondPlayer.pos.x &&
    state.food.y === secondPlayer.pos.y
  ) {
    secondPlayer.snake.push({ ...secondPlayer.pos });
    secondPlayer.pos.x += secondPlayer.vel.x;
    secondPlayer.pos.y += secondPlayer.vel.y;
    foodCreation(state);
  }

  if (firstPlayer.vel.x || firstPlayer.vel.y) {
    //checking whether head of the snake of firstPlayer is in contact with its body
    for (let cell of firstPlayer.snake) {
      if (cell.x === firstPlayer.pos.x && cell.y === firstPlayer.pos.y) {
        return 2;
      }
    }

    firstPlayer.snake.push({ ...firstPlayer.pos });
    firstPlayer.snake.shift();
  }

  if (secondPlayer.vel.x || secondPlayer.vel.y) {
    //checking whether head of the snake of firstPlayer is in contact with its body
    for (let cell of secondPlayer.snake) {
      if (cell.x === secondPlayer.pos.x && cell.y === secondPlayer.pos.y) {
        return 1;
      }
    }

    secondPlayer.snake.push({ ...secondPlayer.pos });
    secondPlayer.snake.shift();
  }

  return false;
}

/**
 * Create random food
 * @param {*} state
 * @return {state} - food at a random position
 **/
function foodCreation(state) {
  food = {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };

  //check whether the food is placed on the body of existing snakes
  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return foodCreation(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return foodCreation(state);
    }
  }

  state.food = food;
}

/**
 * Updating velocity
 * @param {*} keyCode
 * @returns updated velocity
 */
function newVelocity(keyCode) {
  switch (keyCode) {
    case 37: {
      // left
      return { x: -1, y: 0 };
    }
    case 38: {
      // down
      return { x: 0, y: -1 };
    }
    case 39: {
      // right
      return { x: 1, y: 0 };
    }
    case 40: {
      // up
      return { x: 0, y: 1 };
    }
  }
}
