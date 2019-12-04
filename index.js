// Initial player objects
let playerOne = {id: 'p1', deployedAllShips: false};
let playerTwo = {id: 'p2', deployedAllShips: false};

playerOne.nextPlayer = playerTwo;
playerTwo.nextPlayer = playerOne;

const playerOneBoard = document.querySelector('#playerOneBoard');
const playerTwoBoard = document.querySelector('#playerTwoBoard');
const columns = Array.from(document.querySelectorAll('.letters'));
const rows = Array.from(document.querySelectorAll('.numbers'));

// Info for the board
const dimensions = 10; // Row & Columns
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J'];
const gridSize = 400; // 400 x 400 px

// Info for ships
const battleShipLengths = [5, 4, 3, 3, 2];
const battleShipId = ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'];

// Ship deployment and game start flags
let currentPlayer = Math.round(Math.random()) === 0 ? playerOne : playerTwo;
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
const createGrid = (board, player) => {
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
    gridItem.className = `${player.id}tile`;

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

  player.board = boardObject;

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
const battleShipFactory = (player) => {
  
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

  player.shipsLeft = battleShipId.length;
  player.ships = battleShips;
};
// Deployment phase
const moveShip = (player, shipId, keyCode) => {
  // Let deployShip function decide which ship is going to be moving
  let ship = player.ships[shipId];
  let comp = ship.components;
  
  if (keyCode !== 13 && keyCode !== 70) {
    //If the ship is at the boundaries
    if (!checkIfMoveable(ship, keyCode)) {
      return;
    }

    // Vertical fix and Horizontal fix 83 s 68 d
    if ((keyCode === 83 && direction) || (keyCode === 68)) {
      player.ships[shipId].components = comp
        .reverse()
        .map(c => changeTile(c, keyCode, player))
        .reverse();
    } else {
      player.ships[shipId].components = comp
        .map(c => changeTile(c, keyCode, player));
    }
  } else if (keyCode === 13) {
    // Deploys and maps a battleship
    deployShip(player, shipId, comp);
  } else if (keyCode === 70) {
    changeDirection(player, shipId, comp);
  } else {
    return;
  }
};
// Changes the color of the tile based on the occupancy
const changeTile = (c, keyCode, player) => {

  const next = newPos[keyCode](c[0], c[1]);
  const curr = c;
  
  if (!gameStarted) {
    if (player.board[curr].occupiedBy) {
      player.board[curr].tile.style[`background-color`] = `brown`;
    } else {
      player.board[curr].tile.style[`background-color`] = `white`;
    }
    player.board[next].tile.style[`background-color`] = `black`;
    return next;
  }

  const isItDamaged = player.board[curr].componentIndex;
  
  if (!player.board[curr].occupiedBy || isItDamaged !== true) {
    player.board[curr].tile.style[`background-color`] = player.board[curr].shotAt ? `blue` : `gray`;
  } else {
    player.board[curr].tile.style[`background-color`] = isItDamaged === true ? `brown` : `gray`;
  }
  player.board[next].tile.style[`background-color`] = `red`;
  return next;
};
const deployShip = (player, shipId, comp) => {

  if (checkIfDeployable(player, shipId)) {
    player.ships[shipId].status = 'deployed';
    player.ships[shipId].components = comp
      .map((c, i) => {
        player.board[c].occupiedBy = shipId;
        player.board[c].componentIndex = i;
        player.board[c].tile.style[`background-color`] = `brown`;
        return c;
      });
    // Always start vertically
    direction = true;
    deployingShips(player);
  } else {
    return false;
  }
};
const changeDirection = (player, shipId, comp) => {

  direction = !direction;
  player.ships[shipId].components = comp
    .map(c => {
      // This inverts the original coordinates. This also eliminates
      // a potential boundary issue, but makes game quality worse?
      const next = `${c[1]}${c[0]}`;
      const curr = `${c[0]}${c[1]}`;
      if (player.board[curr].occupiedBy) {
        player.board[curr].tile.style[`background-color`] = `brown`;
      } else {
        player.board[curr].tile.style[`background-color`] = `white`;
      }
      player.board[next].tile.style[`background-color`] = `black`;
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
const checkIfDeployable = (player, shipId) => {
  console.log(player, player.ships[shipId]);
  // If there is a true in any tile the current ship is currently hovering then you cannot deploy
  const checkIfAvailable = player.ships[shipId].components.map(c => {
    if (player.board[c].occupiedBy) {
      return false;
    }
    return true;
  });
  if(checkIfAvailable.length < player.ships[shipId].components.length){
    return false;
  } else {
    return !checkIfAvailable.includes(false);
  }
};

const deployingShips = (player) => {

  const battleShipKeys = Object.keys(player.ships);
  
  for (let i = 0; i < battleShipKeys.length; i ++) {
    
    if (player.ships[battleShipKeys[i]].status === 'inactive') {
      player.ships[battleShipKeys[i]].components.forEach(c => {
        player.board[c].tile.style[`background-color`] = `black`;
      });
      shipId = player.ships[battleShipKeys[i]].id;
      break;
    }

    if (i === battleShipKeys.length - 1) {
      player.deployedAllShips = true;
      readyTheField(player);
      if (playerOne.deployedAllShips && playerTwo.deployedAllShips) {
        gameStarted = true;
        playGame(currentPlayer); // play with computer
      } else {
        currentPlayer = player.nextPlayer;
        shipId = battleShipId[0];
        computer ? computerDeployShip(currentPlayer) : deployingShips(currentPlayer);
      }
    }
  }
};

const readyTheField = (player) => {
  Object.keys(player.board).forEach(key => {
    player.board[key].tile.style[`background-color`] = `gray`;
  });
};

// Playing phase
const playGame = (currentPlayer) => {
  currentPlayer.board[crossHair.components[0]].tile.style[`background-color`] = `red`;
};

const moveCrossHair = (player, keyCode) => {
  if (keyCode !== 13 && keyCode !== 70) {
    //If the crosshair is at the boundaries
    if (!checkIfMoveable(crossHair, keyCode)) {
      return;
    }
    crossHair.components[0] = changeTile(crossHair.components[0], keyCode, player);
  } else if (keyCode === 13 && !player.board[crossHair.components[0]].shotAt) {
    player.board[crossHair.components[0]].shotAt = true;
    if (player.board[crossHair.components[0]].occupiedBy) {

      const shipId = player.board[crossHair.components[0]].occupiedBy;
      
      player.board[crossHair.components[0]].componentIndex = true;
      player.ships[shipId].status = `damaged`;
    
      if (player.ships[shipId].length > 0) {
        player.ships[shipId].length -= 1;
        if (checkIfAllShipsSunk(player.ships)) {
          gameEnd = true;
          console.log(player.nextPlayer.id, 'WON!');
          return;
        }
      }

      console.log(player.nextPlayer.id, 'hits on:', player.board[crossHair.components[0]].id);
      player.board[crossHair.components[0]].tile.style[`background-color`] = `brown`;

      currentPlayer = player.nextPlayer;
    } else {
      player.board[crossHair.components[0]].tile.style[`background-color`] = `blue`;
      currentPlayer = player.nextPlayer;
      console.log(player.id, 'misses on', player.board[crossHair.components[0]].id);
    }
  }

  playGame(currentPlayer);

};

const checkIfAllShipsSunk = (ships) => {
  const shipsSunk = Object.keys(ships).filter(key => ships[key].length === 0);
  console.log('Sunken ships of:', currentPlayer.id, shipsSunk);
  return shipsSunk.length === 5;
};

const computerDeployShip = (player) => {
  // I can just make it so that playerTwo is auto first player
  // Go through each ship, select the head or components[0]
  // random a starting location, check the length or vertical starting from the start location
  // to see if there is a ship or if the spot is valid
  // map the ship and components like a player would to the tile

  // 
  /* for (let shipId in player.ships) {
    console.log(shipId, player.ships[shipId]);
  } */
  let direction = Math.floor(Math.random()) === 0 ? true : false;
  let startingLocation = undefined;
  if(direction){
    startingLocation = newPos.vertical(player.ships[shipId].length);
  } else {
    startingLocation = newPos.horizontal(player.ships[shipId].length);  
  }
  console.log(startingLocation, direction, player.ships[shipId], player.ships[shipId].length);
  /* player.ships[shipId].components = player.ships[shipId].components.map((c, i) => {
    const x = `${(startLocation[0])}`;
    const y = startLocation[1];
    return `${x}${y}`;
  });
  console.log(player.ships[shipId].components);
  console.log(checkIfDeployable(player, shipId));
   */
  // currentPlayer = player.nextPlayer;
}

// Resetting the game
const resetGame = () => {

  playerOne.deployedAllShips = false;
  playerTwo.deployedAllShips = false;

  gameStarted = false;
  gameEnd = false;
  shipId = battleShipId[0];
  direction = true;
  
  for (key in playerOne.board) {
    const p1Tile = playerOne.board[key];
    const p2Tile = playerTwo.board[key];
    p1Tile.tile.style[`background-color`] = `white`;
    playerOne.board[key].shotAt = false;
    p1Tile.componentIndex = false;
    p1Tile.occupiedBy = false;
    p2Tile.tile.style[`background-color`] = `white`;
    playerTwo.board[key].shotAt = false;
    p2Tile.componentIndex = false;
    p2Tile.occupiedBy = false;
  }

  for (key in playerOne.ships) {
    const p1Ship = playerOne.ships[key];
    const p2Ship = playerTwo.ships[key];
    p1Ship.components = p1Ship.components.map((c, i) => `0${i}`);
    p1Ship.status = 'inactive';
    p1Ship.length = p1Ship.components.length;
    p2Ship.components = p2Ship.components.map((c, i) => `0${i}`);
    p2Ship.status = 'inactive';
    p2Ship.length = p2Ship.components.length;
  }

  currentPlayer = computer ? playerOne : Math.round(Math.random()) === 0 ? playerOne : playerTwo;
  
  deployingShips(currentPlayer);
};

// Create the grids
createGrid(playerOneBoard, playerOne);
createGrid(playerTwoBoard, playerTwo);
coordinateContext(columns, rows, letters);

// Creating ship
battleShipFactory(playerOne);
battleShipFactory(playerTwo);

console.log(currentPlayer.id, 'is first');
deployingShips(currentPlayer);

document.addEventListener('keydown', (e) => {
  if (validKeyCodes[e.keyCode] && !gameStarted && !gameEnd) {
    moveShip(currentPlayer, shipId, e.keyCode);
  } else if (validKeyCodes[e.keyCode] && gameStarted && !gameEnd) {
    moveCrossHair(currentPlayer, e.keyCode);
  } else if (e.keyCode === 82) {
    resetGame();
  } else if (e.keyCode === 67) {
    console.log('Computer is playing:', computer);
    computer = true //!computer;
    resetGame();
  }
});