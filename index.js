// Initial player and board objects
let playerOne = {id: 'p1', deployedAllShips: false};
let playerTwo = {id: 'p2', deployedAllShips: false};

playerOne.nextPlayer = playerTwo;
playerTwo.nextPlayer = playerOne;

const playerOneBoard = document.querySelector('#playerOneBoard');
const playerTwoBoard = document.querySelector('#playerTwoBoard');
const columns = Array.from(document.querySelectorAll('.letters'));
const rows = Array.from(document.querySelectorAll('.numbers'));
const log = document.getElementById('log');

// Info for the board
const dimensions = 10; // Row & Columns
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J'];
const gridSize = 400; // 400 x 400 px

// Info for ships
const battleShipLengths = [5, 4, 3, 3, 2];
const battleShipId = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];

// Ship deployment and game start flags
let currentBoard = Math.round(Math.random()) === 0 ? playerTwo : playerOne;
let gameStarted = false; // Game started flag
let gameEnd = false;
let shipId = battleShipId[0]; // Initial ship
let direction = true; // Current direction of a ship (vertical: true or horizontal: false)

// Game play
let crossHair = {
  components: [`${Math.floor(dimensions / 2)}${Math.floor(dimensions / 2)}`]
};
let computer = false;

// Returns new coordinates depending on key code
const newPos = {
  87: (x, y) => `${x}${Number(y) - 1}`,
  65: (x, y) => `${Number(x) - 1}${y}`,
  83: (x, y) => `${x}${Number(y) + 1}`,
  68: (x, y) => `${Number(x) + 1}${y}`,
  73: (x, y) => `${x}${Number(y) - 1}`,
  74: (x, y) => `${Number(x) - 1}${y}`,
  75: (x, y) => `${x}${Number(y) + 1}`,
  76: (x, y) => `${Number(x) + 1}${y}`,
  vertical: (length) => `${Math.floor(Math.random() * (dimensions - 1))}${Math.floor(Math.random() * (dimensions - length))}`,
  horizontal: (length) => `${Math.floor(Math.random() * (dimensions - length))}${Math.floor(Math.random() * (dimensions - 1))}`,
};

const validKeyCodes = {
  // Valid key codes to play with
  // w: 87  i: 73  up
  // a: 65  j: 74  left
  // s: 83  k: 75  down
  // d: 68  l: 76  right
  // f: 70  r: 82 reset
  // enter: 13
  87: true,
  65: true,
  83: true,
  68: true,
  13: true,
  70: true,
};

// Size of board
// const createLettersArray use fromCharCode 65 - 91
// Create the Grid, Tiles, and adding the tile objects for referencing to the player object
const createGrid = (board, currentB) => {
  // Create the dimensions and border of a board
  board.style.cssText = `
    display: grid;
    height: ${gridSize}px;
    width: ${gridSize}px;
    border: 1px solid black;
    grid-template-columns: repeat(10, 1fr);
    grid-gap: 0`;
  // Creating the board property for player object
  const boardObject = {};

  // Creating the tile and referencing
  for (let i = 0; i < 100; i++) {
    
    let columnIndex = i % 10;
    let rowIndex = Math.floor(i / 10);
    let id = `${letters[columnIndex]}${rowIndex + 1}`;
    
    const gridItem = document.createElement('div');
    gridItem.style.cssText = `border: 1px solid black`;
    gridItem.id = id;
    gridItem.className = `${currentB.id}tile`;

    board.appendChild(gridItem);
    
    // Referencing
    boardObject[`${columnIndex}${rowIndex}`] = {
      'tile': gridItem,
      'id': `${letters[columnIndex]}${rowIndex + 1}`,
      'occupiedBy': false,
      'componentIndex': false,
      'shotAt': false
    };
  }

  currentB.board = boardObject;

};
const coordinateContext = (columns, rows, letters) => {

  columns.forEach(column => {
    
    column.style.cssText = `
      display: grid;
      height: ${Math.sqrt(gridSize)}px;
      width: ${gridSize}px;
      grid-template-columns: repeat(10, 1fr);
      border: 1px solid black`;

    for (let i = 0; i < letters.length; i ++) {
      const letter = document.createElement('div');
      letter.textContent = `${letters[i]}`;
      letter.style.cssText = `
        text-align: center;
        line-height: 100%;
        vertical-align: middle`;
      column.appendChild(letter);
    }

  });
  
  rows.forEach(row => {

    row.style.cssText = `
      display: grid;
      height: ${gridSize}px;
      width: ${Math.sqrt(gridSize)}px;
      grid-template-rows: repeat(10, 1fr);
      border: 1px solid black`;
    
    for (let i = 0; i < letters.length; i ++) {
      const number = document.createElement('div');
      number.textContent = `${i + 1}`;
      number.style.cssText = `
        margin-top: auto;
        margin-bottom: auto;
        text-align: center;`;
      row.appendChild(number);
    }
  });
};
// Make the ships
const battleShipFactory = (currentB) => {
  
  const battleShipArray = battleShipLengths.reduce((ships, length, i) => {
    let battleShipObj = {
      id: battleShipId[i],
      length: length,
      status: 'inactive',
      components: []};
    
    // Make the starting location of the ship at the top left of the board
    for (let i = 0; i < length; i ++) {
      battleShipObj.components.push(`0${i}`);
    }
    ships.push(battleShipObj);
    return ships;
  }, []);

  const battleShips = battleShipArray.reduce((names, ship, i) => {
    names[battleShipId[i]] = ship;
    return names;
  }, {});

  currentB.shipsLeft = battleShipId.length;
  currentB.ships = battleShips;
};
// Deployment phase
const moveShip = (currentB, shipId, keyCode) => {
  // Let deployShip function decide which ship is going to be moving
  let ship = currentB.ships[shipId];
  let comp = ship.components;
  
  if (keyCode !== 13 && keyCode !== 70) {
    //If the ship is at the boundaries
    if (!checkIfMoveable(ship, keyCode)) {
      return;
    }

    // Vertical fix and Horizontal fix 83 s 68 d
    if ((keyCode === 83 && direction) || (keyCode === 68)) {
      currentB.ships[shipId].components = comp
        .reverse()
        .map(c => changeTile(c, keyCode, currentB))
        .reverse();
    } else {
      currentB.ships[shipId].components = comp
        .map(c => changeTile(c, keyCode, currentB));
    }
  } else if (keyCode === 13) {
    // Deploys and maps a battleship
    deployShip(currentB, shipId, comp);
  } else if (keyCode === 70) {
    changeDirection(currentB, shipId, comp);
  } else {
    return;
  }
};
// Changes the color of the tile based on the occupancy
const changeTile = (c, keyCode, currentB) => {

  const next = newPos[keyCode](c[0], c[1]);
  const curr = c;
  
  if (!gameStarted) {
    if (currentB.board[curr].occupiedBy) {
      currentB.board[curr].tile.style[`background-color`] = `brown`;
    } else {
      currentB.board[curr].tile.style[`background-color`] = `white`;
    }
    currentB.board[next].tile.style[`background-color`] = `black`;
    return next;
  }

  const isItDamaged = currentB.board[curr].componentIndex;
  
  if (!currentB.board[curr].occupiedBy || isItDamaged !== true) {
    currentB.board[curr].tile.style[`background-color`] = currentB.board[curr].shotAt ? `blue` : `gray`;
  } else {
    currentB.board[curr].tile.style[`background-color`] = isItDamaged === true ? `brown` : `gray`;
  }
  currentB.board[next].tile.style[`background-color`] = `red`;
  return next;
};
const deployShip = (currentB, shipId, comp) => {

  if (checkIfDeployable(currentB, shipId)) {
    currentB.ships[shipId].status = 'deployed';
    currentB.ships[shipId].components = comp
      .map((c, i) => {
        currentB.board[c].occupiedBy = shipId;
        currentB.board[c].componentIndex = i;
        currentB.board[c].tile.style[`background-color`] = `brown`;
        return c;
      });
    // Always start vertically
    direction = true;
    deployingShips(currentB);
  } else {
    return false;
  }
};
const changeDirection = (currentB, shipId, comp) => {

  direction = !direction;
  currentB.ships[shipId].components = comp
    .map(c => {
      // This inverts the original coordinates. This also eliminates
      // a potential boundary issue, but makes game quality worse?
      const next = `${c[1]}${c[0]}`;
      const curr = `${c[0]}${c[1]}`;
      if (currentB.board[curr].occupiedBy) {
        currentB.board[curr].tile.style[`background-color`] = `brown`;
      } else {
        currentB.board[curr].tile.style[`background-color`] = `white`;
      }
      currentB.board[next].tile.style[`background-color`] = `black`;
      return next;
    });
};
// Checks if block can be moved
const checkIfMoveable = (ship, keyCode) => {
  
  const c = ship.components; // components
  const head = [c[0][0], c[0][1]]; // x, y
  const tail = `${c[c.length - 1][0]}${c[c.length - 1][1]}`;

  if (keyCode === 87) {
    // y of head cannot be 0, same case for 9 and all directions
    return head[1] !== '0';
  } else if (keyCode === 65) {
    return head[0] !== '0';
  } else if (keyCode === 83) {
    return tail[1] !== '9';
  } else if (keyCode === 68) {
    return tail[0] !== '9';
  }
};
const checkIfDeployable = (currentB, shipId) => {
  // If there is a true in any tile the current ship is currently hovering then you cannot deploy
  const checkIfAvailable = currentB.ships[shipId].components.map(c => currentB.board[c].occupiedBy ? false : true);
  
  return checkIfAvailable.length < currentB.ships[shipId].components.length ? false : !checkIfAvailable.includes(false);
};

const deployingShips = (currentB) => {

  const battleShipKeys = Object.keys(currentB.ships);
  
  for (let i = 0; i < battleShipKeys.length; i ++) {
    
    if (currentB.ships[battleShipKeys[i]].status === 'inactive') {
      currentB.ships[battleShipKeys[i]].components.forEach(c => {
        currentB.board[c].tile.style[`background-color`] = `black`;
      });
      shipId = currentB.ships[battleShipKeys[i]].id;
      break;
    }

    if (i === battleShipKeys.length - 1) {
      currentB.deployedAllShips = true;
      readyTheField(currentB);
      if (playerOne.deployedAllShips && playerTwo.deployedAllShips) {
        console.log(playerOne.deployedAllShips, playerOne.deployedAllShips, playerOne.deployedAllShips && playerTwo.deployedAllShips);
        gameStarted = true;
        computer ? computerPlay(currentBoard) : playGame(currentBoard);
      } else {
        currentBoard = currentB.nextPlayer;
        shipId = battleShipId[0];
        computer ? computerDeployShips(currentBoard) : deployingShips(currentBoard);
      }
    }
  }
};

const readyTheField = (currentB) => {
  Object.keys(currentB.board).forEach(key => {
    currentB.board[key].tile.style[`background-color`] = `gray`;
  });
};

// Playing phase
const playGame = (currentB) => {
  currentB.board[crossHair.components[0]].tile.style[`background-color`] = `red`;
};

const moveCrossHair = (currentB, keyCode) => {
  if (keyCode !== 13 && keyCode !== 70) {
    //If the crosshair is at the boundaries
    if (!checkIfMoveable(crossHair, keyCode)) {
      return;
    }
    crossHair.components[0] = changeTile(crossHair.components[0], keyCode, currentB);
  } else if (keyCode === 13 && !currentB.board[crossHair.components[0]].shotAt) {
    currentB.board[crossHair.components[0]].shotAt = true;
    if (currentB.board[crossHair.components[0]].occupiedBy) {

      const shipId = currentB.board[crossHair.components[0]].occupiedBy;
      
      currentB.board[crossHair.components[0]].componentIndex = true;
      currentB.ships[shipId].status = `damaged`;
    
      if (currentB.ships[shipId].length > 0) {
        checkIfAllShipsSunk(currentB, currentB.ships);
      }

      logger(`${currentB.nextPlayer.id} hits on: ${currentB.board[crossHair.components[0]].id}`);
      currentB.board[crossHair.components[0]].tile.style[`background-color`] = `brown`;
      currentBoard = currentB.nextPlayer;
      !computer ? playGame(currentBoard) : computerPlay(currentBoard);
    } else {
      currentB.board[crossHair.components[0]].tile.style[`background-color`] = `blue`;
      logger(`${currentB.nextPlayer.id} misses on: ${currentB.board[crossHair.components[0]].id}`);
      currentBoard = currentB.nextPlayer;
      !computer ? playGame(currentBoard) : computerPlay(currentBoard);
    }
  }
};

// Checks Endgame condition
const checkIfAllShipsSunk = (currentB, ships) => {
  currentB.ships[shipId].length -= 1;
  const shipsSunk = Object.keys(ships).filter(key => ships[key].length === 0);
  logger(`Sunken ships of: ${currentBoard.id} ${shipsSunk}`);
  if (shipsSunk.length === 5) {
    gameEnd = true;
    logger(`${currentB.nextPlayer.id} WON!`);
    return;
  }
};

const computerPlay = (currentB) => {

  let computerPlaying = true;
  
  while (computerPlaying) {

    const hitLocation = `${Math.round(Math.random() * 9)}${Math.round(Math.random() * 9)}`;
    const boardLocation = currentB.board[hitLocation];
    
    if (!boardLocation.shotAt) {
      if (boardLocation.occupiedBy) {
        boardLocation.tile.style[`background-color`] = `brown`;
        currentB.ships[boardLocation.occupiedBy].status = `damaged`;
        currentB.ships[boardLocation.occupiedBy].length -= 1;
        logger(`Computer hits on ${hitLocation}`);
        checkIfAllShipsSunk(currentB, currentB.ships);
      } else {
        logger(`Computer misses on ${hitLocation}`);
        currentB.board[hitLocation].tile.style[`background-color`] = `blue`;
      }
      currentB.board[hitLocation].shotAt = true;
      computerPlaying = false;
    }
  }
  currentBoard = currentB.nextPlayer;
  playGame(currentBoard);
};

const computerDeployShips = (currentB) => {

  for (let i = 0; i < 5; i ++) {

    let shipId = battleShipId[i];
    let direction = Math.round(Math.random()) === 0 ? true : false;
    let shipLength = currentB.ships[battleShipId[i]].length;
    let startingLocation = direction ? newPos.vertical(shipLength) : newPos.horizontal(shipLength);

    const randomPosition = currentB.ships[shipId].components.map((c, i) => {
      const x = direction ? `${startingLocation[0]}` : `${Number(startingLocation[0]) + i}`;
      const y = direction ? `${Number(startingLocation[1]) + i}` : `${startingLocation[1]}`;
      const coordinates = `${x}${y}`;
      return coordinates;
    });

    if (checkIfAIDeployable(currentB, randomPosition)) {
      currentB.ships[shipId].components = randomPosition;
      randomPosition.forEach(p => {
        currentB.board[p].tile.style[`background-color`] = `brown`;
        currentB.board[p].occupiedBy = shipId;
        currentB.board[p].componentIndex = i;
      });
    } else {
      // Try again if random spot is invalid
      i --;
    }
  }
  
  // readyTheField(currentB);
  currentB.deployedAllShips = true;
  
  if (!currentB.nextPlayer.deployedAllShips) {
    currentBoard = currentBoard.nextPlayer;
    deployingShips(currentBoard);
  } else {
    gameStarted = true;
    playGame(currentBoard);
  }
};

const checkIfAIDeployable = (currentB, positions) => {
  // If there is a true in any tile the current ship is currently hovering then you cannot deploy
  return !positions.map(p => currentB.board[p].occupiedBy ? false : true).includes(false);
};

const logger = (text) => {
  const newLog = document.createElement('p');
  newLog.textContent = `- ${text}`;
  log.appendChild(newLog);
  log.scrollTop = log.scrollHeight; // Scroll to the bottom of the div
};

const resetParent = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

// Resetting the game
const resetGame = () => {

  // Initial flags and values
  playerOne.deployedAllShips = false;
  playerTwo.deployedAllShips = false;

  gameStarted = false;
  gameEnd = false;
  shipId = battleShipId[0];
  direction = true;

  // Removes all original DOM elements and then creates new
  resetParent(log);
  resetParent(playerOneBoard);
  resetParent(playerTwoBoard);
  createGrid(playerOneBoard, playerOne);
  createGrid(playerTwoBoard, playerTwo);
  battleShipFactory(playerOne);
  battleShipFactory(playerTwo);
  
  currentBoard = Math.round(Math.random()) === 0 ? playerOne : playerTwo;
  logger(`${currentBoard.id} is first | Computer is playing: ${computer}`);
  computer ? currentBoard.id === 'p1' ? deployingShips(currentBoard) : computerDeployShips(currentBoard) : deployingShips(currentBoard);
};

coordinateContext(columns, rows, letters);
resetGame();

document.addEventListener('keydown', (e) => {
  if (validKeyCodes[e.keyCode] && !gameStarted && !gameEnd) {
    moveShip(currentBoard, shipId, e.keyCode);
  } else if (validKeyCodes[e.keyCode] && gameStarted && !gameEnd) {
    moveCrossHair(currentBoard, e.keyCode);
  } else if (e.keyCode === 82) {
    resetGame();
  } else if (e.keyCode === 67) {
    computer = !computer;
    resetGame();
  }
});