let dirtyClothesImg, cleanClothesImg, soapImg, backgroundImage, xImg, xxImg;
let dirtyPinkClothesImg, cleanPinkClothesImg; 
let restartImg;
let clothes = [];
let soap;
let canvasWidth = 1030; // 新的画布宽度
let canvasHeight = 640; // 新的画布高度
let gameStarted = false;
let score = 0;
let isDragging = false;
let mistakeCount = 0;
let highScore = 0;
let titleImg, startImg;
let myFont;
let bubbleImg;
let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies;
let engine;
let world;
let bubbles = [];
let mouseBody;
let bgMusic; 

function preload() {
  dirtyClothesImg = loadImage('1.png');
  cleanClothesImg = loadImage('2.png');
  dirtyPinkClothesImg = loadImage('3.png');
  cleanPinkClothesImg = loadImage('4.png');
  soapImg = loadImage('5.png');
  backgroundImage = loadImage('background.jpg');
  xImg = loadImage('X.png');
  xxImg = loadImage('XX.png');
  gameoverImg = loadImage('gameover.png');
  titleImg = loadImage('title.png');
  startImg = loadImage('start.png');
  restartImg = loadImage('onceagain.png');
  myFont = loadFont('FangyuancuyuanJ.ttf');
  bubbleImg = loadImage('0.png'); // 加载泡泡图片
  bgMusic = loadSound('1.mp3'); // 加载背景音乐文件
}

function setup() {
  createCanvas(canvasWidth, canvasHeight); // 使用新的画布尺寸创建画布
  textFont(myFont);
  frameRate(60);
  soap = new Soap(soapImg);
  engine = Engine.create();
  world = engine.world;
  
  let mouseOptions = {
    isStatic: true
  };
  mouseBody = Bodies.circle(0, 0, 10, mouseOptions);
  World.add(world, mouseBody);
}



function draw() {
  Engine.update(engine);
  image(backgroundImage, 0, 0, width, height);

if (mistakeCount === 3) {
  // 调整 gameoverImg 的位置
  let gameOverX = (width - gameoverImg.width / 2) / 2; // 居中显示
  let gameOverY = 120; // 设置新的 Y 坐标

  image(gameoverImg, gameOverX, gameOverY, gameoverImg.width / 1.8, gameoverImg.height / 1.8);

  checkHighScore();
  displayFinalScore();

  // 重新开始按钮
  let restartScaleFactor = 0.7; // 将按钮缩小到原来的 70%
  let restartNewWidth = restartImg.width * restartScaleFactor;
  let restartNewHeight = restartImg.height * restartScaleFactor;

  // 调整 restartImg 的位置
  let restartX = (width - restartNewWidth) / 2; // 居中显示
  let restartY = gameOverY + gameoverImg.height / 2 + 140; // 设置新的 Y 坐标，相对于 gameoverImg 下面

  image(restartImg, restartX, restartY, restartNewWidth, restartNewHeight);
  return;
}


  if (!gameStarted) {
    let scaleFactor = 0.6; // 缩放因子
    let newWidth = titleImg.width * scaleFactor;
    let newHeight = titleImg.height * scaleFactor;
    image(titleImg, width/2 - titleImg.width / 3.4, 25, newWidth, newHeight);
    let startScaleFactor = 0.7; // startImg 的缩放因子
    let startNewWidth = startImg.width * startScaleFactor;
    let startNewHeight = startImg.height * startScaleFactor;
    image(startImg, 750, 380, startNewWidth, startNewHeight); 
  }

  if (!gameStarted && isDragging && soap.touchesStartButton(600, 230, startImg.width, startImg.height)) {
    startGame();
  }

  if (gameStarted) {
    gameLogic();
  }

  soap.move(mouseX, mouseY);
  soap.display();
  
  // 更新鼠标物理体位置
  Matter.Body.setPosition(mouseBody, { x: mouseX, y: mouseY });
}

function gameLogic() {
  if (frameCount % 60 == 0) {
    addDirtyCloth();
  }

  if (isDragging) {
    for (let i = clothes.length - 1; i >= 0; i--) {
      if (soap.touches(clothes[i]) && clothes[i].isDirty) {
        clothes[i].clean(); // 这里已经包含了得分逻辑，不需要额外增加得分
      }
    }
  }

  for (let i = clothes.length - 1; i >= 0; i--) {
    clothes[i].move();
    clothes[i].display();

    if (clothes[i].y > height && clothes[i].isDirty) {
      clothes[i].isDirty = false;
      mistakeCount = Math.min(mistakeCount + 1, 3);
    }
  }

  displayScore();
  displayMistakes();

  //肥皂影响泡泡
  Matter.Body.setPosition(mouseBody, { x: mouseX, y: mouseY });
}

function startGame() {
  gameStarted = true;
  bgMusic.play(); // 开始游戏时播放音乐
}

function addDirtyCloth() {
  let x = random(50, width - 50);
  let y = -50;
  if (random() < 0.2) { // 粉色衣服出现的概率是20%
    clothes.push(new Cloth(x, y, dirtyPinkClothesImg, cleanPinkClothesImg, 2)); // 粉色衣服加2分
  } else {
    clothes.push(new Cloth(x, y, dirtyClothesImg, cleanClothesImg, 1)); // 绿色衣服加1分
  }
}


function displayScore() {
  image(cleanClothesImg, 50, 25, 50, 50); // 显示 cleanClothesImg 图像作为分数图标
  let c = color(53, 181, 172); // 使用 RGB 值替代十六进制颜色 #35b5ac
  fill(c); // 使用转换后的颜色
  textSize(30);
  text(score, 120, 33); 
  textAlign(LEFT, TOP); // 确保文本对齐方式固定
  text('最高得分：' + highScore, 50, 85); // 显示最高得分
}

function displayMistakes() {
  for (let i = 0; i < 3; i++) {
    let img = (i < mistakeCount) ? xxImg : xImg;
    let xPosition = width - (3 - i) * 50 - 35; // 新的X坐标，调整到距离右边缘*像素
    let yPosition = 20; // Y坐标位置保持不变，如果需要可以调整
    image(img, xPosition, yPosition, 40, 40); // 显示在屏幕右上角
  }
}


function displayFinalScore() {
  bgMusic.stop(); // 游戏结束时停止音乐
  textSize(30); // 设置文本大小
  let c = color(206, 106, 134); // 使用 RGB 值替代十六进制颜色 #ce6a86
  fill(c); // 使用转换后的颜色
  textAlign(CENTER, CENTER); // 设置文本对齐方式为居中
  text("本局得分：" + score, width / 2, 320 ); // 在 gameover 图像下方显示得分
  text("最高得分：" + highScore, width / 2, 360); // 显示最高得分
}

function checkHighScore() {
  if (score > highScore) {
    highScore = score;
  }
}

function mouseDragged() {
  isDragging = true;
}

function mouseReleased() {
  isDragging = false;
  // 检查是否鼠标在按钮区域内，并且游戏未开始
  if (!gameStarted && soap.touchesStartButton(750, 380, startImg.width * 0.7, startImg.height * 0.7)) {
    startGame();
  }
}

class Cloth {
  constructor(x, y, dirtyImg, cleanImg, scoreValue, scale = 1) {
    this.x = x;
    this.y = y;
    this.dirtyImg = dirtyImg;
    this.cleanImg = cleanImg;
    this.img = dirtyImg; // 初始时衣服是脏的
    this.scoreValue = scoreValue; // 衣服的得分值
    this.speed = 2;
    this.isDirty = true;
    this.scale = 0.2; // 添加缩放因子
  }

  move() {
    this.y += this.speed;
  }

  display() {
    let displayWidth = this.dirtyImg.width * this.scale;
    let displayHeight = this.dirtyImg.height * this.scale;
    image(this.img, this.x, this.y, displayWidth, displayHeight);
  }

  clean() {
    if (this.isDirty) {
      this.img = this.cleanImg; // 清洁后更新为对应的干净衣服图像
      this.isDirty = false;
      score += this.scoreValue; // 根据衣服类型增加得分
    }
  }
}

class Soap {
  constructor(img) {
    this.x = 0;
    this.y = 0;
    this.img = img;
    this.scale = 0.04; // 设置缩放比例
    this.bubbles = []; // 用于存放泡泡的数组
  }

  move(x, y) {
    // 将肥皂的坐标设置为鼠标位置减去肥皂的一半宽度和高度
    this.x = x - (this.img.width * this.scale) / 2;
    this.y = y - (this.img.height * this.scale) / 2;

    // 当肥皂移动时生成泡泡
    if (isDragging) {
      this.addBubble();
    }
  }

  // 新方法：在肥皂周围添加泡泡
  addBubble() {
    let bubbleX = this.x + (this.img.width * this.scale) / 2 + random(-20, 20);
    let bubbleY = this.y + (this.img.height * this.scale) / 2 + random(-20, 20);
    this.bubbles.push(new Bubble(bubbleX, bubbleY, bubbleImg));
  }

  display() {
    // 首先显示所有泡泡
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      this.bubbles[i].display();

      // 如果泡泡移出画布，则从数组中移除
      if (this.bubbles[i].y < -50) {
        this.bubbles.splice(i, 1);
      }
    }

    // 然后显示肥皂图像
    push(); // 开始新的绘图状态
    translate(this.x + (this.img.width * this.scale) / 2, this.y + (this.img.height * this.scale) / 2); // 移动到图像中心
    rotate(radians(-10)); // 向左旋转10度
    image(this.img, -(this.img.width * this.scale) / 2, -(this.img.height * this.scale) / 2, this.img.width * this.scale, this.img.height * this.scale); // 画图像
    pop(); // 恢复原始绘图状态
  }

  touches(cloth) {
    let soapRadius = (this.img.width * this.scale) / 2; // 肥皂的半径
    let clothRadius = (cloth.dirtyImg.width * cloth.scale) / 2; // 衣服的半径
    let d = dist(this.x + soapRadius, this.y + soapRadius, cloth.x + clothRadius, cloth.y + clothRadius); // 中心点的距离
    return d < soapRadius + clothRadius;
  }

  touchesStartButton(x, y, w, h) {
    // 检查肥皂是否接触到一个给定位置和大小的矩形
    let soapWidth = this.img.width * this.scale;
    let soapHeight = this.img.height * this.scale;
    return (
      this.x + soapWidth > x &&
      this.x < x + w &&
      this.y + soapHeight > y &&
      this.y < y + h
    );
  }
}


class Bubble {
    constructor(x, y, img) {
        this.img = img;
        this.scale = random(0.3, 0.8);//随机大小
       
        let options = {
            restitution: 0.5, // 弹性
            frictionAir: 0.07, // 空气阻力
            friction: 0.05,
            density: 0.0001
        };
        
        this.body = Bodies.circle(x, y, img.width * this.scale / 2, options);
        this.body.label = 'Bubble'; // 标记为泡泡
        World.add(world, this.body);
    }

    display() {
        let pos = this.body.position;
        let angle = this.body.angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        imageMode(CENTER);
        image(this.img, 0, 0, this.img.width * this.scale, this.img.height * this.scale);
        pop();
    }
}

function mousePressed() {
  // 计算鼠标位置和肥皂图片的偏移量，使鼠标在图片的正中心
  let soapWidth = soap.img.width * soap.scale;
  let soapHeight = soap.img.height * soap.scale;
  let soapX = mouseX - soapWidth / 2;
  let soapY = mouseY - soapHeight / 2;

  // 输出鼠标点击的坐标
  console.log("Mouse X: " + mouseX + ", Mouse Y: " + mouseY);

  // 检查是否点击了按钮区域
  console.log("Start Button X Range: " + (750) + " to " + (750 + startImg.width * 0.7));
  console.log("Start Button Y Range: " + (380) + " to " + (380 + startImg.height * 0.7));

// 检查是否点击了重新开始按钮，并且游戏已经结束
  if (mistakeCount === 3) {
    let restartScaleFactor = 0.7; // 将按钮缩小到原来的 70%
    let restartNewWidth = restartImg.width * restartScaleFactor;
    let restartNewHeight = restartImg.height * restartScaleFactor;

    // 调整 restartImg 的位置
    let restartX = (width - restartNewWidth) / 2; // 居中显示
    let restartY = 120 + gameoverImg.height / 2 + 140; // 设置新的 Y 坐标，相对于 gameoverImg 下面

    if (mouseX > restartX && mouseX < restartX + restartNewWidth && mouseY > restartY && mouseY < restartY + restartNewHeight) {
      resetGame();
    }
  }
}


function resetGame() {
  gameStarted = true;
  score = 0;
  mistakeCount = 0;
  clothes = []; // 重置衣服数组

  bgMusic.stop(); // 停止当前播放的音乐
  bgMusic.play(); // 重新开始播放音乐
}
