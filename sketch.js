/// <reference path="./libraries/p5.global-mode.d.ts" />

/**
 * Represents a 2 dimensional vector
 */
class Vector2 {
  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * A button class! Yes! Because button classes are amazing and animation is even better
 */
class Button {
  constructor(startPos, endPos, size, rend) {
    /*
    These are all amazing vector2s, the rend variable is a function (see the method)
    */
    this.startPos = startPos;
    this.endPos = endPos;
    this.size = size;
    this.rend = rend;
  }

  /**
   * Renders with a given % of the slider. Calculates a variable x, y, w, and h based on the current scale
   * @param {number} showui 
   */
  render(showui) {
    var x = this.startPos.x * (1 - showui) + this.endPos.x * showui;
    var y = this.startPos.y * (1 - showui) + this.endPos.y * showui;
    this.rend(showui,x,y,this.size.x,this.size.y);
  }

  /**
   * Checks if the button would contain the mouse at a given location
   * @param {*} showui 
   * @param {*} mx 
   * @param {*} my 
   * @returns 
   */
  contains(showui,mx,my) {
    var x = this.startPos.x * (1 - showui) + this.endPos.x * showui;
    var y = this.startPos.y * (1 - showui) + this.endPos.y * showui;
    return mx > x && mx < x + this.size.x && my > y && my < y + this.size.y;
  }
}

/*
Constants for days!
*/
const fps = 60;
/*
How fast the ui should smooth out
*/
const smooth_ui = 0.2;
/*
Maximum delay in frames
*/
const max_ui_delay = 1.5 * fps;
/*
How big the grid squares should be
*/
const grid_length = 20;

/*
state constants, like an enum but I didn't feel like investigating enums in javascript, no idea if they even exist
*/
const RUNNING = 0;
const ADDING = 1;
const REMOVING = 2;

/*
Button variables, no idea why I made them all caps
*/
var BUTTON_PLAY, BUTTON_ADD, BUTTON_REMOVE, BUTTON_CLEAR;

/*
Variables to do the maths. I'm sorry I don't want to explain them all
*/
var showui = 0;
var ui_delay = 0;

var state = RUNNING;

var board, cols, rows;

var render_offset_x, render_offset_y;

var tickrate = 30;

function setup() {
  //Create a canvas, set the framerate
  createCanvas(windowWidth - 20, windowHeight - 20);
  frameRate(fps);

  //Indicate rows and column counts
  cols = int(width / grid_length);
  rows = int(height / grid_length);

  //calculate offset (so it has an even board around the edge of the screen)
  render_offset_x = (width - cols * grid_length) / 2;
  render_offset_y = (height - rows * grid_length) / 2;

  //Create the board...
  /*
  Create the board, 
  used the following to figure out 2d arrays: https://stackoverflow.com/a/50002641
  */
  board = Array.from({length: rows}, () => Array.from({length: cols},() => Math.random() < 0.4));
  
  //Creates the buttons 
  createButtons();
}

function createButtons() {
  /*
  Oh boy... commenting this... well then
  Basically, the first 3 vectors are the start (hidden) position, end (visible) position, and size respectively.
  Then it's a function that renders the button based on the current x, y, h, w, and showui state as well as other states.
  */
  BUTTON_PLAY = new Button(new Vector2(5,-50), new Vector2(5,5), new Vector2(100,50),function(showui,x,y,w,h) {
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
  BUTTON_ADD = new Button(new Vector2(110,-50),new Vector2(110,5), new Vector2(100,50), function(showui,x,y,w,h) {
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
  BUTTON_REMOVE = new Button(new Vector2(215,-50),new Vector2(215,5), new Vector2(100,50), function(showui,x,y,w,h) {
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
  BUTTON_CLEAR = new Button(new Vector2(320,-50),new Vector2(320,5), new Vector2(100,50), function(showui,x,y,w,h) {
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
  //draw backgroudn
  background(0);
  //Update the showui val
  updateShowUI();
  //render the board
  renderBoard();
  //if state is running, only run a tick on the proper frames
  if(state == RUNNING) {
    if(frameCount%(fps / tickrate) == 0) {
      tick();
    }
  } else {
    //mouse hover for the fancy editing stuff
    renderHover();
  }
  //Render buttons
  renderUI();
  
}

/**
 * gradually decreases ui_delay if it's above 1, and then sets the goal and interpolates showui towards the goal based on whether ui_delay is above 0
 */
function updateShowUI() {
  if (ui_delay > 0) {
    ui_delay--;
  }
  var goal = ui_delay > 0 ? 1 : 0;
  showui += (goal - showui) * smooth_ui;
}

/**
 * If the mouse moves, reset ui_delay!
 */
function mouseMoved() {
  ui_delay = max_ui_delay;
}

/**
 * Renders only the living pieces
 */
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

/**
 * Performs a tick by making a new array, computing the changes by each point, and then swapping out the boards
 */
function tick() {
  board = board.map((row,y) => row.map((e,x) => {
    var neighbors = 0;
    for(var nx = x - 1; nx <= x + 1; nx++) {
      for(var ny = y - 1; ny <= y + 1; ny++) {
        if(!(ny == y && nx == x) && ny >= 0 && ny < rows && nx >= 0 && nx < cols) {
          if(board[ny][nx]) {
            neighbors++;
          }
        }
      }
    }
    return neighbors == 3 || (e && neighbors == 2);
  }));
}

/**
 * Renders buttons
 */
function renderUI() {
  BUTTON_PLAY.render(showui);
  BUTTON_ADD.render(showui);
  BUTTON_REMOVE.render(showui);
  BUTTON_CLEAR.render(showui);
}

/**
 * Different functions based on mouse position and state
 */
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

/**
 * If the mouse is dragged, act as if it was clicked
 */
function mouseDragged() {
  mouseClicked();
}

/**
 * Clears the board
 */
function clearBoard() {
  board = Array.from({length: rows}, () => Array.from({length: cols},() => false));
}

/**
 * Renders the awesome hovering selection piece during editing
 */
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

/**
 * Executes changes based on mouse position
 */
function positionClicked() {
  var x = int((mouseX - render_offset_x) / grid_length);
  var y = int((mouseY - render_offset_y) / grid_length);
  if(state == ADDING) {
    board[y][x] = true;
  } else if(state == REMOVING) {
    board[y][x] = false;
  }
}