const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J'];
const playerOne = {id: 'p1'};
const playerTwo = {id: 'p2'};

const container = document.querySelector('#container');
const playerOneBoard = document.querySelector('#playerOneBoard');
const playerTwoBoard = document.querySelector('#playerTwoBoard');

const gridSize = 400;

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
      'occupied': false
    };
  }

  player.board = boardObject;
};

// Create the grids
createGrid(playerOneBoard, playerOne);
createGrid(playerTwoBoard, playerTwo);

// Make the ships
const battleShipFactory = () => {
  
  const battleShipLengths = [5, 4, 3, 3, 2];

  const battleShips = battleShipLengths.reduce((ships, length) => {
    let battleShipObj = {length: length, status: 'inactive', components: []};
    for(let i = 0; i < length; i ++){
      battleShipObj.components.push(false);
    }
    ships.push(battleShipObj);
    return ships;
  }, [])
  return battleShips;
}

playerOne.ships = battleShipFactory();
playerTwo.ships = battleShipFactory();

// BattleShip placement will always start from the battleship's index 0,
// regardless of whether it is placed vertically or horizontally.
// A1 to E1 = (0, 0) to (5, 0) map carrier -> component[0] = (0, 0), ... component[5] = (5, 0)
// A1 to A5 = (0, 0) to (0, 5) map carrier -> component[0] = (0, 0), ... component[5] = (0, 5)
// Checks: 
// 1. The length from E1 to A1 === carrier.length
// 2. Every A1 to E1 occupied === false, change to true after or fill with carrier id
// 3. Vertical placement or Horizontal placement, so use X or Y coordinate.

const deployShip = (board, ship, direction, head) => {
  // true = horizontal
  // false = vertical
  // console.log(board, ship, direction, head)
  // Checks if the needed tiles are available, if not return. If available occupy it.
  if(ship.status === 'inactive'){
    for(let i = 0; i < ship.length; i ++){
      const coord = direction ? `${Number(head[0]) + i}${head[1]}` :`${head[0]}${Number(head[1]) + i}`
      if(board[coord].occupied){
        console.log('cant place there')
        return;
      }
    }
    for(let i = 0; i < ship.length; i ++){
      const coord = direction ? `${Number(head[0]) + i}${head[1]}` :`${head[0]}${Number(head[1]) + i}`
      board[coord].occupied = true;
      board[coord].tile.style[`background-color`] = `black`;
      ship.components[i] = coord;
    }
    ship.status = `active`;
    console.log(ship.status);
  }
}

const testCarrier = playerOne.ships[0];
const testDestroyer = playerOne.ships[4];

deployShip(playerOne.board, testCarrier, false, '00');
console.log(testCarrier)
deployShip(playerOne.board, testDestroyer, false, '00');
console.log(testDestroyer);
console.log(playerOne.board);

const resetGame = () => {
  playerOne.ships.forEach(ship => {
    ship.status = `inactive`;
    ship.components.forEach(component => false);
  })
  Object.keys(playerOne.board).forEach(key => {
    const tile = playerOne.board[key]
    tile.tile.style[`background-color`] = `white`;
    tile.occupied = false;
  })
}