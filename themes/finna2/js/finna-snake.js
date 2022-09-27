class Snake extends HTMLElement {
  constructor()
  {
    super();
    this.screenWidth = 84; //84
    this.screenHeight = 48; //48
    this.pixelMultiplier = 5;
    this.startPosition = {
      x: this.screenWidth / 2,
      y: this.screenHeight / 2
    };

    this.snake = {
      body: [
        {x: this.startPosition.x, y: this.startPosition.y},
        {x: this.startPosition.x - 1, y: this.startPosition.y},
        {x: this.startPosition.x - 2, y: this.startPosition.y},
        {x: this.startPosition.x - 3, y: this.startPosition.y},
        {x: this.startPosition.x - 4, y: this.startPosition.y},
        {x: this.startPosition.x - 5, y: this.startPosition.y}
      ],
    };
    this.direction = {
      x: 1,
      y: 0,
    }
  }

  connectedCallback()
  {
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
    this.drawText('PRESS RIGHT ARROW KEY TO START', 4, 24);

    setInterval(this.gameLoop, 200, this);
  }

  setEvents()
  {
    const caller = this;
    window.addEventListener("keydown", function preventScroll(e) {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.key) > -1) {
        e.preventDefault();
      }
    }, false);
    this.canvas.addEventListener('keyup', e => {
      e.preventDefault();
      e.stopPropagation();
      if (caller.moved) {
        return;
      }
      switch (e.key) {
      case 'ArrowUp':
        if (caller.direction.y !== 1) {
          caller.moved = true;
          caller.direction = {x: 0, y: -1};
        }
        break;
      case 'ArrowDown':
        if (caller.direction.y !== -1) {
          caller.moved = true;
          caller.direction = {x: 0, y: 1};
        }
        break;
      case 'ArrowLeft':
        if (caller.direction.x !== 1) {
          caller.moved = true;
          caller.direction = {x: -1, y: 0};
        }
        break;
      case 'ArrowRight':
        if (!caller.gameStarted) {
          caller.gameStarted = true;
        }
        if (caller.direction.x !== -1) {
          caller.moved = true;
          caller.direction = {x: 1, y: 0};
        }
        break;
      }
    });
  }

  gameLoop(caller)
  {
    if (!caller.gameStarted) {
      return;
    }
    if (caller.gameEnded) {
      return;
    }
    caller.context.beginPath();
    caller.context.fillStyle = '#739900';
    caller.context.fillRect(0, 0, caller.canvas.width, caller.canvas.height);
    caller.context.fillStyle = '#000000';
    if (!caller.apple) {
      caller.createApple();
    }
    caller.drawApple();
    caller.context.rect(caller.multiplyPixel(caller.edges.z), caller.multiplyPixel(caller.edges.x), caller.multiplyPixel(caller.edges.y), caller.multiplyPixel(caller.edges.w));
    if (caller.snake.grow) {
      caller.snake.addPixel = true;
      caller.snake.grow = false;
    }
    caller.moveSnake(caller.direction);
    if (caller.gameEnded) {
      return;
    }
    caller.drawSnake();
    caller.drawText('00000', 0, 4);
    caller.context.stroke();
    caller.moved = false;
  }

  createApple()
  {
    this.apple = {
      x: this.getRandomInt(this.edges.x + 1, this.edges.y),
      y: this.getRandomInt(this.edges.z + 1, this.edges.w)
    };
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
  

  moveSnake(direction)
  {
    if (!this.snake.addPixel) {
      this.snake.body.pop();
    }
    const head = Object.assign({}, this.snake.body[0]);
    head.x += direction.x;
    head.y += direction.y;
    let dead = this.snake.body.find(pos => pos.x === head.x && pos.y === head.y);
    if (head.x < this.edges.z || head.x >= this.edges.y + head.x) {
      dead = true;
    }
    if (head.y < this.edges.x || head.y >= this.edges.w + this.edges.x) {
      dead = true;
    }
    if (dead) {
      this.gameEnded = true;
      this.drawText('GAME OVER!', 4, 24);
    }
    if (head.x === this.apple.x && head.y === this.apple.y) {
      this.snake.grow = true;
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

customElements.define('finna-snake', Snake);