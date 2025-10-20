// --- 圓的設定 ---
let circles = [];
const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
const NUM_CIRCLES = 20;

// --- 音效設定 ---
let popSound;
let userHasClicked = false; // 用於追蹤使用者是否已互動

// --- 爆破粒子 ---
let particles = [];

// --- 分數設定 ---
let score = 0;

function preload() {
  soundFormats('mp3', 'wav'); 
  popSound = loadSound('pop.mp3'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  textAlign(CENTER, CENTER);
  textSize(20);
  fill(0);
  text("請點擊畫面開始並啟用音效", width / 2, height / 2);

  // 初始化圓
  circles = [];
  for (let i = 0; i < NUM_CIRCLES; i++) {
    // 1. 儲存原始的 hex 顏色
    let hexColor = random(COLORS);
    circles.push({
      x: random(width),
      y: random(height),
      r: random(50, 200),
      color: color(hexColor), // p5.js 的 color 物件
      hex: hexColor,          // 儲存原始 hex 字串用於比較
      alpha: random(80, 255),
      speed: random(1, 5),
      isExploding: false
    });
  }
}

function mousePressed() {
  // 2. 處理第一次點擊以啟用音效
  if (!userHasClicked) {
    userStartAudio(); 
    userHasClicked = true;
    return; // 第一次點擊只啟用音效，不觸發爆破
  }

  // 3. 檢查是否點擊到氣球 (從後往前檢查，才能正確移除上層的)
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];
    
    // 檢查點擊位置是否在圓的半徑內 (c.r 是直徑)
    let distance = dist(mouseX, mouseY, c.x, c.y);
    if (distance < c.r / 2) {
      
      // 4. 檢查顏色並計分
      if (c.hex === '#ffca3a') {
        score++; // 黃色加分
      } else {
        score--; // 其他顏色扣分
      }

      // 5. 觸發爆破並移除
      explode(c);
      circles.splice(i, 1);
      
      // 6. 點擊到一個就跳出迴圈 (防止一次點擊穿透多個氣球)
      break; 
    }
  }
}

function draw() {
  if (!userHasClicked) {
    background('#fcf6bd');
    textAlign(CENTER, CENTER);
    textSize(20);
    fill(0);
    text("請點擊畫面開始並啟用音效", width / 2, height / 2);
    return; 
  }

  background('#fcf6bd');
  noStroke();

  // 繪製並更新圓形
  for (let i = circles.length - 1; i >= 0; i--) {
    let c = circles[i];

    if (!c.isExploding) {
      c.y -= c.speed;

      // 7. 移除隨機爆破的
      // if (random(1) < 0.005) { ... } // <- 這段已刪除

      if (c.y + c.r / 2 < 0) {
        c.y = height + c.r / 2;
        c.x = random(width);
        c.r = random(50, 200);
        let hexColor = random(COLORS); // 8. 補充新圓時也要儲存 hex
        c.color = color(hexColor);
        c.hex = hexColor;
        c.alpha = random(80, 255);
        c.speed = random(1, 5);
        c.isExploding = false;
      }

      c.color.setAlpha(c.alpha);
      fill(c.color);
      circle(c.x, c.y, c.r);

      // 方塊 (保持不變)
      let squareSize = c.r / 6;
      let angle = -PI / 4;
      let distance = c.r / 2 * 0.65;
      let squareCenterX = c.x + cos(angle) * distance;
      let squareCenterY = c.y + sin(angle) * distance;
      fill(255, 255, 255, 120);
      noStroke();
      rectMode(CENTER);
      rect(squareCenterX, squareCenterY, squareSize, squareSize);
    }
  }

  // 更新和繪製爆破粒子 (保持不變)
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 5;

    if (p.alpha > 0) {
      fill(p.color.levels[0], p.color.levels[1], p.color.levels[2], p.alpha);
      circle(p.x, p.y, p.r);
    } else {
      particles.splice(i, 1);
    }
  }

  // 補充新圓形 (保持不變，但內部邏輯在上面第8點已修改)
  while (circles.length < NUM_CIRCLES) {
    let hexColor = random(COLORS); // 8. 補充新圓時也要儲存 hex
    circles.push({
      x: random(width),
      y: height + random(50, 200),
      r: random(50, 200),
      color: color(hexColor),
      hex: hexColor,
      alpha: random(80, 255),
      speed: random(1, 5),
      isExploding: false
    });
  }
  
  // 9. 繪製 UI 文字 (放在 draw 的最後，確保在最上層)
  push(); // 儲存當前的繪圖設定
  fill('#eb6424');
  textSize(32);
  
  // 左上角文字
  textAlign(LEFT, TOP);
  text("學號為1234567", 10, 10); // 留 10px 邊距
  
  // 右上角分數
  textAlign(RIGHT, TOP);
  text("得分: " + score, width - 10, 10); // 留 10px 邊距
  
  pop(); // 恢復之前的繪圖設定
}

// 爆破函數 (保持不變)
function explode(circleToExplode) {
  if (popSound.isLoaded()) {
    popSound.play();
  }

  let numParticles = floor(random(10, 20));
  for (let i = 0; i < numParticles; i++) {
    let angle = random(TWO_PI);
    let speed = random(1, 5);
    let particleSize = random(5, 15);

    particles.push({
      x: circleToExplode.x,
      y: circleToExplode.y,
      r: particleSize,
      color: circleToExplode.color,
      alpha: 255,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed - 1
    });
  }
}

// 視窗調整 (保持不變)
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (!userHasClicked) {
    background('#fcf6bd');
    textAlign(CENTER, CENTER);
    textSize(20);
    fill(0);
    text("請點擊畫面開始並啟用音效", width / 2, height / 2);
  }
}