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
