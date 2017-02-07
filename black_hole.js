BOARD_SIZE = 6;
CIRCLES_IN_RACK = 10;
PLAYERS = {true: {color: "#F88", name: "Red"},
           false: {color: "#99F", name: "Blue"}};
currentPlayer = Math.random() > 0.5;
currentNumber = 1;

extend = function(child, parent) { for (var key in parent) { if ({}.hasOwnProperty.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Circle = (function() {
  Circle.RADIUS = 40;
  Circle.FX = {none: 0, blink: 1}

  function Circle(value = 0, player = null) {
    this.setValueAndPlayer(value, player);
    this.x = this.calculateX();
    this.y = this.calculateY();
    this.fx = Circle.FX.none;
  }

  Circle.prototype.isEmpty = function() {
    return this.value == 0;
  }

  Circle.prototype.setValueAndPlayer = function(value, player) {
    this.value = value;
    this.player = player;
    this.color = color("#363636");
    if (player != null)
      this.color = color(PLAYERS[player].color);
    this.borderWeight = this.value + 1;
    this.radius = Circle.RADIUS - Math.floor(this.value/2);
  }

  Circle.prototype.isMouseInside = function() {
    var dx = this.x - mouseX;
    var dy = this.y - mouseY;
    return Math.sqrt(dx*dx + dy*dy) < Circle.RADIUS; 
  }
  
  Circle.prototype.draw = function() {
    var color = this.color;
    if (this.fx == Circle.FX.blink) {
      this.colorBlend += this.colorBlendStep;
      if (this.colorBlend <= 0 || this.colorBlend >= 1) this.colorBlendStep *= -1;
      var color = lerpColor(this.color1, this.color2, this.colorBlend);
    }
    
    var x = this.x;
    var y = this.y;
    fill(color);
    strokeWeight(this.borderWeight);
    ellipse(x, y, this.radius*2, this.radius*2);
    fill(0);
    if(this.value > 0) {
      textSize(52);
      text(this.value, x - Circle.RADIUS/3 - int(Math.log10(this.value))*17, y + Circle.RADIUS/2);
    }
  };
  
  Circle.prototype.stopFx = function() {
    this.fx = Circle.FX.none;
  };
  
  Circle.prototype.blink = function() {
    this.fx = Circle.FX.blink;
    this.color1 = this.color;
    this.color2 = color(hue(this.color) + 5, saturation(this.color) + 90, brightness(this.color) + 25);
    this.colorBlend = 0;
    this.colorBlendStep = 0.02;
  };
  
  return Circle;
})();

BoardCircle = (function() {
  extend(BoardCircle, Circle);

  function BoardCircle(i, j) {
    this.i = i;
    this.j = j;
    return BoardCircle.__super__.constructor.apply(this);
  }
  
  BoardCircle.prototype.calculateX = function() {
    return Circle.RADIUS*4 + this.i*Circle.RADIUS*2 - this.j*Circle.RADIUS;
  }
  BoardCircle.prototype.calculateY = function() {
    return Circle.RADIUS + this.j*Circle.RADIUS*1.74 + 1;
  }
  
  return BoardCircle;
})();

RackCircle = (function() {
  extend(RackCircle, Circle);

  function RackCircle(value, player) {
    return RackCircle.__super__.constructor.apply(this, [value, player]);
  }
  
  RackCircle.prototype.calculateX = function() {
    var x = this.player ? Circle.RADIUS : Circle.RADIUS + 2*Circle.RADIUS*BOARD_SIZE + 4*Circle.RADIUS;
    if(this.value > 1 && this.value % 2 == 0) x += this.player ? 1.74*Circle.RADIUS : -1.74*Circle.RADIUS;
    return x + 1;
  }
  RackCircle.prototype.calculateY = function() {
    if (this.value == 1) return 2*Circle.RADIUS*this.value;
    return Circle.RADIUS*this.value + Circle.RADIUS;
  }

  return RackCircle;
})();


function setup() {
  colorMode(HSB, 255);
  var boardSizeBase = Circle.RADIUS * BOARD_SIZE + 1;
  createCanvas(3*boardSizeBase, 2*boardSizeBase);
  
  board = {};
  for (i=0; i<BOARD_SIZE; i++) {
    board[i] = {};
    for (j=0; j<=i; j++)
      board[i][j] = new BoardCircle(i,j);
  }
  
  racks = {true: [], false: []};
  for (i=1; i<=CIRCLES_IN_RACK; i++) {
    racks[true].push(new RackCircle(i, true));
    racks[false].push(new RackCircle(i, false));
  }
  racks[currentPlayer][0].blink();
  
  gameResultText = "";
}

function draw() {
  background(210);
  for (i=0; i<BOARD_SIZE; i++)
    for (j=0; j<=i; j++)
      board[i][j].draw();
  
  for (i=0; i<racks[true].length; i++) racks[true][i].draw();
  for (i=0; i<racks[false].length; i++) racks[false][i].draw();
  
  if (gameResultText != "") {
    textSize(27);
    text(gameResultText, 6*Circle.RADIUS, 1.74*Circle.RADIUS*BOARD_SIZE + 1.2*Circle.RADIUS);
  }
}

function mousePressed() {
  if (currentNumber < CIRCLES_IN_RACK+1)
    loop: for (i=0; i<BOARD_SIZE; i++)
      for (j=0; j<=i; j++) {
        var c = board[i][j];
        if (c.isMouseInside() && c.isEmpty()) {
          c.setValueAndPlayer(Math.floor(currentNumber), currentPlayer);
          currentNumber += 0.5;
          racks[currentPlayer].shift();
          currentPlayer = !currentPlayer;
          if (racks[currentPlayer].length > 0) racks[currentPlayer][0].blink();
          else endGame();
          break loop;
        }
      }
}

function endGame() {
  var blackHole = null;
  loop: for (i=0; i<BOARD_SIZE; i++)
    for (j=0; j<=i; j++)
      if (board[i][j].isEmpty()) {
        blackHole = board[i][j];
        break loop;
    }
  blackHole.color = color(0);

  var neighbourhood = [
    [-1,-1], [0,-1],
    [-1, 0], [1, 0],
    [ 0, 1], [1, 1]
  ]  
  var eatenCircles = neighbourhood.map(function(x) {
    var col = board[blackHole.i + x[0]];
    if (col) return col[blackHole.j + x[1]];
  }).filter(function(x) { return x !== undefined });
  
  var scores = {true: 0, false: 0};
  for(i=0; i<eatenCircles.length; i++) {
    scores[eatenCircles[i].player] += eatenCircles[i].value;
    eatenCircles[i].blink();
  }
  
  var winningPlayer = scores[true] < scores[false];
  gameResultText = PLAYERS[winningPlayer].name + " wins!";
  if (scores[true] == scores[false]) gameResultText = "Game drawn!";
  gameResultText += "  " + scores[true] + "/" + scores[false];
}

