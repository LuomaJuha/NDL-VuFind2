/* global */
class Snake extends HTMLElement {

  get pixelwidth() {
    return this.getAttribute('pixelwidth');
  }

  set pixelwidth(newValue) {
    this.setAttribute('pixelwidth', newValue);
  }

  get pixelheight() {
    return this.getAttribute('pixelheight');
  }

  set pixelheight(newValue) {
    this.setAttribute('height', newValue);
  }

  constructor()
  {
    super();
    this.pixelMultiplier = 15;

    this.direction = {
      x: 1,
      y: 0,
    };
    this.wantedDirection = [];
    this.points = 0;
    this.deathAnimationCounter = 8;
    this.deathAnimationInterval = 3;
    this.deathAnimationIterator = 0;
    this.showSnake = true;

    this.startAnimationInterval = 10;
    this.startAnimationCounter = 0;
    this.snakeFrame = 0;

    this.startScreenSnakeOne = [
      {x: 5, y: 2},
      {x: 6, y: 2},
      {x: 7, y: 2},
      {x: 8, y: 2},
      {x: 9, y: 2},
      {x: 10, y: 2},
      {x: 4, y: 3},
      {x: 5, y: 3},
      {x: 11, y: 3},
      {x: 3, y: 4},
      {x: 4, y: 4},
      {x: 11, y: 4},
      {x: 12, y: 4},
      {x: 3, y: 5},
      {x: 5, y: 5},
      {x: 8, y: 5},
      {x: 12, y: 5},
      {x: 3, y: 6},
      {x: 12, y: 6},
      {x: 3, y: 7},
      {x: 12, y: 7},
      {x: 3, y: 8},
      {x: 9, y: 8},
      {x: 10, y: 8},
      {x: 12, y: 8},
      {x: 13, y: 8},
      {x: 14, y: 8},
      {x: 3, y: 9},
      {x: 4, y: 9},
      {x: 8, y: 9},
      {x: 9, y: 9},
      {x: 12, y: 9},
      {x: 14, y: 9},
      {x: 15, y: 9},
      {x: 16, y: 9},
      {x: 4, y: 10},
      {x: 5, y: 10},
      {x: 6, y: 10},
      {x: 7, y: 10},
      {x: 8, y: 10},
      {x: 12, y: 10},
      {x: 16, y: 10},
      {x: 17, y: 10},
      {x: 4, y: 11},
      {x: 11, y: 11},
      {x: 12, y: 11},
      {x: 17, y: 11},
      {x: 3, y: 12},
      {x: 4, y: 12},
      {x: 10, y: 12},
      {x: 11, y: 12},
      {x: 18, y: 12},
      {x: 3, y: 13},
      {x: 9, y: 13},
      {x: 14, y: 13},
      {x: 15, y: 13},
      {x: 18, y: 13},
      {x: 3, y: 14},
      {x: 9, y: 14},
      {x: 14, y: 14},
      {x: 18, y: 14},
      {x: 3, y: 15},
      {x: 14, y: 15},
      {x: 15, y: 15},
      {x: 16, y: 15},
      {x: 18, y: 15},
      {x: 3, y: 16},
      {x: 13, y: 16},
      {x: 14, y: 16},
      {x: 16, y: 16},
      {x: 18, y: 16},
      {x: 19, y: 16},
      {x: 4, y: 17},
      {x: 12, y: 17},
      {x: 13, y: 17},
      {x: 16, y: 17},
      {x: 17, y: 17},
      {x: 19, y: 17},
      {x: 4, y: 18},
      {x: 5, y: 18},
      {x: 6, y: 18},
      {x: 9, y: 18},
      {x: 10, y: 18},
      {x: 11, y: 18},
      {x: 12, y: 18},
      {x: 17, y: 18},
      {x: 18, y: 18},
      {x: 19, y: 18},
      {x: 6, y: 19},
      {x: 7, y: 19},
      {x: 8, y: 19},
      {x: 9, y: 19},
      {x: 18, y: 19},
    ];

    this.startScreenSnakeTwo = [
      {x: 5, y: 4},
      {x: 6, y: 4},
      {x: 7, y: 4},
      {x: 8, y: 4},
      {x: 9, y: 4},
      {x: 10, y: 4},
      {x: 4, y: 5},
      {x: 5, y: 5},
      {x: 11, y: 5},
      {x: 3, y: 6},
      {x: 4, y: 6},
      {x: 11, y: 6},
      {x: 12, y: 6},
      {x: 3, y: 7},
      {x: 5, y: 7},
      {x: 8, y: 7},
      {x: 12, y: 7},
      {x: 3, y: 8},
      {x: 12, y: 8},
      {x: 3, y: 9},
      {x: 12, y: 9},
      {x: 3, y: 10},
      {x: 9, y: 10},
      {x: 10, y: 10},
      {x: 12, y: 8},
      {x: 13, y: 8},
      {x: 14, y: 8},
      {x: 3, y: 11},
      {x: 4, y: 11},
      {x: 8, y: 11},
      {x: 9, y: 11},
      {x: 12, y: 9},
      {x: 14, y: 9},
      {x: 15, y: 9},
      {x: 16, y: 9},
      {x: 4, y: 12},
      {x: 5, y: 12},
      {x: 6, y: 12},
      {x: 7, y: 12},
      {x: 8, y: 12},
      {x: 12, y: 10},
      {x: 16, y: 10},
      {x: 17, y: 10},
      {x: 4, y: 11},
      {x: 11, y: 11},
      {x: 12, y: 11},
      {x: 17, y: 11},
      {x: 4, y: 12},
      {x: 10, y: 12},
      {x: 11, y: 12},
      {x: 18, y: 12},
      {x: 3, y: 13},
      {x: 9, y: 13},
      {x: 14, y: 13},
      {x: 15, y: 13},
      {x: 18, y: 13},
      {x: 3, y: 14},
      {x: 9, y: 14},
      {x: 14, y: 14},
      {x: 18, y: 14},
      {x: 3, y: 15},
      {x: 14, y: 15},
      {x: 15, y: 15},
      {x: 16, y: 15},
      {x: 18, y: 15},
      {x: 3, y: 16},
      {x: 13, y: 16},
      {x: 14, y: 16},
      {x: 16, y: 16},
      {x: 18, y: 16},
      {x: 19, y: 16},
      {x: 4, y: 17},
      {x: 12, y: 17},
      {x: 13, y: 17},
      {x: 16, y: 17},
      {x: 17, y: 17},
      {x: 19, y: 17},
      {x: 4, y: 18},
      {x: 5, y: 18},
      {x: 6, y: 18},
      {x: 9, y: 18},
      {x: 10, y: 18},
      {x: 11, y: 18},
      {x: 12, y: 18},
      {x: 17, y: 18},
      {x: 18, y: 18},
      {x: 19, y: 18},
      {x: 6, y: 19},
      {x: 7, y: 19},
      {x: 8, y: 19},
      {x: 9, y: 19},
      {x: 18, y: 19},
    ];
  }

  connectedCallback()
  {
    this.screenWidth = this.pixelwidth; //84this.startScreenSnakeTwo
    this.screenHeight = this.pixelheight; //48
    this.startPosition = {
      x: this.screenWidth / 2,
      y: this.screenHeight / 2
    };
    this.startPositions = [
      {x: this.startPosition.x, y: this.startPosition.y},
      {x: this.startPosition.x - 1, y: this.startPosition.y},
      {x: this.startPosition.x - 2, y: this.startPosition.y},
      {x: this.startPosition.x - 3, y: this.startPosition.y},
      {x: this.startPosition.x - 4, y: this.startPosition.y},
      {x: this.startPosition.x - 5, y: this.startPosition.y}
    ];
    this.snake = {
      body: this.startPositions,
    };
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.screenWidth * this.pixelMultiplier;
    this.canvas.height = this.screenHeight * this.pixelMultiplier;
    this.context = this.canvas.getContext('2d');
    this.context.fillStyle = '#739900';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.edges = {
      x: 5,
      y: this.screenWidth - 4,
      z: 2,
      w: this.screenHeight - 6
    }
    this.keysPressed = {
      up: 0,
      down: 0,
      left: 0,
      right: 0
    };
    this.keyDirections = {
      up: {x: 0, y: -1},
      down: {x: 0, y: 1},
      left: {x: -1, y: 0},
      right: {x: 1, y: 0}
    };
    this.keyDirectionNegatives = {
      up: {x: 0, y: 1},
      down: {x: 0, y: -1},
      left: {x: 1, y: 0},
      right: {x: -1, y: 0}
    };
    this.keyOrder = [];
    this.appendChild(this.canvas);
    this.canvas.setAttribute('tabindex', '0');
    this.canvas.focus();
    this.setEvents();
    setInterval(this.gameLoop, 100, this);
  }

  setEvents()
  {
    const caller = this;
    window.addEventListener("keydown", function preventScroll(e) {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) > -1) {
        e.preventDefault();
      }
    }, false);
    this.canvas.addEventListener('keydown', e => {
      e.preventDefault();
      e.stopPropagation();
      switch (e.key) {
      case 'ArrowUp':
        caller.keysPressed.up = 1;
        caller.keyOrder.push('up');
        break;
      case 'ArrowDown':
        caller.keysPressed.down = 1;
        caller.keyOrder.push('down');
        break;
      case 'ArrowLeft':
        caller.keysPressed.left = 1;
        caller.keyOrder.push('left');
        break;
      case 'ArrowRight':
        caller.keysPressed.right = 1;
        caller.keyOrder.push('right');
        if (!caller.gameStarted) {
          caller.gameStarted = true;
          caller.points = 0;
        }
        break;
      }
      if (caller.gameEnded && caller.deathAnimationIterator > caller.deathAnimationCounter) {
        caller.wantedDirection = [];
        caller.restartGame();
      }
    });
    this.canvas.addEventListener('keyup', e => {
      e.preventDefault();
      e.stopPropagation();
      switch (e.key) {
      case 'ArrowUp':
        caller.keysPressed.up = 0;
        caller.keyOrder = caller.keyOrder.filter(i => i !== 'up');
        break;
      case 'ArrowDown':
        caller.keysPressed.down = 0;
        caller.keyOrder = caller.keyOrder.filter(i => i !== 'down');
        break;
      case 'ArrowLeft':
        caller.keysPressed.left = 0;
        caller.keyOrder = caller.keyOrder.filter(i => i !== 'left');
        break;
      case 'ArrowRight':
        caller.keysPressed.right = 0;
        caller.keyOrder = caller.keyOrder.filter(i => i !== 'right');
        break;
      }
    });
  }

  addToMovementList(direction) {
    if (this.wantedDirection.length < 2) {
      this.wantedDirection.push(direction);
    }
  }

  drawStartScreenSnake(snakeObject) {
    this.context.beginPath();
    this.clearCanvas();
    for (let i = 0; i < snakeObject.length; i++) {
      const pos = snakeObject[i];
      this.createSnakePixel(pos.x, pos.y);
    }
  }

  gameLoop(caller)
  {
    caller.context.beginPath();
    caller.clearCanvas();
    if (!caller.gameStarted) {
      if (caller.startAnimationCounter > 6) {
        caller.snakeFrame = caller.snakeFrame === 0 ? 1 : 0;
        caller.startAnimationCounter = 0;
      }
      caller.drawStartScreenSnake(
        caller.snakeFrame === 0
          ? caller.startScreenSnakeOne
          : caller.startScreenSnakeTwo
      );
      caller.startAnimationCounter++;
      caller.drawText('Press right arrow to start', 0, 1);
      return;
    }
    caller.context.fillStyle = '#000000';
    caller.context.rect(caller.multiplyPixel(caller.edges.z), caller.multiplyPixel(caller.edges.x), caller.multiplyPixel(caller.edges.y), caller.multiplyPixel(caller.edges.w));
    if (caller.gameEnded) {
      caller.drawText(`Game over, points: ${caller.points}`, 0, 2);
      if (caller.deathAnimationIterator > caller.deathAnimationCounter) {
        caller.drawText(`Press right arrow to restart`, 0, 4);
      }
      caller.deathAnimation();
      caller.context.stroke();
      return;
    }

    if (!caller.apple) {
      caller.createApple();
    }
    caller.drawApple();

    if (caller.snake.grow) {
      caller.snake.addPixel = true;
      caller.snake.grow = false;
    }
    caller.moveSnake();

    caller.drawSnake();
    caller.drawText(`${caller.points}`, 0, 4);
    caller.context.stroke();
    if (caller.gameEnded) {
      return;
    }
    caller.moved = false;
  }

  deathAnimation()
  {
    if (this.deathAnimationIterator % this.deathAnimationInterval === 0) {
      this.showSnake = !this.showSnake;
    }
    if (this.showSnake) {
      this.drawSnake();
    }
    this.deathAnimationIterator++;
    if (this.deathAnimationIterator >= 90) {
      this.deathAnimationIterator = 60;
    }
  }

  clearCanvas()
  {
    this.context.fillStyle = '#739900';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  restartGame()
  {
    this.clearCanvas();
    // Set the starting location and length of the snek
    this.startPositions = [
      {x: this.startPosition.x, y: this.startPosition.y},
      {x: this.startPosition.x - 1, y: this.startPosition.y},
      {x: this.startPosition.x - 2, y: this.startPosition.y},
      {x: this.startPosition.x - 3, y: this.startPosition.y},
      {x: this.startPosition.x - 4, y: this.startPosition.y},
      {x: this.startPosition.x - 5, y: this.startPosition.y}
    ];
    // The snake moves to right from start
    this.direction = {
      x: 1,
      y: 0,
    };
    this.snake.body = this.startPositions;
    delete this.apple;
    this.gameEnded = false;
    this.gameStarted = false;
    this.moved = false;
    this.deathAnimationCounter = 8;
    this.deathAnimationInterval = 3;
    this.deathAnimationIterator = 0;
    this.showSnake = true;
  }

  createApple()
  {
    // Gather all the positions for apples
    const positions = [];
    this.context.fillStyle = '#000000';
    for (let i = this.edges.x + 1; i < this.edges.w; i++) {
      for (let j = this.edges.z + 1; j < this.edges.y; j++) {
        if (!this.snake.body.some(pos => pos.y === i && pos.x === j)) {
          positions.push({x: j, y: i});
        }
      }
    }
    const random = this.getRandomInt(0, positions.length)
    this.apple = positions[random];
  }

  drawApple()
  {
    this.context.rect(this.multiplyPixel(this.apple.x), this.multiplyPixel(this.apple.y), this.multiplyPixel(1), this.multiplyPixel(1));
  }

  getRandomInt(min, max) {
    let m = Math.ceil(min);
    let x = Math.floor(max);
    return Math.floor(Math.random() * (x - m) + m); // The maximum is exclusive and the minimum is inclusive
  }

  checkMovement() {
    for (let i = 0; i < this.keyOrder.length; i++) {
      if (this.keysPressed[this.keyOrder[i]] === 1) {

        const result = Object.assign({}, this.keyDirections[this.keyOrder[i]]);
        this.keysPressed[this.keyOrder[i]] = 0;
        if (this.direction.x === 0 && result.x === 0) {
          return this.direction;
        } else if (this.direction.y === 0 && result.y === 0) {
          return this.direction;
        }
        return result;
      }
    }
    return this.direction;
  }
  
  moveSnake()
  {
    if (this.keyOrder.length > 0) {
      this.direction = this.checkMovement();
    }
    const head = Object.assign({}, this.snake.body[0]);
    head.x += this.direction.x;
    head.y += this.direction.y;
    let removed = undefined;
    if (!this.snake.addPixel) {
      removed = this.snake.body.pop();
    }
    let dead = this.snake.body.find(pos => pos.x === head.x && pos.y === head.y);
    if (head.x < this.edges.z || head.x >= this.edges.y + this.edges.z) {
      dead = true;
    }
    if (head.y < this.edges.x || head.y >= this.edges.w + this.edges.x) {
      dead = true;
    }
    if (dead) {
      this.gameEnded = true;
      if (removed) {
        this.snake.body.push(removed)
      }
      return;
    }

    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.snake.grow = true;
      this.points += 9;
      delete this.apple;
    }
    this.snake.body.unshift(head);
    this.snake.addPixel = false;
  }

  drawSnake()
  {
    for (let i = 0; i < this.snake.body.length; i++) {
      const pos = this.snake.body[i];
      this.createSnakePixel(pos.x, pos.y);
    }
  }
  drawText(text, x, y, font) {
    this.context.fillStyle = '#000000';
    if (font) {
      this.context.font = font;
    } else {
      this.context.font = '18px serif';
    }
    this.context.fillText(text, this.multiplyPixel(x), this.multiplyPixel(y));
  }
  createSnakePixel(x, y) {
    this.context.fillStyle = '#000000';
    this.context.fillRect(this.multiplyPixel(x), this.multiplyPixel(y), this.multiplyPixel(1), this.multiplyPixel(1));
  }

  multiplyPixel(pixel) {
    return pixel * this.pixelMultiplier;
  }
}

// Use <snake-game> html element
customElements.define('finna-snake', Snake);