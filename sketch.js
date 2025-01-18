let music1;
let music2;
let music3;
let bg1;
let bg2;
let bg3;
let cdplayer;
let cd1, cd2, cd3;
let button;
let bgColor;

let currentBg;  // 현재 배경 이미지를 추적할 변수
let buttonWidth = 100;  // 버튼의 너비
let buttonHeight = 50;  // 버튼의 높이
let buttonX = 1000;  // 오른쪽 화살표 버튼의 x 위치
let buttonY = 650;   // 버튼의 y 위치
let player;
let player2;

let numBars = 20;  // 바코드의 막대 개수
let maxHeight = 150;  // 바의 최대 높이
let minHeight = 50;   // 바의 최소 높이
let gap = 10;  // 바 사이의 간격
let fft;
let currentMusic;
let isPlaying = false;
let uiElements;

let isMusicPlayerActive = false;  // MusicPlayer 활성화 여부
let isCdPlayerActive = true;     // Cdplayer 활성화 여부 (초기값 true)
let isUIElementsActive = false;

function preload() {
  music1 = loadSound('m1.mp3');
  music2 = loadSound('m2.mp3');
  music3 = loadSound('m3.mp3');
  cd1 = loadImage('cd1.png');
  cd2 = loadImage('cd2.png');
  cd3 = loadImage('cd3.png');
  cdplayer = loadImage('cdplayer.png');
}

function setup() {
  canvas = createCanvas(1152, 768);
  canvas.position (100, 90);
  currentBg = bg1;  // 시작 배경은 bg1으로 설정
  imageMode(CENTER);
  angleMode(DEGREES);
  player = new Cdplayer(width / 2, height / 2 + 70); // CD 플레이어 객체 생성
  player2 = new MusicPlayer();
  player2.setup();
  fft = new p5.FFT();
  uiElements = new UIElements();
  currentMusic = music1;
  textFont("Montserrat");
  textStyle(BOLD);
  bgColor = color(0, 0, 0);
  

}

function draw() {

  background(bgColor);
  // 배경 변경 버튼 그리기 (우측 하단)
  fill(0,0,0,0);
  rect(width - 200, height - 60, 190, buttonHeight);  // 버튼 배경
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("SWITCH BACKGROUND", buttonX + buttonWidth / 2, height - 35);  // 버튼 텍스트
  
  if (isCdPlayerActive) {
    player.display(); // CD 플레이어와 CD들 그리기
    player.update(); // CD 이동 및 음악 재생 업데이트
  }

  if (isMusicPlayerActive) {
    player2.draw();
  }
  
  if (isUIElementsActive) {
    uiElements.display();
  
  if (isPlaying) {
    fft.analyze();
  }

  }
  
  // 플레이어 스위치 버튼 그리기 (좌측 하단)
  fill(0,0,0,0);
  noStroke();
  rect(10, height - 60, 150, 50);  // 버튼 배경
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  text("SWITCH PLAYER", 85, height - 35);  // 버튼 텍스트
}



// 마우스 클릭 감지
function mousePressed() {
  // 배경 변경 버튼 클릭 시
  if (mouseX > (width - 200) && mouseX < (width - 200 + buttonWidth) && mouseY > (height - 60) && mouseY < (height - 60 + buttonHeight)) {
    changeBackgroundColor();  // 배경을 바꾸기
  }

  // 플레이어 스위치 버튼 클릭 시
  if (mouseX > 10 && mouseX < 160 && mouseY > height - 60 && mouseY < height - 10) {
    switchPlayer();  // 플레이어 전환
  }

  // CD 플레이어 클릭
  if (isCdPlayerActive) {
    player.handleClick(mouseX, mouseY);
  }

  // Music Player 클릭
  if (isMusicPlayerActive) {
    player2.mousePressed();
  }
  if (isUIElementsActive){
    uiElements.mousePressed();
  }
}

function mouseDragged() {
  player2.mouseDragged();
}

function mouseReleased() {
  player2.mouseReleased();
}

function changeBackgroundColor() {
  // 랜덤한 색을 생성하여 bgColor에 저장
  let r = random(0, 255);  // 빨강
  let g = random(0, 255);  // 초록
  let b = random(0, 255);  // 파랑
  
  // 새로운 색을 bgColor에 할당
  bgColor = color(r, g, b);  // 'color()'로 색을 지정
}


// 플레이어 전환 함수
function switchPlayer() {
  // 현재 플레이어 활성화 상태를 반전시키고 나머지 플레이어를 비활성화
  if (isMusicPlayerActive) {
    isMusicPlayerActive = false;
    isCdPlayerActive = true;   // CD 플레이어 활성화
    isUIElementsActive = false;
  } else if (isCdPlayerActive) {
    isCdPlayerActive = false;
    isUIElementsActive = true;  // UIElements 활성화
  } else if (isUIElementsActive) {
    isUIElementsActive = false;
    isMusicPlayerActive = true; // 음악 플레이어 활성화
  }
}


// CD Player 클래스
class Cdplayer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.moveSpeed = 0.05;
    this.isMoving = false;
    this.targetX = null;
    this.targetY = null;
    this.currentCD = null;
    this.currentMusic = null;
    
    this.cd1 = new CD(50, 150, 1, cd1, music1);
    this.cd2 = new CD(50, 350, 2, cd2, music2);
    this.cd3 = new CD(50, 550, 3, cd3, music3);
  }

  display() {
    image(cdplayer, this.x-0.5, this.y); // CD 플레이어 이미지 그리기
    this.cd1.display();
    this.cd2.display();
    this.cd3.display();
  }

  update() {
    if (this.isMoving) {
      this.moveCD();
    }
  }

  moveCD() {
    let cd = this.getCurrentCD();

    if (cd) {
      cd.x = lerp(cd.x, this.targetX, this.moveSpeed);
      cd.y = lerp(cd.y, this.targetY, this.moveSpeed);
      
      if (dist(cd.x, cd.y, this.targetX, this.targetY) < 5) {
        this.isMoving = false;
        if (this.currentMusic) {
          this.currentMusic.stop();
        }
        this.currentMusic.play();
      }
    }
  }

  getCurrentCD() {
    if (this.currentCD === 1) return this.cd1;
    if (this.currentCD === 2) return this.cd2;
    if (this.currentCD === 3) return this.cd3;
    return null;
  }

  handleClick(mouseX, mouseY) {
    if (this.cd1.isClicked(mouseX, mouseY)) {
      this.selectCD(this.cd1, this.x + 4, this.y - cd2.height / 2 + 41, music1);
    } else if (this.cd2.isClicked(mouseX, mouseY)) {
      this.selectCD(this.cd2, this.x + 5.5, this.y - cd2.height / 2 + 39.5, music2);
    } else if (this.cd3.isClicked(mouseX, mouseY)) {
      this.selectCD(this.cd3, this.x + 5, this.y - cd2.height / 2 + 39, music3);
    }
  }

  selectCD(cd, targetX, targetY, music) {
    // 클릭한 CD가 현재 선택된 CD와 다를 때만 실행
    if (this.currentCD !== cd.cdNumber) {
      if (this.currentMusic) {
        this.currentMusic.stop();  // 현재 음악 중지
      }
      this.resetCDPositions();    // 모든 CD의 위치 리셋
      this.targetX = targetX;     // 선택된 CD의 목표 위치
      this.targetY = targetY;
      this.currentCD = cd.cdNumber;  // 현재 CD 업데이트
      this.isMoving = true;        // CD가 움직이도록 설정
      this.currentMusic = music;  // 선택된 CD의 음악 설정
    } else {
      // 이미 선택된 CD를 클릭했을 경우, 원래 위치로 돌아가며 음악도 멈추기
      this.resetCDPositions();    // 모든 CD의 위치 리셋
      if (this.currentMusic) {
        this.currentMusic.stop();  // 음악 멈추기
      }
      this.currentMusic = null;   // 음악을 null로 설정 (음악을 멈추는 효과)
    }
  }

  resetCDPositions() {
    this.cd1.resetPosition();
    this.cd2.resetPosition();
    this.cd3.resetPosition();
  }
}

// CD 클래스
class CD {
  constructor(x, y, cdNumber, image, music) {
    this.x = x;
    this.y = y;
    this.cdNumber = cdNumber;
    this.image = image;
    this.music = music;
    this.rotationAngle = 0;
  }

  display() {
    push();
    if (this.cdNumber === player.currentCD) {
      translate(this.x, this.y);
      rotate(this.rotationAngle);
      imageMode(CENTER);
      image(this.image, 0, 0);
    } else {
      image(this.image, this.x, this.y);
    }
    pop();

    if (this.music && this.music.isPlaying()) {
      this.rotationAngle += 0.5;
    }
  }

  isClicked(mx, my) {
    let offsetX = this.x - this.image.width / 2;
    let offsetY = this.y - this.image.height / 2;
    return mx > offsetX && mx < offsetX + this.image.width && my > offsetY && my < offsetY + this.image.height;
  }

  resetPosition() {
    if (this.cdNumber === 1) {
      this.x = 50;
      this.y = 150;
    } else if (this.cdNumber === 2) {
      this.x = 50;
      this.y = 350;
    } else if (this.cdNumber === 3) {
      this.x = 50;
      this.y = 550;
    }
  }
}


// Music Player 클래스
class MusicPlayer {
  constructor() {
    this.music1 = loadSound('m1.mp3');
    this.music2 = loadSound('m2.mp3');
    this.music3 = loadSound('m3.mp3');
    this.mp = loadImage('mp.png');
    this.ab1 = loadImage('ab1.png');
    this.ab2 = loadImage('ab2.png');
    this.ab3 = loadImage('ab3.png');
    this.left = loadImage('left.png');
    this.right = loadImage('right.png');
    this.play = loadImage('play.png');
    this.pause = loadImage('pause.png');
    this.long = loadImage('long.png');
    this.pointt = loadImage('pointt.png');
    
    this.currentAbImage = this.ab1; // 초기값을 ab1로 설정
    this.currentMusic = this.music1; // 초기값을 music1으로 설정
    this.isPlaying = false; // 음악이 재생 중인지 여부를 추적하는 변수
    this.dragging = false; // 드래그 상태를 추적하는 변수
    this.dragOffsetX = 0;  // 드래그 시, pointt와 마우스의 x 좌표 차이를 저장하는 변수
    this.currentMusic.pause();
  }
  
  setup() {
    this.currentMusic.pause();  // music1을 바로 멈춤
  }

  draw() {
    // mp 이미지를 캔버스 중앙에 그리기
    let mpX = width / 2;  // mp의 중앙 x 좌표
    let mpY = height / 2; // mp의 중앙 y 좌표
    image(this.mp, mpX, mpY+12);
  
    // 현재 이미지에 따라 ab1, ab2, ab3 중 하나를 그리기
    let ab1X = mpX;  // ab1의 x 좌표는 mp의 중앙과 같게
    let ab1Y = mpY - 70; // ab1의 y 좌표는 mp의 중앙에서 -20만큼 이동
    image(this.currentAbImage, ab1X, ab1Y);
  
    // play/pause, right, left 버튼 그리기
    let pauseX = mpX;
    let pauseY = mpY + 250;
    image(this.isPlaying ? this.pause : this.play, pauseX, pauseY);
  
    let rightX = mpX + 130;
    let rightY = mpY + 250;
    image(this.right, rightX, rightY);
  
    let leftX = mpX - 130;
    let leftY = mpY + 250;
    image(this.left, leftX, leftY);
    
    // long 이미지 그리기
    let longX = mpX;
    let longY = mpY + 180;
    image(this.long, longX, longY);
  
    // pointt 이미지 그리기 (음악 진행에 따라 움직이게 만들기)
    let pointtX = longX - this.long.width / 2 + (this.long.width * this.currentMusic.currentTime() / this.currentMusic.duration());
    let pointtY = longY;
    image(this.pointt, pointtX, pointtY);
  }

  mousePressed() {
    let mpX = width / 2;
    let mpY = height / 2;

    // pause/play 버튼 클릭
    let pauseX = mpX;
    let pauseY = mpY + 250;
    if (dist(mouseX, mouseY, pauseX, pauseY) < this.pause.width / 2) {
      if (this.isPlaying) {
        this.currentMusic.pause(); // 음악 멈추기
      } else {
        this.currentMusic.play();  // 음악 재개
      }
      this.isPlaying = !this.isPlaying;  // 음악 상태 변경 (재생/멈춤)
    }

    // right 버튼 클릭
    let rightX = mpX + 130;
    let rightY = mpY + 250;
    if (dist(mouseX, mouseY, rightX, rightY) < this.right.width / 2) {
      if (this.currentAbImage === this.ab1) {
        this.currentAbImage = this.ab2;  // ab1을 ab2로 변경
        this.resetMusic(this.music2);    // 음악을 music2로 초기화
      } else if (this.currentAbImage === this.ab2) {
        this.currentAbImage = this.ab3;  // ab2를 ab3으로 변경
        this.resetMusic(this.music3);    // 음악을 music3으로 초기화
      } else {
        this.currentAbImage = this.ab1;  // ab3을 ab1으로 다시 변경
        this.resetMusic(this.music1);    // 음악을 music1으로 초기화
      }
    }

    // left 버튼 클릭
    let leftX = mpX - 130;
    let leftY = mpY + 250;
    if (dist(mouseX, mouseY, leftX, leftY) < this.left.width / 2) {
      if (this.currentAbImage === this.ab1) {
        this.currentAbImage = this.ab3;  // ab1을 ab3으로 변경
        this.resetMusic(this.music3);    // 음악을 music3으로 초기화
      } else if (this.currentAbImage === this.ab3) {
        this.currentAbImage = this.ab2;  // ab3을 ab2로 변경
        this.resetMusic(this.music2);    // 음악을 music2으로 초기화
      } else {
        this.currentAbImage = this.ab1;  // ab2를 ab1으로 다시 변경
        this.resetMusic(this.music1);    // 음악을 music1으로 초기화
      }
    }

    // pointt를 클릭한 경우 (음악 진행 바 클릭)
    let longX = mpX;
    let longY = mpY + 180;
    let pointtX = longX - this.long.width / 2 + (this.long.width * this.currentMusic.currentTime() / this.currentMusic.duration());

    // pointt를 클릭하는 범위를 더 넓게 설정
    let pointtClickableArea = this.pointt.width;  // 클릭 가능한 영역을 두 배로 넓힘
    if (dist(mouseX, mouseY, pointtX, longY - 4) < pointtClickableArea / 2) {
      this.dragging = true; // pointt를 드래그 시작
      this.dragOffsetX = mouseX - pointtX; // 드래그 시작 위치에서의 차이 계산
    }
  }

  mouseDragged() {
    if (this.dragging) {
      let mpX = width / 2;
      let mpY = height / 2;
      let longX = mpX;
      let longY = mpY + 180; // long 이미지의 y 좌표는 mpY + 180
      let newPointtX = mouseX - this.dragOffsetX; // 마우스 위치에서 드래그 오프셋을 빼서 새로운 pointt X 좌표 계산
      
      // pointtX를 long의 범위 내에서만 이동하도록 제한
      newPointtX = constrain(newPointtX, longX - this.long.width / 2, longX + this.long.width / 2);

      // 음악 재생 시간을 계산하여 변경
      let progress = map(newPointtX, longX - this.long.width / 2, longX + this.long.width / 2, 0, this.currentMusic.duration());
      this.currentMusic.jump(progress); // 음악 재생 시간 설정
    }
  }

  mouseReleased() {
    this.dragging = false; // 드래그 종료
  }

  resetMusic(music) {
    this.currentMusic.stop();  // 현재 음악 중지
    this.currentMusic = music; // 새 음악 설정
    this.currentMusic.play();  // 새 음악 재생
    this.isPlaying = true;     // 새 음악이 재생 중으로 설정
  }
}

class UIElements {
  constructor() {
    this.numBars = 20;
    this.barWidth = (width - (this.numBars - 1) * gap) / this.numBars * 0.25;  // 바 너비를 25%로 줄임
    this.left2 = loadImage('left2.png');
    this.right2 = loadImage('right2.png');
    this.play2 = loadImage('play2.png');
    this.pause2 = loadImage('pause2.png');
  }

  display() {
    fill(255);
    textAlign(CENTER, CENTER);
    
    // "Play list" 텍스트
    textSize(150);
    text("PLAY LIST", width/2, height /2- 120);  // 정중앙보다 y-80 위치에 표시
    noStroke();
    fill(255);  // 바 색상을 하얀색으로 설정
    
    // FFT로 음원의 주파수 분석
    let spectrum = fft.analyze();
    
    // 바들의 전체 너비 계산
    let totalWidth = this.numBars * this.barWidth + (this.numBars - 1) * gap;
    // 바들의 시작 x 좌표 (중앙 정렬을 위해)
    let startX = (width - totalWidth) / 2;

    for (let i = 0; i < this.numBars; i++) {
      let barx = startX + i * (this.barWidth + gap);  // x 위치는 중앙 정렬을 고려해서 설정
      
      // FFT 데이터를 기반으로 음원의 세기에 따라 바의 높이를 다르게 설정
      let barHeight = map(spectrum[i], 0, 255, minHeight, maxHeight);
      
      // 바코드의 막대를 그리기 (위쪽과 아래쪽으로 길이가 변하는 효과)
      rect(barx, height / 2 - barHeight / 2 + 250, this.barWidth, barHeight);
    }
    
    // 이미지 버튼들 표시
    image(this.left2, width/2 - 300, height/2 + 100);
    image(this.right2, width/2 + 300, height/2 + 100);
    image(this.pause2, width/2 + 100, height/2 + 100);
    image(this.play2, width/2 - 100, height/2 + 100);
  }
  
  // 마우스 클릭 시 동작 처리
  mousePressed() {
    let left2Width = this.left2.width;
    let left2Height = this.left2.height;
    
    let right2Width = this.right2.width;
    let right2Height = this.right2.height;
    
    let play2Width = this.play2.width;
    let play2Height = this.play2.height;
    
    let pause2Width = this.pause2.width;
    let pause2Height = this.pause2.height;

    // play2 이미지 클릭 시 음악 재생
    if (mouseX > width / 2 - 100 - play2Width / 2 && mouseX < width / 2 + 100 + play2Width / 2 && mouseY > height / 2 + 50 - play2Height / 2 && mouseY < height / 2 + 150 + play2Height / 2) {
      if (!isPlaying) {
        currentMusic.play();  // 음악이 재생되지 않으면 재생
        isPlaying = true;
      }
    }
    
    // pause2 이미지 클릭 시 음악 정지
    if (mouseX > width / 2 + 100 - pause2Width / 2 && mouseX < width / 2 + 200 + pause2Width / 2 && mouseY > height / 2 + 50 - pause2Height / 2 && mouseY < height / 2 + 150 + pause2Height / 2) {
      if (isPlaying) {
        currentMusic.pause();  // 음악이 재생 중이면 일시 정지
        isPlaying = false;
      }
    }
    
    // left2 이미지 클릭 시 이전 음악 재생 (무한 순환)
    if (mouseX > width / 2 - 300 - left2Width / 2 && mouseX < width / 2 - 200 + left2Width / 2 && mouseY > height / 2 + 50 - left2Height / 2 && mouseY < height / 2 + 150 + left2Height / 2) {
      if (isPlaying) {
        currentMusic.stop();  // 현재 음악 정지
      }
      // 이전 음악으로 변경 (무한 순환)
      if (currentMusic === music1) {
        currentMusic = music3;
      } else if (currentMusic === music2) {
        currentMusic = music1;
      } else if (currentMusic === music3) {
        currentMusic = music2;
      }
      currentMusic.play();  // 이전 음악 재생
      isPlaying = true;
    }
    
    // right2 이미지 클릭 시 다음 음악 재생 (무한 순환)
    if (mouseX > width / 2 + 200 - right2Width / 2 && mouseX < width / 2 + 300 + right2Width / 2 && mouseY > height / 2 + 50 - right2Height / 2 && mouseY < height / 2 + 150 + right2Height / 2) {
      if (isPlaying) {
        currentMusic.stop();  // 현재 음악 정지
      }
      // 다음 음악으로 변경 (무한 순환)
      if (currentMusic === music1) {
        currentMusic = music2;
      } else if (currentMusic === music2) {
        currentMusic = music3;
      } else if (currentMusic === music3) {
        currentMusic = music1;
      }
      currentMusic.play();  // 다음 음악 재생
      isPlaying = true;
    }
  }
}



