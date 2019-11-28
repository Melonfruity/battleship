const chai = require('chai');
const expect = chai.expect;

const createGrid = require('./index.js');

describe('battleship', function() {
  it('board has 100 child elements', function(){
    const board = createElement('div');
    const player = 'p1'; // player id
    createGrid(board, player);
    expect(board.children.length).to.equal(100);
  })
})