let maxVirusesToGenerate = 2; // 设置每次最多生成的病毒数量
let startScreenImage, startButtonImage; // 用于保存开始界面和按钮的图片
let startButtonWidth, startButtonHeight; // 用于保存开始按钮的新尺寸
let backgroundImage; // 用于保存背景图片
let gameStarted = false; 
let score = 0; // Initialize score
let virusImages = []; // 用于保存所有病毒的图像
let virusRows = []; // 保存四行病毒的数组
let numRows = 4; // 总共的行数
let maxVirusesPerRow = 5; // 每行最多病毒数
let herbs = []; // 用于保存中药图片的数组
let herbScaleFactor = 0.07; // 中药图片的缩放因子
let fixedVirusSpacing = 27; // （跑道）固定的行间距为*像素
let grid = []; // 保存跑道的数组
let scaleFactor = 0.625; // 病毒的缩放因子
let scaledWidths = [], scaledHeights = []; // 病毒缩放后的宽度和高度
let herbLocations = []; // 用于保存每个药材图片的位置和尺寸
let selectedHerb = null; // 当前选中的药材图片
let placedHerbs = []; // 已放置在跑道上的药材图片
let mouseHerbScaleFactor = herbScaleFactor * 0.8; // 鼠标上的药材图片缩小至原尺寸的80%
let lungImage; 
let lungScaleFactor; // 用于保存 lung 图片的缩放因子
let lungVisible = []; // 每条跑道的 lung 图片是否可见
let gameOver = false; // 添加游戏结束状态变量
let gameOverImage; // 用于保存游戏结束时的图片
let onceAgainButtonImage; // 用于保存重新开始按钮的图片
let onceAgainButtonWidth, onceAgainButtonHeight; // 用于保存重新开始按钮的尺寸
let onceAgainButtonX, onceAgainButtonY; // 用于保存重新开始按钮的位置
let digitalFont; // 用于保存数字字体
let startTime; // 用于保存游戏开始时的时间
let finalTime; // 用于保存游戏结束时的时间
let bgMusic;

function preload() {
    bgMusic = loadSound('2.mp3');
    // 加载字体
    digitalFont = loadFont('DFGB_Y8.ttf');
    // 加载开始界面图片
    startScreenImage = loadImage('startscreen.jpg');

    // 加载开始按钮图片并计算其新尺寸
    startButtonImage = loadImage('start.png', img => {
        // 设定新的宽度
        let targetWidth = 150; // 您希望缩小到的宽度
        let scaleFactor = targetWidth / img.width; // 缩放因子
        startButtonWidth = targetWidth; // 新宽度
        startButtonHeight = img.height * scaleFactor; // 新高度，保持宽高比
    });

    // 加载背景图片
    backgroundImage = loadImage('background.jpg');

    // 加载 lung.png 图片
    lungImage = loadImage('lung.png', img => {
        let targetWidth = 40; // 假设您希望缩小到的宽度为40像素
        lungScaleFactor = targetWidth / img.width;
    });

    // 加载病毒图片和中药图片
    virusImages.push(loadImage('0.png'));
    virusImages.push(loadImage('1.png'));
    virusImages.push(loadImage('2.png'));
    virusImages.push(loadImage('3.png'));
    herbs.push(loadImage('A.jpg'));
    herbs.push(loadImage('B.jpg'));
    herbs.push(loadImage('C.jpg'));
    herbs.push(loadImage('D.jpg'));

    // 加载游戏结束图片
    gameOverImage = loadImage('gameover.jpg');

    // 加载重新开始按钮图片
    onceAgainButtonImage = loadImage('onceagain.png', img => {
        // 根据需要设置按钮尺寸
        onceAgainButtonWidth = 230; // 示例宽度
        onceAgainButtonHeight = img.height * (onceAgainButtonWidth / img.width); // 保持宽高比
    });
}


function setup() {
    createCanvas(1030, 640);
    startTime = millis(); // 初始化开始时间

    // 计算每种病毒缩放后的尺寸
    virusImages.forEach(virusImg => {
        scaledWidths.push(virusImg.width * scaleFactor);
        scaledHeights.push(virusImg.height * scaleFactor);
    });

    // 计算所有病毒行的总高度（包括跑道和行间距）
    let totalVirusHeight = numRows * (max(scaledHeights) + 40) + (numRows - 1) * fixedVirusSpacing;
    let yPos = (height - totalVirusHeight) / 0.55; // 计算起始y坐标
    
    //yPos += 5; // 向下移动跑道，增加 * 像素的偏移量
    
    // 初始化跑道和病毒行
    let trackWidth = 680; // 设定跑道的宽度
    let trackStartX = 280; // 设定跑道的起始x坐标
    for (let i = 0; i < numRows; i++) {
        let trackHeight = max(scaledHeights) + 10;
        grid.push({ x: trackStartX, y: yPos, width: trackWidth, height: trackHeight });
        yPos += trackHeight + fixedVirusSpacing;

        // 为每行病毒初始化一个对象，包含病毒数组和上次生成时间
        virusRows.push({ viruses: [], lastSpawnTime: millis() });

        // 初始化每条跑道的 lung 显示标记为 true（可见）
        lungVisible.push(true);
    }

    // 设置药材图片的位置和尺寸
    let herbYPosition = (height - (herbs.length * herbs[0].height * herbScaleFactor + (herbs.length - 1) * 20)) / 4.3;// 药材整体位置
    for (let i = 0; i < herbs.length; i++) {
        let img = herbs[i];
        let imgScaledWidth = img.width * herbScaleFactor;
        let imgScaledHeight = img.height * herbScaleFactor;
        let herbXPosition = 90; // 把药材放到画面左边，离画布边缘有 * 像素
        herbLocations.push({
            img: img,
            x: herbXPosition,
            y: herbYPosition,
            w: imgScaledWidth,
            h: imgScaledHeight
        });
        herbYPosition += imgScaledHeight + 65; // 药材位置
        
            // 设置重新开始按钮的位置
    onceAgainButtonX = (width - onceAgainButtonWidth) / 1.8; // 计算按钮的水平位置
    onceAgainButtonY = height / 2 + 150; // 计算按钮的垂直位置
    }
}


function draw() {
    if (!gameStarted) {
        image(startScreenImage, 0, 0, width, height);
        let buttonX = (width - startButtonWidth * 1.7) / 2;
        let buttonY = 340;
        image(startButtonImage, buttonX, buttonY, startButtonWidth * 1.7, startButtonHeight * 1.7);
    } else if (gameOver) {
        image(gameOverImage, 0, 0, width, height);

        // 计算重新开始按钮的 X 和 Y 位置，使其水平居中
        let onceAgainButtonX = (width - onceAgainButtonWidth) / 2.06;
        let onceAgainButtonY = height / 2 + 120; // 放置在画布中央的下方

        // 使用计算的尺寸绘制按钮
        image(onceAgainButtonImage, onceAgainButtonX, onceAgainButtonY, onceAgainButtonWidth, onceAgainButtonHeight);

        fill(48, 23, 3);
        textSize(24);
        text(`成绩: ${score}`, width / 2-60, height / 2 + 35);
        text(`时间: ${finalTime}`, width / 2-60, height / 2 + 65);
    } else {
        image(backgroundImage, 0, 0, width, height);

        for (let i = 0; i < numRows; i++) {
            generateNewViruses(i);
        }

        checkVirusPosition(); // 检查病毒位置并移除到达左边的病毒

        grid.forEach((track, index) => {
            if (lungVisible[index]) {
                let lungX = track.x - lungImage.width * lungScaleFactor - 20;
                let lungY = track.y + (track.height - lungImage.height * lungScaleFactor) / 2;
                image(lungImage, lungX, lungY, lungImage.width * lungScaleFactor, lungImage.height * lungScaleFactor);
            }
        });

        for (let i = 0; i < numRows; i++) {
            let track = grid[i];
            noStroke();
            fill(255, 255, 255, 0);
            rect(track.x, track.y, track.width, track.height);

            let viruses = virusRows[i].viruses;
            for (let j = viruses.length - 1; j >= 0; j--) {
                let virus = viruses[j];
                if (frameCount > virus.delay) {
                    let virusImage = virusImages[virus.virusIndex];
                    let scaledWidth = scaledWidths[virus.virusIndex];
                    let scaledHeight = scaledHeights[virus.virusIndex];
                    let virusYPosition = track.y + (track.height - scaledHeight) / 2;
                    virus.x -= virus.speed;
                    image(virusImage, virus.x, virusYPosition, scaledWidth, scaledHeight);
                    virus.x -= virus.speed;
                    image(virusImage, virus.x, virusYPosition, scaledWidth, scaledHeight);
                }
            }
        }

        if (selectedHerb) {
            image(
                selectedHerb,
                mouseX - (selectedHerb.width * mouseHerbScaleFactor) / 2,
                mouseY - (selectedHerb.height * mouseHerbScaleFactor) / 2,
                selectedHerb.width * mouseHerbScaleFactor,
                selectedHerb.height * mouseHerbScaleFactor
            );
        }

        placedHerbs.forEach(herb => {
            image(herb.img, herb.x, herb.y, herb.w, herb.h);
        });

        // 绘制药材图片
        herbLocations.forEach(loc => {
            image(loc.img, loc.x, loc.y, loc.w, loc.h);
        });

        // 计时器 & 分数
        fill(48, 23, 3);
        textSize(30);
        text(`${score}`, 310, 94);

        displayTimer(); // 调用 displayTimer 函数来显示计时器文本
    }
}

function checkGameOver() {
    if (lungVisible.some(v => v === false)) {
        gameOver = true;
        finalTime = ((millis() - startTime) / 1000).toFixed(1); // 计算并保存最终时间
    }
}

function checkVirusPosition() {
    for (let i = 0; i < virusRows.length; i++) {
        let viruses = virusRows[i].viruses;
        for (let j = viruses.length - 1; j >= 0; j--) {
            if (viruses[j].x < grid[i].x) {
                viruses.splice(j, 1);
                lungVisible[i] = false; // 病毒到达左边时，隐藏 lung 图片
                checkGameOver(); // 检查游戏是否结束
                return; // 发现任何一个 lung 消失时立即返回
            }
        }
    }

    for (let i = placedHerbs.length - 1; i >= 0; i--) {
        let herb = placedHerbs[i];
        let row = herb.row;
        let viruses = virusRows[row].viruses;
        for (let j = viruses.length - 1; j >= 0; j--) {
            let virusIndex = viruses[j].virusIndex;
            if (
                herb.x < viruses[j].x &&
                herb.x + herb.w > viruses[j].x &&
                herb.y < grid[row].y + grid[row].height &&
                herb.y + herb.h > grid[row].y &&
                herb.img == herbs[virusIndex] // 只有药材与病毒相匹配时才消灭病毒
            ) {
                viruses.splice(j, 1); // 删除病毒
                placedHerbs.splice(i, 1); // 删除药材
                score++; // 更新分数
                break; // 每次只删除一个病毒
            }
        }
    }
}

function formatTime(milliseconds) {
    let seconds = floor((milliseconds / 1000) % 60); // 将毫秒转换为秒
    let minutes = floor(milliseconds / 60000); // 将毫秒转换为分钟
    return nf(minutes, 2) + ":" + nf(seconds, 2); // 格式化时间显示为 "分:秒" 的格式
}

function mousePressed() {
    if (!gameStarted) {
        let buttonX = (width - startButtonWidth * 1.7) / 2.18;
        let buttonY = 340;
        if (
            mouseX > buttonX &&
            mouseX < buttonX + startButtonWidth * 1.7 &&
            mouseY > buttonY &&
            mouseY < buttonY + startButtonHeight * 1.7
        ) {
            bgMusic.loop(); // 播放音乐
            gameStarted = true;
            startTime = millis();
        }
    } else if (gameOver) {
        let onceAgainButtonX = (width - onceAgainButtonWidth) / 2;
        let onceAgainButtonY = height / 2 + 100;
        if (
            mouseX > onceAgainButtonX &&
            mouseX < onceAgainButtonX + onceAgainButtonWidth &&
            mouseY > onceAgainButtonY &&
            mouseY < onceAgainButtonY + onceAgainButtonHeight
        ) {
            // 重新开始游戏
            gameOver = false;
            gameStarted = true;
            startTime = millis();
            score = 0;
            placedHerbs = [];
            virusRows.forEach(row => row.viruses = []);
            lungVisible = lungVisible.map(() => true); // 重置 lung 可见性
        }
    } else {
        for (let i = 0; i < herbLocations.length; i++) {
            let loc = herbLocations[i];
            if (
                mouseX > loc.x &&
                mouseX < loc.x + loc.w &&
                mouseY > loc.y &&
                mouseY < loc.y + loc.h
            ) {
                selectedHerb = loc.img;
                break;
            }
        }

        if (selectedHerb) {
            for (let i = 0; i < grid.length; i++) {
                let track = grid[i];
                if (
                    mouseX > track.x &&
                    mouseX < track.x + track.width &&
                    mouseY > track.y &&
                    mouseY < track.y + track.height
                ) {
                    let newHerb = {
                        img: selectedHerb,
                        x: mouseX - (selectedHerb.width * herbScaleFactor) / 2,
                        y: track.y + (track.height - selectedHerb.height * herbScaleFactor) / 2,
                        w: selectedHerb.width * herbScaleFactor,
                        h: selectedHerb.height * herbScaleFactor,
                        row: i
                    };
                    placedHerbs.push(newHerb);
                    selectedHerb = null;
                    break;
                }
            }
        }
    }
}


function generateNewViruses(row) {
    let currentTime = millis();
    let timeSinceLastSpawn = currentTime - virusRows[row].lastSpawnTime;

    if (timeSinceLastSpawn >= 7000) { // 调整时间间隔为 ** 秒
        let virusesInRow = virusRows[row].viruses.length;

        if (virusesInRow < maxVirusesPerRow) {
            let virusIndex = floor(random(virusImages.length));
            let speed = random(0.2,0.7);
            let delay = frameCount;
            let virusX = width - 100;
            let newVirus = {
                virusIndex: virusIndex,
                x: virusX,
                speed: speed,
                delay: delay
            };
            virusRows[row].viruses.push(newVirus);

            virusRows[row].lastSpawnTime = currentTime;
        }
    }
}



function displayTimer() {
    let elapsed = millis() - startTime; // 计算经过的时间（毫秒）
    let seconds = floor((elapsed / 1000) % 60); // 将毫秒转换为秒
    let minutes = floor(elapsed / 60000); // 将毫秒转换为分钟

    // 设置字体和大小
    textFont(digitalFont);
    textSize(30);

    // 格式化时间显示为 "分:秒" 的格式
    let timerText = nf(minutes, 2) + ":" + nf(seconds, 2); // 像"00:00"

    // 设置计时器文本的位置
    let timerX = 900; // 距离画布左侧的距离
    let timerY = 94; // 距离画布顶部的距离

    // 显示计时器文本
    fill(48,23,3); // 字体颜色
    text(timerText, timerX, timerY);
}

function resetGame() {
    if (bgMusic.isPlaying()) {
        bgMusic.stop();
    }

    gameStarted = true;
    gameOver = false;
    score = 0;
    virusRows = [];
    for (let i = 0; i < numRows; i++) {
        virusRows.push({ viruses: [], lastSpawnTime: -Infinity });
    }
    placedHerbs = [];
    selectedHerb = null;
    lungVisible = [];
    for (let i = 0; i < numRows; i++) {
        lungVisible.push(true);
    }
    startTime = millis();
    bgMusic.loop();
}
