BOARD_SIZE = 6;
P1_COLOR = "#FCC";
P2_COLOR = "#CCF";
currentPlayer = true;
currentNumber = 1;

Circle = (function() {
  Circle.RADIUS = 40;

  function Circle(i, j) {
    this.i = i;
    this.j = j;
    this.content = 0;
    this.color = "#363636";
  }
  
  Circle.prototype.getX = function() {
    return Circle.RADIUS + this.i*Circle.RADIUS*2 - this.j*Circle.RADIUS;
  }
  Circle.prototype.getY = function() {
    return Circle.RADIUS + this.j*Circle.RADIUS*1.74;
  }
  
  Circle.prototype.isEmpty = function() {
    return this.content == 0;
  }

  Circle.prototype.setContentAndColor = function(value, color) {
    this.content = value;
    this.color = color;
  }

  Circle.prototype.isMouseInside = function() {
    var dx = this.getX() - mouseX;
    var dy = this.getY() - mouseY;
    return Math.sqrt(dx*dx + dy*dy) < Circle.RADIUS; 
  }
  
  Circle.prototype.draw = function() {
    var x = this.getX();
    var y = this.getY();
    fill(this.color);
    ellipse(x, y, Circle.RADIUS*2, Circle.RADIUS*2);
    fill(0);
    if(this.content > 0) {
      textSize(52);
      text(this.content, x - Circle.RADIUS/3 - int(Math.log10(this.content))*17, y + Circle.RADIUS/2);
    }
    
    textSize(14);
    text(this.i + "/" + this.j, x - Circle.RADIUS/3, y + Circle.RADIUS/1.1);
  };
  
  return Circle;
})();


function setup() {
  var canvasSize = Circle.RADIUS * BOARD_SIZE * 2;
  createCanvas(canvasSize, canvasSize);
  
  board = {};
  for (i=0; i<BOARD_SIZE; i++) {
    board[i] = {};
    for (j=0; j<=i; j++)
      board[i][j] = new Circle(i,j);
  }
}

function draw() {
  background(230);
  for (i=0; i<BOARD_SIZE; i++)
    for (j=0; j<=i; j++)
      board[i][j].draw();
}

function mousePressed() {
  for (i=0; i<BOARD_SIZE; i++)
    for (j=0; j<=i; j++) {
      var c = board[i][j];
      if (c.isMouseInside() && c.isEmpty()) {
        c.setContentAndColor(Math.floor(currentNumber), currentPlayer ? P1_COLOR : P2_COLOR);
        currentNumber += 0.5;
        currentPlayer = !currentPlayer;
        return;
      }
    }
}
