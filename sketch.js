/// <reference path="./libraries/p5.global-mode.d.ts" />

const randomChance = 0.5;
const tickRate = 30;

var cols = 0;
var size = 15;
var rows = 0;
var board;

function setup() {
  createCanvas(windowWidth, windowHeight);

  cols = int(width / size);
  rows = int(height/size);

  /*
  https://stackoverflow.com/a/50002641
  */
  board = Array.from({ length: rows }, () => 
    Array.from({length: cols},() => Math.random() < randomChance)
  );
}

function draw() {
  background(220);
  renderBoard();
  updateBoard();
  frameRate(tickRate);
}

function renderBoard() {
  for(var x = 0; x < cols; x++) {
    for(var y = 0; y < rows; y++) {
      if(board[y][x]) {
        fill('white');
      } else {
        fill('black');
      }
      rect(x * size,y * size,size,size);
    }
  }
}

function updateBoard() {
  newBoard = Array.from({length: rows}, () => Array.from({length: cols},() => false));
  for(var x = 0; x < cols; x++) {
    for(var y = 0; y < rows; y++) {
      var neighborCount = 0;
      for(var nx = x - 1; nx <= x + 1; nx++) {
        for(var ny = y - 1; ny <= y + 1; ny++) {
          if(!(ny == y && nx == x) && ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
            if(board[ny][nx]) {
              neighborCount++;
            }
          }
        }
      }
      if(board[y][x]) {
        newBoard[y][x] = neighborCount >= 2 && neighborCount <= 3;
      } else {
        newBoard[y][x] = neighborCount == 3;
      }
    }
  }
  board = newBoard;
}