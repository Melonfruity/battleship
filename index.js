const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J'];
const playerOne = {id: 'p1', deployedAllShips: false};
const playerTwo = {id: 'p2', deployedAllShips: false};

const container = document.querySelector('#container');
const playerOneBoard = document.querySelector('#playerOneBoard');
const playerTwoBoard = document.querySelector('#playerTwoBoard');

const gridSize = 400;
const dimensions = 10;

// Returns new coordinates depending on key
const newPos = {
  87: (x, y) => `${x}${Number(y) - 1}`,
  65: (x, y) => `${Number(x) - 1}${y}`,
  83: (x, y) => `${x}${Number(y) + 1}`,
  68: (x, y) => `${Number(x) + 1}${y}`,
  73: (x, y) => `${x}${Number(y) - 1}`,
  74: (x, y) => `${Number(x) - 1}${y}`,
  75: (x, y) => `${x}${Number(y) + 1}`,
  76: (x, y) => `${Number(x) + 1}${y}`,
}

const validKeyCodes = {
  87: true,
  65: true,
  83: true,
  68: true,
  73: true,
  74: true,
  75: true,
  76: true,
  13: true,
  70: true,
}
// w: 87  i: 73  up
// a: 65  j: 74  left
// s: 83  k: 75  down
// d: 68  l: 76  right
// enter: 13 r: 82 (change direction);
// f: 70

// Create the Grid, Tiles, and adding the tile objects for referencing to the player object
const createGrid = (board, player) => {
  // Create the dimensions and border of a board
  board.style.cssText = `display: grid; 
                        height: ${gridSize}px; 
                        width: ${gridSize}px; 
                        border: 1px solid black;
                        grid-template-columns: repeat(10, 1fr);
                        grid-gap: 0`;
  // Creating the board property for player object
  const boardObject = {}

  // Creating the tile and referencing
  for (let i = 0; i < 100; i++){
    let columnIndex = i % 10;
    let rowIndex = Math.floor( i / 10);
    let id = `${player.id}${letters[columnIndex]}${rowIndex + 1}`;
    const gridItem = document.createElement('div');
      gridItem.style.cssText = `border: 1px solid black`;
      gridItem.id = id;
    board.appendChild(gridItem);
    
    // Referencing
    boardObject[`${columnIndex}${rowIndex}`] = {
      'tile': gridItem, 
      'id': `${letters[columnIndex]}${rowIndex + 1}`,
      'occupiedBy': false,
      'componentIndex': false,
    };
  }

  player.board = boardObject;
};

// Make the ships
const battleShipFactory = (player) => {
  
  const battleShipLengths = [5, 4, 3, 3, 2];
  const battleShipId = ['carrier', 'battleship','cruiser', 'submarine', 'destroyer'];
  const battleShipArray = battleShipLengths.reduce((ships, length, i) => {
    let battleShipObj = {id: battleShipId[i], length: length, status: 'inactive', components: []};
    
    for(let i = 0; i < length; i ++){
      battleShipObj.components.push(`0${i}`);
    }
    ships.push(battleShipObj);
    return ships;
  }, []);
  const battleShips = battleShipArray.reduce((names, ship, i) => {
    names[battleShipId[i]] = ship;
    return names;    
  }, {}) 
  player.ships = battleShips;
};

// Create the grids
createGrid(playerOneBoard, playerOne);
createGrid(playerTwoBoard, playerTwo);

battleShipFactory(playerOne);
battleShipFactory(playerTwo);

const moveShip = (player, shipId, keyCode) => {
  
  // Let deployShip function decide which ship is going to be moving
  let ship = player.ships[shipId];
  let comp = ship.components;
  
  // Changes the color of the tile based on the occupancy
  const changeTile = c => {
    const next = newPos[keyCode](c[0], c[1]);
    const curr = c;
    if(player.board[curr].occupiedBy){
      player.board[curr].tile.style[`background-color`] = `brown`;
    } else {
      player.board[curr].tile.style[`background-color`] = `white`;
    }
    player.board[next].tile.style[`background-color`] = `black`;
    console.log('next', next, 'curr', curr);
    return next;
  }
  
  if(keyCode !== 13 && keyCode !== 70){
    //If the ship is at the boundaries
    if(!checkIfMoveable(player.board, ship, false, keyCode)) return;

    if(keyCode === 83 || keyCode === 73){
      player.ships[shipId].components = comp
        .reverse()
        .map(c => changeTile(c))
        .reverse()
    } else {
      player.ships[shipId].components = comp
        .map(c => changeTile(c));
    }
  } else if(keyCode === 13){
    console.log(checkIfDeployable(player, shipId))
    if(checkIfDeployable(player, shipId)){
      player.ships[shipId].status = 'deployed';
      player.ships[shipId].components = comp
        .map((c, i) => {
          player.board[c].occupiedBy = shipId;
          player.board[c].componentIndex = i;
          return c;
        })
    } else {
      return;
    }
  } else if(keyCode === 70) {
    console.log(keyCode)
    player.ships[shipId].components = comp
      .map(c => {
        const next = `${c[1]}${c[0]}`;
        const curr = `${c[0]}${c[1]}`;
        if(player.board[curr].occupiedBy){
          player.board[curr].tile.style[`background-color`] = `brown`;
        } else {
          player.board[curr].tile.style[`background-color`] = `white`;
        }
        player.board[next].tile.style[`background-color`] = `black`;
        console.log('next', next, 'curr', curr);
        return next;
      });
    console.log(playerOne.board)
  } else {
    return;
  }
}

const checkIfMoveable = (board, ship, direction, keyCode) => {
  const c = ship.components; // components
  console.log(c)
  const head = [c[0][0], c[0][1]]; // x, y
  const tail = `${c[c.length - 1][0]}${c[c.length - 1][1]}`;
  // Checks if the ship can be moved
  let moveAble = true;

  if(keyCode === 87 || keyCode === 73){
    // y of head cannot be 0
    moveAble = head[1] != 0; // type coersion
  } else if(keyCode === 65 || keyCode === 74){
    moveAble = head[0] != 0;
  } else if(keyCode === 83 || keyCode === 75){
    moveAble = tail[1] != 9;
  } else if(keyCode === 68 || keyCode === 76){
    moveAble = tail[0] != 9;
  }
  return moveAble;
}

const checkIfDeployable = (player, ship) => {
  // If there is a true in any tile the current ship is currently hovering then you cannot deploy
  const checkIfAvailable = player.ships[ship].components.map((c) => {
    if(player.board[c].occupiedBy) return true;
      console.log(player.board[c])
      return true;
  }).includes(false)
  console.log(checkIfAvailable)
  return checkIfAvailable
}
// BattleShip placement will always start from the battleship's index 0,
// regardless of whether it is placed vertically or horizontally.
// A1 to E1 = (0, 0) to (5, 0) map carrier -> component[0] = (0, 0), ... component[5] = (5, 0)
// A1 to A5 = (0, 0) to (0, 5) map carrier -> component[0] = (0, 0), ... component[5] = (0, 5)
// Checks: 
// 1. The length from E1 to A1 === carrier.length
// 2. Every A1 to E1 occupied === false, change to true after or fill with carrier id
// 3. Vertical placement or Horizontal placement, so use X or Y coordinate.

const deployingShips = (player) => {
  // true = horizontal
  // false = vertical
  // console.log(board, ship, direction, head)
  // Checks if the needed tiles are available, if not return. If available occupy it.
  console.log(player.board);
  console.log(player.ships)
  /* playerOne.ships[testDestroyer.id].components
  .forEach(c => {
    playerOne.board[c].tile.style[`background-color`] = `black`;
  }) */

  // Go to the playerX's ships then get a Objkey of the ships. This array will be used to
  // iterate through the board. I should use a while loop for until deployed is true. The
  // ships to be deployed will be made black first. Status should be set to deploying and
  // deployed after moving is done.

  const battleShipKeys = Object.keys(player.ships);

  console.log(battleShipKeys)

  // Check which ships have not been deployed, if all ships have been then set the deployed all player ship flag to true
  console.log(player.deployedAllShips);
}

const testCarrier = playerOne.ships[`carrier`];
const testDestroyer = playerOne.ships[`destroyer`];

let currentPlayer = playerOne;

// Deploy e: 69, o:79

document.addEventListener('keydown', (e) => {
  /* if(!currentPlayer.deployedAllShips){
    deployingShips(currentPlayer);
  } */
  if(validKeyCodes[e.keyCode]){
    console.log(e.keyCode)
    moveShip(currentPlayer, `carrier`, e.keyCode);
  }
});

/*
const resetGame = () => {
  playerOne.ships.forEach(ship => {
    ship.status = `inactive`;
    ship.components.forEach(c => false);
  })
  Object.keys(playerOne.board).forEach(key => {
    const tile = playerOne.board[key]
    tile.tile.style[`background-color`] = `white`;
    tile.occupied = false;
  })
} */