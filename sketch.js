/// <reference path="./libraries/p5.global-mode.d.ts" />

class Vector2 {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
}

class Button {
  constructor(startPos, endPos, size, rend) {
    this.startPos = startPos;
    this.endPos = endPos;
    this.size = size;
    this.rend = rend;
  }

  render(showui) {
    var x = this.startPos.x * (1 - showui) + this.endPos.x * showui;
    var y = this.startPos.y * (1 - showui) + this.endPos.y * showui;
    this.rend(showui,x,y,this.size.x,this.size.y);
  }

  contains(showui,mx,my) {
    var x = this.startPos.x * (1 - showui) + this.endPos.x * showui;
    var y = this.startPos.y * (1 - showui) + this.endPos.y * showui;
    return mx > x && mx < x + this.size.x && my > y && my < y + this.size.y;
  }
}

const fps = 60;
const smooth_ui = 0.2;
const max_ui_delay = 1.5 * fps;
const grid_length = 20;

const button_height = 50;

const RUNNING = 0;
const ADDING = 1;
const REMOVING = 2;

var BUTTON_PLAY;

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

  BUTTON_PLAY = new Button(new Vector2(5,-40), new Vector2(5,5), new Vector2(100,50),function(showui,x,y,w,h) {
    fill(255,255,255,255 * showui);
    rect(x,y,w,h);
    fill(255,0,0,255 * showui);
    rect(x + 1, y + 1, w - 2, h - 2);
  });
}

function draw() {
  background(0);
  updateShowUI();
  renderBoard();
  renderUI();
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

function renderUI() {
  //Draw the start/stop button
  fill(255,255,255,255 * showui);
  noStroke();
  // rect(5,-40 + 50 * showui,100,button_height);
  BUTTON_PLAY.render(showui);
}