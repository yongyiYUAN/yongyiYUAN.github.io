const flowers = [];
const drops = [];
let ship;
let halfHeight;
let generateFlowers = true;
let gameIsOver = false;
let score = 0;
let highScore = 0;  
let bgImg, flowerImg, shipImg, dropImg, gameOverImg, restartBtnImg, bgMusic, restartBtn;

function preload() {
  flowerImg = loadImage('1.png');
  shipImg = loadImage('2.png');
  dropImg = loadImage('3.png');
  bgImg = loadImage('background.jpg');
  gameOverImg = loadImage('gameover.png');
  restartBtnImg = loadImage('4.png');
  bgMusic = loadSound('72.mp3');
}

function setup() {
  createCanvas(640, 1008);
  bgMusic.play();
  ship = new Ship();
  halfHeight = height / 2;

  restartBtn = createImg('4.png', 'restart button');
  restartBtn.size(220, 50);
  restartBtn.position(width / 2 - 115, height / 2 + 180);
  restartBtn.mousePressed(restartGame);
  restartBtn.hide();

  //初始flower
  for (let i = 0; i < 8; i++) {
    const x = random(30, width - 30);
    const y = random(30, halfHeight);
    flowers.push(new Flower(x, y));
  }
   
  //5秒一组新flower
  setInterval(generateNewFlowers, 12000);
}


class Ship {
  constructor() {
    this.x = width / 2;
    this.xdir = 0;
    this.img = shipImg;
  }

  show() {
    imageMode(CENTER);
    image(this.img, this.x, height - 60, 100, 100);
  }

  setDir(dir) {
    this.xdir = dir;
  }

  move() {
    this.x += this.xdir;
  }
}

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 80; // 原始半径
    this.img = flowerImg;
    this.xdir = 1;
    this.hitCount = 0;
    // 计算图片的宽高比
    this.aspectRatio = this.img.width / this.img.height;
  }

  grow() {
    this.r += 40;
    if (this.r >= 160) {
      score += 1;
      return true;
    }
    return false;
  }

  show() {
    imageMode(CENTER);
    // 根据宽高比计算宽度和高度
    let width = this.r * 2 * this.aspectRatio;
    let height = this.r * 2;
    image(this.img, this.x, this.y, width, height);
  }

  move() {
    this.x += this.xdir * 2;
  }

  shiftDown() {
    this.xdir *= -1;
    this.y += 20;
  }
}

class Drop {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = 15;
    this.img = dropImg;
  }

  show() {
    imageMode(CENTER);
    image(this.img, this.x, this.y, this.r * 4, this.r * 4);
  }

  hits(flower) {
    var d = dist(this.x, this.y, flower.x, flower.y);
    return d < this.r + flower.r;
  }

  move() {
    this.y -= 5;
  }
}

function draw() {
  clear();
  // 背景
  imageMode(CENTER);
  image(bgImg, width / 2, height / 2, width, height);
  imageMode(CORNER);

  // 游戏中
  if (!gameIsOver) {
    for (let i = drops.length - 1; i >= 0; i--) {
      drops[i].show();
      drops[i].move();
      if (drops[i].y < 0) {
        drops.splice(i, 1);
      }
    }

    ship.show();
    ship.move();

    for (let i = 0; i < flowers.length; i++) {
      flowers[i].show();
      flowers[i].move();
    }

    for (let i = drops.length - 1; i >= 0; i--) {
      for (let j = flowers.length - 1; j >= 0; j--) {
        if (drops[i] && drops[i].hits(flowers[j])) {
          if (flowers[j].grow()) {
            flowers.splice(j, 1);
          }
          drops.splice(i, 1);
          break;
        }
      }
    }

    // 显示和更新花朵
    for (let i = 0; i < flowers.length; i++) {
      flowers[i].show();
      flowers[i].move();
    }

    // 检查是否有花朵到达边缘，并作出相应的处理
    var edge = false;
    for (var i = 0; i < flowers.length; i++) {
      if (flowers[i].x > width || flowers[i].x < 0) {
        edge = true;
      }
    }
    if (edge) {
      for (var i = 0; i < flowers.length; i++) {
        flowers[i].shiftDown();
      }
    }

    // 检查是否需要生成新的花朵
    if (flowers.length > 0 && flowers.every(flower => flower.y >= height / 2)) {
      generateNewFlowers();
    }

    // 检查游戏结束条件
    if (flowers.some(flower => flower.y >= height)) {
      gameIsOver = true;
      bgMusic.stop();  // 游戏结束时停止音乐
    }
    
    // 分数的背景
    fill('#11dd41');
    noStroke();
    rectMode(CORNER);
    rect(width - 120, 5, 117, 50, 8);
    // 显示分数
    textSize(16);
    fill(255); 
    textAlign(RIGHT, TOP);
    text("Score: " + score, width - 10, 10);
    text("High Score: " + highScore, width - 10, 30); 
  } else {
    imageMode(CENTER);
    let gameOverWidth = width * 0.8;
    let gameOverHeight = (gameOverImg.height / gameOverImg.width) * gameOverWidth;
    image(gameOverImg, width / 2, height / 2.5, gameOverWidth, gameOverHeight);
    restartBtn.show();
  }
}



function keyReleased() {
  ship.setDir(0);
}

function keyPressed() {
  if (key === ' ') {
    drops.push(new Drop(ship.x, height));
  }

  if (keyCode === RIGHT_ARROW) {
    ship.setDir(5);
  } else if (keyCode === LEFT_ARROW) {
    ship.setDir(-5);
  }
}

function generateNewFlowers() {
  if (generateFlowers) {
    for (let i = 0; i < 8; i++) {
      let x = random(30, width - 30);
      let y = random(30, halfHeight);
      flowers.push(new Flower(x, y));
    }
  }
}
function restartGame() {
  // 停止背景音乐并从头开始播放
  bgMusic.stop();
  bgMusic.loop();
  
  // 如果当前分数超过最高分，更新最高分
  if (score > highScore) {
    highScore = score;
  }
  
  // 重新初始化游戏状态
  flowers.length = 0;
  drops.length = 0;
  score = 0;
  gameIsOver = false;
  ship = new Ship();  // 重新创建ship对象，确保其位置和状态被重置

  // 生成初始的花朵
  for (let i = 0; i < 8; i++) {
    const x = random(30, width - 30);
    const y = random(30, halfHeight);
    flowers.push(new Flower(x, y));
  }

  // 隐藏重新开始按钮
  restartBtn.hide();
}
