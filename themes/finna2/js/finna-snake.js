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
    this.settings = [
      {
        uuid: 1,
        pixelwidth: 10,
        pixelheight: 10,
        pixelMultiplier: 10
      }
    ];
    this.pixelMultiplier = 15;

    this.direction = {
      x: 1,
      y: 0,
    };
    this.points = 0;
    this.deathAnimationCounter = 40;
    this.deathAnimationInterval = 3;
    this.deathAnimationIterator = 0;
    this.showSnake = true;
  }

  connectedCallback()
  {
    this.screenWidth = this.pixelwidth; //84
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
        if (caller.direction.y !== 1) {
          caller.moved = true;
          caller.wantedDirection = {x: 0, y: -1};
        }
        break;
      case 'ArrowDown':
        if (caller.direction.y !== -1) {
          caller.moved = true;
          caller.wantedDirection = {x: 0, y: 1};
        }
        break;
      case 'ArrowLeft':
        if (caller.direction.x !== 1) {
          caller.moved = true;
          caller.wantedDirection = {x: -1, y: 0};
        }
        break;
      case 'ArrowRight':
        if (!caller.gameStarted) {
          caller.gameStarted = true;
          caller.points = 0;
        }
        if (caller.direction.x !== -1) {
          caller.moved = true;
          caller.wantedDirection = {x: 1, y: 0};
        }
        break;
      }
      if (caller.gameEnded && caller.deathAnimationIterator > caller.deathAnimationCounter) {
        caller.restartGame();
      }
    });
  }

  gameLoop(caller)
  {
    caller.context.beginPath();
    caller.clearCanvas();
    if (!caller.gameStarted) {
      caller.drawText('Press right arrow to start', 0, 2);
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
    this.startPositions = [
      {x: this.startPosition.x, y: this.startPosition.y},
      {x: this.startPosition.x - 1, y: this.startPosition.y},
      {x: this.startPosition.x - 2, y: this.startPosition.y},
      {x: this.startPosition.x - 3, y: this.startPosition.y},
      {x: this.startPosition.x - 4, y: this.startPosition.y},
      {x: this.startPosition.x - 5, y: this.startPosition.y}
    ];
    this.direction = {
      x: 1,
      y: 0,
    };
    this.snake.body = this.startPositions;
    delete this.apple;
    this.gameEnded = false;
    this.gameStarted = false;
    this.moved = false;
    this.deathAnimationCounter = 40;
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
  

  moveSnake()
  {
    this.direction = Object.assign({}, this.wantedDirection);
    const head = Object.assign({}, this.snake.body[0]);
    head.x += this.direction.x;
    head.y += this.direction.y;
    let dead = this.snake.body.find(pos => pos.x === head.x && pos.y === head.y);
    if (head.x < this.edges.z || head.x >= this.edges.y + this.edges.z) {
      dead = true;
    }
    if (head.y < this.edges.x || head.y >= this.edges.w + this.edges.x) {
      dead = true;
    }
    if (dead) {
      this.gameEnded = true;
      return;
    }
    if (!this.snake.addPixel) {
      this.snake.body.pop();
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