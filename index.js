// Initial player objects
const playerOne = {id: 'p1', deployedAllShips: false};
const playerTwo = {id: 'p2', deployedAllShips: false};

const container = document.querySelector('#container');
const playerOneBoard = document.querySelector('#playerOneBoard');
const playerTwoBoard = document.querySelector('#playerTwoBoard');

// Info for the board
const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J'];
const gridSize = 400;
const dimensions = 10;

// Info for ships
const battleShipLengths = [5, 4, 3, 3, 2];
const battleShipId = ['carrier', 'battleship','cruiser', 'submarine', 'destroyer'];
  
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

// Valid key codes to play with
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

// Current direction of a ship (vertical: true or horizontal: false)
let direction = true;

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
    };
  }

  player.board = boardObject;
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
    if(!checkIfMoveable(ship, keyCode)) return;

    // Vertical fix and Horizontal fix
    if((keyCode === 83 && direction) || (keyCode === 68 && !direction)){
      player.ships[shipId].components = comp
        .reverse()
        .map(c => changeTile(c))
        .reverse()
    } else {
      player.ships[shipId].components = comp
        .map(c => changeTile(c));
    }
  } else if(keyCode === 13){
    // Deploys and maps a battleship
    deployShip(player, shipId, comp);
  } else if(keyCode === 70){
    changeDirection(player, shipId, comp);
  } else {
    return;
  }
}
const changeDirection = (player, shipId, comp) => {
  direction = !direction;
  player.ships[shipId].components = comp
    .map(c => {
      // This inverts the original coordinates. This also eliminates
      // a potential boundary issue, but makes game quality worse?
      const next = `${c[1]}${c[0]}`;
      const curr = `${c[0]}${c[1]}`;
      if(player.board[curr].occupiedBy){
        player.board[curr].tile.style[`background-color`] = `brown`;
      } else {
        player.board[curr].tile.style[`background-color`] = `white`;
      }
      player.board[next].tile.style[`background-color`] = `black`;
      return next;
    });
}
const deployShip = (player, shipId, comp) => {
  if(checkIfDeployable(player, shipId)){
    player.ships[shipId].status = 'deployed';
    player.ships[shipId].components = comp
      .map((c, i) => {
        player.board[c].occupiedBy = shipId;
        player.board[c].componentIndex = i;
        player.board[c].tile.style[`background-color`] = `brown`;
        return c;
      })
    deployingShips(player);  
  } else {
    return false;
  }
}
const checkIfMoveable = (ship, keyCode) => {
  const c = ship.components; // components
  console.log(c)
  const head = [c[0][0], c[0][1]]; // x, y
  const tail = `${c[c.length - 1][0]}${c[c.length - 1][1]}`;
  // Checks if the ship can be moved
  let moveAble = true;

  if(keyCode === 87 || keyCode === 73){
    // y of head cannot be 0, same case for 9 and all directions
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
    if(player.board[c].occupiedBy) return false;
      return true;
  })
  return !checkIfAvailable.includes(false)
}

// use the deploy function to call deploying to deploy next until p2
let currentPlayer = playerOne;
let gameStarted = false;
let shipId = battleShipId[0];

playerOne.nextPlayer = playerTwo;
playerTwo.nextPlayer = playerOne;

const deployingShips = (player) => {
  
  const battleShipKeys = Object.keys(player.ships);
  console.log(battleShipKeys)
  console.log(player.deployedAllShips);
  for(let i = 0; i < battleShipKeys.length; i ++){
    if(player.ships[battleShipKeys[i]].status === 'inactive'){
      shipId = player.ships[battleShipKeys[i]].id;
      break;
    }
    if(i === battleShipKeys.length - 1){
      player.deployedAllShips = true;
      if(playerOne.deployedAllShips && playerTwo.deployedAllShips){
        console.table(playerOne.board)
        console.table(playerOne.ships)
        console.table(playerOne.board)
        console.table(playerOne.ships)
        gameStarted = true;
      } else {
        currentPlayer = player.nextPlayer;
        shipId = battleShipId[0];
      }
    }
  }
  // Check if all players have deployed their ships
  console.log(playerOne.id, 'has deployed all ships:', playerOne.deployedAllShips)
  console.log(playerTwo.id, 'has deployed all ships:', playerTwo.deployedAllShips)
  console.log('CurrentPlayer',currentPlayer.id, 'Deploying', shipId, 'Game started:', gameStarted);
}

document.addEventListener('keydown', (e) => {
  if(validKeyCodes[e.keyCode] && !gameStarted){
    console.log('Here')
    moveShip(currentPlayer, shipId, e.keyCode);
  }
});

document.addEventListener('click', (e) => {
  if(e.target.className === `${playerOne.id}tile` || e.target.className === `${playerTwo.id}tile`){
    console.log(e.target.id);
  }
})
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