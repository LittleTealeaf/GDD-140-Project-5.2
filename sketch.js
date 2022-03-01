/// <reference path="./libraries/p5.global-mode.d.ts" />

const fps = 60;
const smooth_ui = 0.3;
const max_ui_delay = 3 * fps;
const grid_length = 20;

const RUNNING = 0;
const ADDING = 1;
const REMOVING = 2;

var showui = 0;
var ui_delay = 0;

var board, cols, rows;

var render_offset_x, render_offset_y;

var tickrate = 30;

function setup() {
  createCanvas(windowWidth - 20, windowHeight - 20);
  frameRate(fps);

  cols = int(width / grid_length);
  rows = int(height / grid_length);

  render_offset_x = (width - cols * grid_length) / 2;
  render_offset_y = (height - rows * grid_length) / 2;

  board = Array.from({
      length: rows
    }, () =>
    Array.from({
      length: cols
    }, () => Math.random() < 0.5)
  );
}

function draw() {
  background(0);
  updateShowUI();
  renderBoard();
  if(frameCount%(fps / tickrate) == 0) {
    tick();
  }
  fill(255);
}

function updateShowUI() {
  if (ui_delay > 0) {
    ui_delay--;
  }
  var goal = ui_delay > 0 ? 1 : 0;
  showui += (goal - showui) * smooth_ui;
}

function mouseMoved() {
  ui_delay = max_ui_delay;
}


function renderBoard() {
  fill('white');
  for (var x = 0; x < cols; x++) {
    for (var y = 0; y < rows; y++) {
      if (board[y][x]) {
        rect(render_offset_x + x * grid_length, render_offset_y + y * grid_length, grid_length, grid_length);
      }
    }
  }
}

function tick() {
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