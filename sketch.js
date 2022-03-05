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

var BUTTON_PLAY, BUTTON_ADD, BUTTON_REMOVE, BUTTON_CLEAR;

var showui = 0;
var ui_delay = 0;

var state = RUNNING;

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
  createButtons();
}

function createButtons() {
  BUTTON_PLAY = new Button(new Vector2(5,-40), new Vector2(5,5), new Vector2(100,50),function(showui,x,y,w,h) {
    stroke('black');
    if(state == RUNNING) {
      fill(100,100,100,255 * showui);
    } else {
      fill(255,255,255,255 * showui);
    }
    rect(x,y,w,h);
    var y_top = y + h / 5;
    var y_bottom = y + h * 4 / 5;
    var x_left = x + w / 5;
    var x_right = x + w * 4 / 5;
    fill(0,255,0,255 * showui);
    triangle(x_left,y_top,x_left,y_bottom,x_right,y + h / 2);
  });
  BUTTON_ADD = new Button(new Vector2(110,-40),new Vector2(110,5), new Vector2(100,50), function(showui,x,y,w,h) {
    stroke('black');
    if(state == ADDING) {
      fill(100,100,100,255 * showui);
    } else {
      fill(255,255,255,255 * showui);
    }
    rect(x,y,w,h);
    fill(0,0,0,255*showui);
    const bar_width = 10;
    var len = h - bar_width * 2;
    rect(x + w / 2 - bar_width / 2,y + bar_width,bar_width,len);
    rect(x + w / 2 - len / 2,y + h / 2 - bar_width / 2, len,bar_width);
  });
  BUTTON_REMOVE = new Button(new Vector2(215,-40),new Vector2(215,5), new Vector2(100,50), function(showui,x,y,w,h) {
    stroke('black');
    if(state == REMOVING) {
      fill(100,100,100,255 * showui);
    } else {
      fill(255,255,255,255 * showui);
    }
    rect(x,y,w,h);
    fill(0,0,0,255*showui);
    const bar_width = 10;
    var len = h - bar_width * 2;
    rect(x + w / 2 - len / 2,y + h / 2 - bar_width / 2, len,bar_width);
  });
  BUTTON_CLEAR = new Button(new Vector2(320,-40),new Vector2(320,5), new Vector2(100,50), function(showui,x,y,w,h) {
    stroke('black');
    if(mouseIsPressed && BUTTON_CLEAR.contains(showui,mouseX,mouseY)) {
      fill(100,100,100,255 * showui);
    } else {
      fill(255,255,255,255 * showui);
    }
    rect(x,y,w,h);
    fill(0,0,0,255*showui);
    var buffer = 10;
    rect(x + buffer, y + buffer, w - buffer * 2, h - buffer * 2);    
  });
}

function draw() {
  background(0);
  updateShowUI();
  renderBoard();
  renderUI();
  if(state == RUNNING) {
    if(frameCount%(fps / tickrate) == 0) {
      tick();
    }
  } else {
    renderHover();
  }
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
  stroke('black');
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
  BUTTON_PLAY.render(showui);
  BUTTON_ADD.render(showui);
  BUTTON_REMOVE.render(showui);
  BUTTON_CLEAR.render(showui);
}

function mouseClicked() {
  if(BUTTON_PLAY.contains(showui,mouseX,mouseY)) {
    state = RUNNING;
  } else if(BUTTON_ADD.contains(showui,mouseX,mouseY)) {
    state = ADDING;
  } else if(BUTTON_REMOVE.contains(showui,mouseX,mouseY)) {
    state = REMOVING;
  } else if(BUTTON_CLEAR.contains(showui,mouseX,mouseY)) {
    clearBoard();
  } else {
    positionClicked();
  }
}

function mouseDragged() {
  mouseClicked();
}

function clearBoard() {
  board = Array.from({length: rows}, () => Array.from({length: cols},() => false));
}

function renderHover() {
  var x = int((mouseX - render_offset_x) / grid_length);
  var y = int((mouseY - render_offset_y) / grid_length);

  var transparency = 100 * sin(frameCount / 30) + 155;

  if(state == ADDING) {
    stroke(0,255,0,transparency);
    fill(0,255,0,transparency);
  } else {
    stroke(255,0,0,transparency);
    fill(255,0,0,transparency);
  }

  rect(x * grid_length + render_offset_x,y * grid_length + render_offset_y,grid_length,grid_length);
}

function positionClicked() {
  var x = int((mouseX - render_offset_x) / grid_length);
  var y = int((mouseY - render_offset_y) / grid_length);
  if(state == ADDING) {
    board[y][x] = true;
  } else if(state == REMOVING) {
    board[y][x] = false;
  }
}