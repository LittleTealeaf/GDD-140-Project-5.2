/// <reference path="./libraries/p5.global-mode.d.ts" />

/**
 * Initial random chance for each square
 */
const randomChance = 0.5;
/**
 * Tick-rate of the render
 */
const tickRate = 45;
/**
 * Size, in pixels, of each square
 */
const size = 15;

//number of columns, rows, and the board
var cols = 0;
var rows = 0;
var board;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //Set board sized based on how much you can fit on the screen
  cols = int(width / size);
  rows = int(height/size);

  /*
  Create the board
  https://stackoverflow.com/a/50002641
  */
  board = Array.from({ length: rows }, () => 
    Array.from({length: cols},() => Math.random() < randomChance)
  );

  frameRate(tickRate);
}

function draw() {
  //Create a black background so we only need to render the white tiles
  background(0);
  //Render the board
  renderBoard();
  //Update the board
  updateBoard();
}

function renderBoard() {
  //Set fill to white
  fill('white');
  //Only render the white tiles, drawing them at the appropriate position
  for(var x = 0; x < cols; x++) {
    for(var y = 0; y < rows; y++) {
      if(board[y][x]) {
        rect(x * size,y * size,size,size);
      }
    }
  }
}

function updateBoard() {
  //Create a new board of all false values
  newBoard = Array.from({length: rows}, () => Array.from({length: cols},() => false));

  //Loop through each location
  for(var x = 0; x < cols; x++) {
    for(var y = 0; y < rows; y++) {
      //Count neighbors
      var neighborCount = 0;
      for(var nx = x - 1; nx <= x + 1; nx++) {
        for(var ny = y - 1; ny <= y + 1; ny++) {
          /*
          Basically, count neighbors and make sure not to include itself or try going out of bounds
          */
          if(!(ny == y && nx == x) && ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            if(board[ny][nx]) {
              neighborCount++;
            }
          }
        }
      }
      //Values depending on the current state, as per rules of Conway's Game of Life
      if(board[y][x]) {
        newBoard[y][x] = neighborCount >= 2 && neighborCount <= 3;
      } else {
        newBoard[y][x] = neighborCount == 3;
      }
    }
  }
  //Update board to new board
  board = newBoard;
}