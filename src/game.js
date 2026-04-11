// ═══════════════════════════════════════════════════════════════════════════════
// SOUNDS — Web Audio API sound engine (inlined from sounds.js)
// ═══════════════════════════════════════════════════════════════════════════════

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function beep({ frequency = 440, type = 'square', duration = 0.1, volume = 0.3, decay = true }) {
  try {
    const ac = getAudioCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);
    gain.gain.setValueAtTime(volume, ac.currentTime);
    if (decay) gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch(e) {}
}

const Sounds = {
  move() {
    beep({ frequency: 220, type: 'square', duration: 0.04, volume: 0.08 });
  },
  eat() {
    beep({ frequency: 523, type: 'square', duration: 0.08, volume: 0.3 });
    setTimeout(() => beep({ frequency: 659, type: 'square', duration: 0.08, volume: 0.3 }), 80);
  },
  levelUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => setTimeout(() => beep({ frequency: f, type: 'square', duration: 0.12, volume: 0.4 }), i * 100));
  },
  die() {
    beep({ frequency: 440, type: 'sawtooth', duration: 0.15, volume: 0.4 });
    setTimeout(() => beep({ frequency: 330, type: 'sawtooth', duration: 0.15, volume: 0.4 }), 150);
    setTimeout(() => beep({ frequency: 220, type: 'sawtooth', duration: 0.3, volume: 0.4 }), 300);
  },
  birthday() {
    // Happy birthday melody in 8-bit
    const melody = [
      [523, 0], [523, 150], [587, 300], [523, 600], [698, 750], [659, 1050],
      [523, 1350], [523, 1500], [587, 1650], [523, 1950], [784, 2100], [698, 2400],
      [523, 2700], [523, 2850], [1047, 3000], [880, 3150], [698, 3450], [659, 3600], [587, 3900],
      [932, 4200], [932, 4350], [880, 4500], [698, 4800], [784, 4950], [698, 5250],
    ];
    melody.forEach(([f, t]) => setTimeout(() => beep({ frequency: f, type: 'square', duration: 0.18, volume: 0.35 }), t));
  },
  glitch() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => beep({ 
        frequency: Math.random() * 800 + 100, 
        type: 'sawtooth', 
        duration: 0.05, 
        volume: 0.2 
      }), i * 60);
    }
  },
  select() {
    beep({ frequency: 400, type: 'square', duration: 0.05, volume: 0.2 });
  },
  pause() {
    beep({ frequency: 300, type: 'square', duration: 0.08, volume: 0.25 });
    setTimeout(() => beep({ frequency: 250, type: 'square', duration: 0.08, volume: 0.25 }), 90);
  },
  resume() {
    beep({ frequency: 250, type: 'square', duration: 0.08, volume: 0.25 });
    setTimeout(() => beep({ frequency: 300, type: 'square', duration: 0.08, volume: 0.25 }), 90);
  }
};

// Unlock audio on first user interaction
function unlockAudio() {
  try {
    const ac = getAudioCtx();
    if (ac.state === 'suspended') ac.resume();
  } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUOTES — Tamil directors quotes (inlined from quotes.js)
// ═══════════════════════════════════════════════════════════════════════════════

// Quotes from Tamil directors — Mysskin, Thiagarajan Kumararaja, Ram
// Used between levels to add soul to the game

const QUOTES = [
  {
    text: "இயற்கை யாரையும் தண்டிப்பதில்லை, அது செயல்படுகிறது அவ்வளவுதான்.",
    director: "Ram",
    film: "Peranbu"
  },
  {
    text: "ஒரு பொய் சொல்றதுக்கு தைரியம் வேணும், ஆனா உண்மைய சொல்றதுக்கு அதைவிட பெரிய தைரியம் வேணும்.",
    director: "Mysskin",
    film: "Nandalala"
  },
  {
    text: "உலகத்துல பொய் சொல்றது கெட்ட பழக்கம், ஆனா சில இடத்துல பொய் சொன்னா தான் வாழ முடியும்.",
    director: "Mysskin",
    film: "Anjathe"
  },
  {
    text: "அன்பு மட்டுமே உலகின் சிறந்த மருந்து.",
    director: "Ram",
    film: "Peranbu"
  },
  {
    text: "ஒருத்தன் நல்லவனா கெட்டவனானு முடிவு பண்றது சூழ்நிலை தான்.",
    director: "Thiagarajan Kumararaja",
    film: "Aaranya Kaandam"
  },
  {
    text: "ஒருத்தன் என்ன தப்பு பண்றான்னு முக்கியம் இல்ல, அதை யார் பண்றாங்கறது தான் முக்கியம்.",
    director: "Thiagarajan Kumararaja",
    film: "Aaranya Kaandam"
  },
  {
    text: "பொம்பளைங்க அழுகுறது இயற்கை, ஆனா ஆம்பளைங்க அழுதா அது வலி.",
    director: "Mysskin",
    film: "Pisaasu"
  },
  {
    text: "ஆண்கள் அழுவதில்லை என்று யாரோ பொய் சொல்லி வளர்த்துவிட்டார்கள்.",
    director: "Ram",
    film: "Taramani"
  },
  {
    text: "இருட்டுல இருக்கிறவனுக்கு தான் வெளிச்சத்தோட அருமை தெரியும்.",
    director: "Mysskin",
    film: "Onaayum Aattukkuttiyum"
  },
  {
    text: "எல்லா தப்புக்கும் ஒரு நியாயம் இருக்கு.",
    director: "Thiagarajan Kumararaja",
    film: "Super Deluxe"
  },
  {
    text: "அவமானம் தான் ஒரு மனிதனை அடுத்த கட்டத்திற்கு நகர்த்தும்.",
    director: "Ram",
    film: "Kattradhu Thamizh"
  },
  {
    text: "இரவு எவ்வளவு இருட்டாக இருக்கிறதோ, விடியல் அவ்வளவு வெளிச்சமாக இருக்கும்.",
    director: "Mysskin",
    film: "Yuddham Sei"
  },
  {
    text: "வாழ்க்கைங்கிறது ஒரு பெரிய கடல், அதுல நாம நீச்சல் கத்துக்குறதுக்குள்ள முழுகிடுவோம்.",
    director: "Ram",
    film: "Thanga Meengal"
  },
  {
    text: "மனுஷனா பொறந்தது ரொம்ப கஷ்டம், அதை விட கஷ்டம் மனுஷனா வாழுறது.",
    director: "Ram",
    film: "Peranbu"
  },
  {
    text: "ஒரு கொலைகாரனுக்கு தான் உயிரோட அருமை தெரியும்.",
    director: "Mysskin",
    film: "Yuddham Sei"
  },
  {
    text: "மனிதர்கள் எப்பவுமே தங்களுக்கு புடிச்ச மாதிரி தான் கடவுள உருவாக்குறாங்க.",
    director: "Mysskin",
    film: "Nandalala"
  },
  {
    text: "உண்மையான அன்பு என்னைக்கும் அழியாது, அது வேறொரு வடிவத்துல உருமாறும்.",
    director: "Mysskin",
    film: "Pisaasu"
  },
  {
    text: "சத்தியம் எப்பவும் செருப்பு போட்டு வெளிவர முன்னாடி, பொய் உலகத்தையே சுத்தி வந்துரும்.",
    director: "Mysskin",
    film: "Thupparivaalan"
  },
  {
    text: "ஒவ்வொரு மனுஷனுக்குள்ளயும் ஏதோ ஒரு பைத்தியக்காரத்தனம் இருக்கு.",
    director: "Mysskin",
    film: "Mugamoodi"
  },
  {
    text: "ஒவ்வொரு மனுஷனுக்குள்ளயும் ஒரு நீதிபதி இருக்கான், ஆனா அவனுக்கு தனக்கு சாதகமா மட்டும் தான் தீர்ப்பு குடுக்க தெரியும்.",
    director: "Thiagarajan Kumararaja",
    film: "Aaranya Kaandam"
  },
  {
    text: "எது தேவையோ அதுவே தர்மம்.",
    director: "Thiagarajan Kumararaja",
    film: "Aaranya Kaandam"
  },
  {
    text: "நாம எல்லாம் வெறும் பொம்மைகள், இது எல்லாமே மேல இருக்கிறவன் போடுற ஸ்கிரிப்ட்.",
    director: "Thiagarajan Kumararaja",
    film: "Super Deluxe"
  },
  {
    text: "வாழ்க்கையில எந்த ஒரு விஷயமும் காரணமே இல்லாம நடக்காது.",
    director: "Thiagarajan Kumararaja",
    film: "Super Deluxe"
  },
  {
    text: "நமக்கு புடிச்சவங்கள சந்தோசப்படுத்துறது தான் காதல், நம்மள சந்தோசப்படுத்துறது இல்ல.",
    director: "Thiagarajan Kumararaja",
    film: "Aaranya Kaandam"
  },
  {
    text: "உண்மையான அன்பை கொடுக்கிறவங்க எப்பவுமே அநாதைகள் தான்.",
    director: "Ram",
    film: "Kattradhu Thamizh"
  },
  {
    text: "உலகத்துல எல்லாமே வியாபாரம், அன்பு மட்டும்தான் இலவசம்.",
    director: "Ram",
    film: "Thanga Meengal"
  },
  {
    text: "ஆயிரம் பொய்களை விட ஒரு கசப்பான உண்மை எவ்வளவோ மேலானது.",
    director: "Ram",
    film: "Taramani"
  },
  {
    text: "இந்த சமூகத்துல நல்லவனா வாழ்றதுக்கு நிறைய தைரியம் வேணும்.",
    director: "Ram",
    film: "Peranbu"
  },
  {
    text: "நீ யாரை ரொம்ப நேசிக்கிறியோ, அவங்க தான் உன்னை அதிகமா காயப்படுத்துவாங்க.",
    director: "Ram",
    film: "Kattradhu Thamizh"
  },
  {
    text: "நல்லவன் கெட்டவன் எல்லாம் கிடையாது, தேவைக்கு ஏத்த மாதிரி மாறிக்குவாங்க.",
    director: "Thiagarajan Kumararaja",
    film: "Aaranya Kaandam"
  },
  {
    text: "கண்ணுக்கு தெரியாத ஒரு விஷயத்தை நம்புறது தான் கடவுள்.",
    director: "Mysskin",
    film: "Pisaasu"
  },
  {
    text: "காசுக்காக நடிக்கிறவங்களை விட, பாசத்துக்காக நடிக்கிறவங்க தான் இங்க அதிகம்.",
    director: "Ram",
    film: "Taramani"
  },
  {
    text: "ஒரு ஜீவனுக்கு ஆபத்துனா அதை காப்பாத்துறது தான் மனுஷத்தன்மை, அது ஓநாயா இருந்தாலும் சரி.",
    director: "Mysskin",
    film: "Onaayum Aattukkuttiyum"
  },
  {
    text: "பசிக்கிறப்போ பிச்சை எடுக்கிறது தப்பு கிடையாது, ஆனா பிச்சை எடுத்த அப்புறம் பசிக்குதுன்னு பொய் சொல்றது தான் தப்பு.",
    director: "Thiagarajan Kumararaja",
    film: "Aaranya Kaandam"
  }
];

let shuffledQuotes = [];
let quoteIndex = 0;

function fisherYatesShuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuoteForLevel() {
  if (shuffledQuotes.length === 0 || quoteIndex >= shuffledQuotes.length) {
    shuffledQuotes = fisherYatesShuffle(QUOTES);
    quoteIndex = 0;
  }
  return shuffledQuotes[quoteIndex++];
}

// ═══════════════════════════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Constants ───────────────────────────────────────────────────────────────
const GRID = 20;
const BASE_INTERVAL = 180;
const MAX_FRAME_DELTA = 100;
const BIRTHDAY_LEVELS = 38; // levels 1–37 normal, level 38 = cake finale

function pointsForLevel(level) {
  // Birthday: 1 cake = 1 level (37 quick levels to the surprise)
  if (gameMode === 'birthday') return 1;
  // Classic: scaling difficulty
  return level * 3;
}

function intervalForLevel(level) {
  return Math.max(60, BASE_INTERVAL - (level - 1) * 4);
}

// ─── Game Mode ───────────────────────────────────────────────────────────────
// 'birthday' | 'classic' | null
let gameMode = null;

// ─── State ───────────────────────────────────────────────────────────────────
let snake, previousSnake, dir, previousDir, nextDir, food, score, highScore, level, levelPoints;
let foodEaten, gameLoop, gameState, cellSize, stepAccumulator, lastFrameTime, activeStepInterval;
let hearts, checkpointSnake, checkpointScore, checkpointLevel;
let growthAccum = 0; // fractional growth accumulator
let boardBuffer = null;
let boardCtx = null;
// gameState: 'menu' | 'idle' | 'playing' | 'paused' | 'levelup' | 'quote'
//            | 'birthday' | 'glitch' | 'snakewish' | 'message' | 'dead'

// ─── DOM refs ────────────────────────────────────────────────────────────────
const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d', { alpha: false, desynchronized: true }) || canvas.getContext('2d');
const hud           = document.getElementById('hud');
const scoreEl       = document.getElementById('scoreVal');
const highScoreEl   = document.getElementById('highScoreVal');
const levelEl       = document.getElementById('levelVal');
const heartsEl      = document.getElementById('heartsVal');
const heartsBlock   = document.getElementById('heartsBlock');
const achieveBar    = document.getElementById('achieveBar');
const achieveText   = document.getElementById('achieveText');
const milestones    = [...document.querySelectorAll('.milestone')];
const unlockLabel   = document.getElementById('nextUnlockLabel');
const overlay       = document.getElementById('overlay');
const overlayInner  = document.getElementById('overlayInner');
const quoteBox      = document.getElementById('quoteBox');
const quoteText     = document.getElementById('quoteText');
const quoteDirector = document.getElementById('quoteDirector');
const quoteFilm     = document.getElementById('quoteFilm');
const btnSelect     = document.getElementById('btnSelect');
const btnStart      = document.getElementById('btnStart');

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
  ctx.imageSmoothingEnabled = false;
  highScore = parseInt(localStorage.getItem('snakeHS') || '0');
  highScoreEl.textContent = fmtScore(highScore);
  gameLoop = null;
  stepAccumulator = 0;
  lastFrameTime = 0;
  activeStepInterval = BASE_INTERVAL;
  gameState = 'menu';
  resizeCanvas();
  showModeSelect();
  bindControls();
  window.addEventListener('resize', () => {
    resizeCanvas();
    if (gameState === 'menu' || gameState === 'idle') drawIdle();
  });
}

function resizeCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, container.clientHeight || container.clientWidth);
  canvas.width = size;
  canvas.height = size;
  cellSize = size / GRID;
  ensureBoardBuffer(size);
}

function ensureBoardBuffer(size) {
  if (!boardBuffer) {
    boardBuffer = document.createElement('canvas');
    boardCtx = boardBuffer.getContext('2d', { alpha: false }) || boardBuffer.getContext('2d');
  }

  if (boardBuffer.width !== size || boardBuffer.height !== size) {
    boardBuffer.width = size;
    boardBuffer.height = size;
  }

  renderBoardBuffer();
}

function renderBoardBuffer() {
  if (!boardCtx) return;
  boardCtx.clearRect(0, 0, boardBuffer.width, boardBuffer.height);
  boardCtx.fillStyle = '#000';
  boardCtx.fillRect(0, 0, boardBuffer.width, boardBuffer.height);
  drawGrid(boardCtx, boardBuffer.width, boardBuffer.height);
}

function cloneSnakeState(segments = []) {
  return segments.map(seg => ({ x: seg.x, y: seg.y }));
}

function syncRenderState() {
  previousSnake = cloneSnakeState(snake);
  previousDir = { ...dir };
  stepAccumulator = 0;
}

function stopLoop() {
  if (gameLoop !== null) {
    cancelAnimationFrame(gameLoop);
    gameLoop = null;
  }
  lastFrameTime = 0;
  stepAccumulator = 0;
}

function frameLoop(timestamp) {
  if (gameState !== 'playing') {
    gameLoop = null;
    return;
  }

  if (!lastFrameTime) lastFrameTime = timestamp;
  const delta = Math.min(timestamp - lastFrameTime, MAX_FRAME_DELTA);
  lastFrameTime = timestamp;
  stepAccumulator += delta;

  while (stepAccumulator >= activeStepInterval && gameState === 'playing') {
    previousSnake = cloneSnakeState(snake);
    previousDir = { ...dir };
    tick();
    stepAccumulator -= activeStepInterval;
  }

  if (gameState === 'playing') {
    const alpha = activeStepInterval > 0 ? Math.min(stepAccumulator / activeStepInterval, 1) : 1;
    draw(timestamp, alpha);
    gameLoop = requestAnimationFrame(frameLoop);
  } else {
    gameLoop = null;
  }
}

function applyModeUI() {
  if (hud) hud.classList.toggle('hud--birthday', gameMode === 'birthday');
  if (heartsBlock) heartsBlock.style.display = gameMode === 'classic' ? 'flex' : 'none';
}

// ─── Mode Selection ───────────────────────────────────────────────────────
const modeModal = document.getElementById('modeSelectModal');

function showModeSelect() {
  gameState = 'menu';
  applyModeUI();
  if (modeModal) modeModal.classList.remove('hidden');
  drawIdle();
}

window.selectMode = function(mode) {
  unlockAudio();
  Sounds.select();
  gameMode = mode;
  if (modeModal) modeModal.classList.add('hidden');
  applyModeUI();
  gameState = 'idle';
  drawIdle();
};

// ─── Game Start / Reset ───────────────────────────────────────────────────
function startGame() {
  stopLoop();
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir      = { x: 1, y: 0 };
  nextDir  = { x: 1, y: 0 };
  score       = 0;
  level       = 1;
  levelPoints = 0;
  foodEaten   = 0;
  growthAccum = 0;

  if (gameMode === 'classic') {
    hearts          = 3;
    checkpointSnake = null;
    checkpointScore = 0;
    checkpointLevel = 1;
    updateHeartsDisplay();
  }

  syncRenderState();
  gameState = 'playing';
  updateHUD();
  spawnFood();
  scheduleLoop();
  hideOverlay();
  hideQuote();
}

function scheduleLoop() {
  stopLoop();
  activeStepInterval = intervalForLevel(level);
  syncRenderState();
  draw(performance.now(), 1);
  gameLoop = requestAnimationFrame(frameLoop);
}

// ─── Tick ────────────────────────────────────────────────────────────────────
function tick() {
  if (gameState !== 'playing') return;

  dir = { ...nextDir };
  const head = {
    x: (snake[0].x + dir.x + GRID) % GRID,
    y: (snake[0].y + dir.y + GRID) % GRID
  };

  // Birthday mode: invincible (no self-collision)
  // Classic mode: self-bite loses a heart
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    if (gameMode === 'classic') { loseHeart(); return; }
    // Birthday: just ignore the collision, keep moving
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    Sounds.eat();
    score += 100 * level;
    levelPoints++;
    foodEaten++;

    // Fractional growth: birthday 0.2/cake, classic 0.5/cake
    const growthRate = gameMode === 'birthday' ? 0.2 : 0.5;
    growthAccum += growthRate;
    if (growthAccum >= 1) {
      growthAccum -= 1;
      // Don't pop tail → snake grows by 1 segment
    } else {
      snake.pop(); // no growth this tick
    }

    updateHUD();

    const isBirthdayCake = gameMode === 'birthday' && level === BIRTHDAY_LEVELS;
    if (isBirthdayCake && levelPoints >= pointsForLevel(level)) {
      setTimeout(triggerBirthday, 200);
    } else if (levelPoints >= pointsForLevel(level)) {
      setTimeout(triggerLevelUp, 100);
    } else {
      spawnFood();
    }
  } else {
    snake.pop();
    if (foodEaten % 3 === 0) Sounds.move();
  }
}

// ─── Level Up Flow ────────────────────────────────────────────────────────
function triggerLevelUp() {
  stopLoop();
  gameState = 'levelup';

  if (gameMode === 'birthday') {
    // Birthday: silent level advance — no popup, no sound, just keep going
    level++;
    levelPoints = 0;
    updateHUD();
    gameState = 'playing';
    spawnFood();
    scheduleLoop();
    return;
  }

  // Classic mode: full banner + checkpoint + quote
  Sounds.levelUp();
  showLevelUpBanner(level, () => {
    level++;
    levelPoints = 0;

    // Save checkpoint at entry of new level
    checkpointSnake  = snake.map(s => ({ ...s }));
    checkpointScore  = score;
    checkpointLevel  = level;
    hearts = 3;
    updateHeartsDisplay();

    updateHUD();
    hideOverlay();

    const quote = getQuoteForLevel();
    showQuote(quote, () => {
      gameState = 'playing';
      spawnFood();
      scheduleLoop();
    });
  });
}

function showLevelUpBanner(completedLevel, cb) {
  const sub = gameMode === 'classic'
    ? 'CHECKPOINT SAVED ✓'
    : `NEXT: LEVEL ${completedLevel + 1}`;
  showOverlay(`
    <div class="level-up-banner">
      <div class="lu-title">LEVEL UP</div>
      <div class="lu-level">LEVEL ${completedLevel} CLEAR</div>
      <div class="lu-sub">${sub}</div>
    </div>
  `);
  setTimeout(cb, gameMode === 'birthday' ? 1000 : 2000);
}

// ─── Classic: Hearts / Respawn ────────────────────────────────────────────
function loseHeart() {
  stopLoop();
  Sounds.die();
  hearts--;
  updateHeartsDisplay();

  if (hearts <= 0) {
    gameState = 'dead';
    showOverlay(`
      <div class="dead-screen">
        <div class="dead-title">LEVEL FAILED</div>
        <div class="dead-score">SCORE: ${fmtScore(score)}</div>
        <div class="dead-level">REACHED LEVEL ${level}</div>
        <div class="dead-checkpoint">CHECKPOINT: LEVEL ${checkpointLevel}</div>
        <button onclick="window.restoreCheckpoint()" class="btn-restart" style="background:linear-gradient(45deg,var(--secondary),#ff4466);color:#000;margin-top:14px;">[ RETRY FROM CHECKPOINT ]</button>
        <button onclick="window.restartGame()" class="btn-restart">[ START OVER ]</button>
        <button onclick="window.backToMenu()" class="btn-restart" style="background:var(--surface-top);color:var(--primary);margin-top:6px;">[ CHANGE MODE ]</button>
      </div>
    `);
  } else {
    gameState = 'respawning';
    showOverlay(`
      <div class="dead-screen">
        <div class="dead-title" style="color:var(--tertiary);font-size:clamp(14px,4vw,20px);">OOPS!</div>
        <div class="dead-level">${hearts} ${hearts === 1 ? 'HEART' : 'HEARTS'} REMAINING</div>
        <div class="dead-checkpoint" style="margin-top:10px;">RESPAWNING AT LEVEL ${level}…</div>
      </div>
    `);
    setTimeout(() => {
      hideOverlay();
      respawnAtLevelStart();
    }, 1500);
  }
}

function respawnAtLevelStart() {
  if (checkpointSnake && checkpointLevel === level) {
    snake = checkpointSnake.map(s => ({ ...s }));
    score = checkpointScore;
  } else {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  }
  dir         = { x: 1, y: 0 };
  nextDir     = { x: 1, y: 0 };
  levelPoints = 0;
  gameState   = 'playing';
  syncRenderState();
  updateHUD();
  spawnFood();
  scheduleLoop();
}

window.restoreCheckpoint = function() {
  hideOverlay();
  level  = checkpointLevel;
  snake  = checkpointSnake ? checkpointSnake.map(s => ({ ...s })) : [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  score  = checkpointScore;
  dir    = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  levelPoints = 0;
  hearts = 3;
  updateHeartsDisplay();
  gameState = 'playing';
  syncRenderState();
  updateHUD();
  spawnFood();
  scheduleLoop();
};

function updateHeartsDisplay() {
  if (!heartsEl) return;
  const f = Math.max(0, hearts);
  heartsEl.textContent = '♥'.repeat(f) + '♡'.repeat(Math.max(0, 3 - f));
}

// ─── Birthday: Death ─────────────────────────────────────────────────────
function die() {
  stopLoop();
  gameState = 'dead';
  Sounds.die();

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHS', highScore);
    highScoreEl.textContent = fmtScore(highScore);
  }

  showOverlay(`
    <div class="dead-screen">
      <div class="dead-title">GAME OVER</div>
      <div class="dead-score">SCORE: ${fmtScore(score)}</div>
      <div class="dead-level">REACHED LEVEL ${level}</div>
      <button onclick="window.restartGame()" class="btn-restart">[ START OVER ]</button>
      <button onclick="window.backToMenu()" class="btn-restart" style="background:var(--surface-top);color:var(--primary);margin-top:8px;">[ CHANGE MODE ]</button>
    </div>
  `);
}

// ─── Birthday Sequence ─────────────────────────────────────────────────────
function triggerBirthday() {
  stopLoop();
  gameState = 'birthday';
  Sounds.birthday();
  startConfetti();

  showOverlay(`
    <div class="birthday-screen">
      <div class="bday-glitch" data-text="LEVEL 38">LEVEL 38</div>
      <div class="bday-title">UNLOCKED</div>
      <div class="bday-cake">🎂</div>
      <div class="bday-msg">HAPPY BIRTHDAY<br><span class="bday-name">PLAYER_ONE</span></div>
      <div class="bday-sub">You made it through all 37 levels.<br>That's 37 years of being absolutely legendary.</div>
    </div>
  `);

  setTimeout(triggerGlitch, 3500);
}

function triggerGlitch() {
  gameState = 'glitch';
  Sounds.glitch();
  stopConfetti();

  overlayInner.classList.add('glitching');
  let count = 0;
  const gi = setInterval(() => {
    overlayInner.style.transform = `translate(${(Math.random()-.5)*20}px,${(Math.random()-.5)*20}px) skewX(${(Math.random()-.5)*5}deg)`;
    overlayInner.style.filter = `hue-rotate(${Math.random()*360}deg) brightness(${.5+Math.random()*2})`;
    if (++count > 15) {
      clearInterval(gi);
      overlayInner.style.transform = '';
      overlayInner.style.filter = '';
      overlayInner.classList.remove('glitching');
      showSnakeWish();
    }
  }, 80);
}

// ─── Snake's Wish ─────────────────────────────────────────────────────────
function showSnakeWish() {
  gameState = 'snakewish';
  showOverlay(`
    <div class="snake-wish-screen">
      <div class="sw-header">
        <span class="sw-snake-icon">🐍</span>
        <div class="sw-title">— FROM YOUR SNAKE —</div>
      </div>
      <div class="sw-terminal">
        <div class="sw-prompt-line">
          <span class="sw-prompt">snake@birthday:~$</span>
          <span class="sw-typed" id="swTyped"></span><span class="msg-cursor">█</span>
        </div>
        <div class="sw-body" id="swBody">
          <!-- ✏️  SNAKE'S WISH — edit this message -->
        <div id="swContent" style="display:none;">
Psst. It's me. Your snake.

I've been silently eating cakes for 37 levels
just to get you to this moment.

I didn't grow because I wanted YOU to grow.

Slithering beside you is the greatest level
I've ever played.

Happy Birthday. 🎂

You always were the best player.
        </div>
        </div>
      </div>
      <div class="sw-footer" id="swFooter" style="opacity:0; text-align:center;">
        <button onclick="window.proceedToCreatorMessage()" class="btn-restart" style="background:var(--secondary);color:#000;">[ CONTINUE ]</button>
      </div>
    </div>
  `);

  setTimeout(() => {
    const content = document.getElementById('swContent').textContent.trim();
    const body    = document.getElementById('swBody');
    const typed   = document.getElementById('swTyped');
    const cmd     = ' echo birthday_wish.txt';
    let i = 0;
    const typeCmd = setInterval(() => {
      typed.textContent += cmd[i++];
      if (i >= cmd.length) {
        clearInterval(typeCmd);
        setTimeout(() => {
          body.style.display = 'block';
          typeMessage(content, body, () => {
            setTimeout(() => {
              const f = document.getElementById('swFooter');
              if (f) f.style.opacity = '1';
            }, 800);
          });
        }, 400);
      }
    }, 60);
  }, 600);
}

window.proceedToCreatorMessage = function() {
  showMessage();
};

// ─── Creator's Message ─────────────────────────────────────────────────────
function showMessage() {
  gameState = 'message';
  showOverlay(`
    <div class="message-screen">
      <div class="msg-from">— A MESSAGE FROM THE CREATOR —</div>
      <div class="msg-terminal">
        <div class="msg-cursor-line">
          <span class="msg-prompt">root@player_one:~$</span>
          <span class="msg-typed" id="msgTyped"></span><span class="msg-cursor">█</span>
        </div>
        <div class="msg-body" id="msgBody">
          <!-- ✏️  PUT YOUR BIRTHDAY MESSAGE HERE -->
        <div id="msgContent" style="display:none;">
To the one who never stops playing,

Life is a game of levels, and you just cleared another big one.
38 years of legendary moves, high scores, and resilient play.

The best part of your story isn't the score — it's the journey.
Keep growing, keep gaming, and keep being you.

HAPPY 38th BIRTHDAY!
The world is lucky to have you in the game.

...Love playing the game ah?
Let's see how big you can really get. The real game begins now.
        </div>
        </div>
      </div>
      <div class="msg-footer" id="msgFooter" style="opacity:0; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button onclick="window.continueGame()" class="btn-restart" style="background:var(--secondary);color:#000;">[ KEEP PLAYING ]</button>
        <button onclick="window.restartGame()" class="btn-restart">[ RESTART ]</button>
      </div>
    </div>
  `);

  setTimeout(() => {
    const content = document.getElementById('msgContent').textContent.trim();
    const body    = document.getElementById('msgBody');
    const typed   = document.getElementById('msgTyped');
    const cmd     = ' cat birthday_message.txt';
    let i = 0;
    const typeCmd = setInterval(() => {
      typed.textContent += cmd[i++];
      if (i >= cmd.length) {
        clearInterval(typeCmd);
        setTimeout(() => {
          body.style.display = 'block';
          typeMessage(content, body, () => {
            setTimeout(() => {
              const footer = document.getElementById('msgFooter');
              if (footer) footer.style.opacity = '1';
            }, 1000);
          });
        }, 400);
      }
    }, 60);
  }, 600);
}

function typeMessage(text, el, cb) {
  el.textContent = '';
  el.style.display = 'block';
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) { clearInterval(interval); if (cb) cb(); }
  }, 28);
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent = fmtScore(score);

  if (gameMode === 'birthday') {
    levelEl.textContent = level > BIRTHDAY_LEVELS ? '∞' : String(level).padStart(2, '0');
  } else {
    levelEl.textContent = String(level).padStart(2, '0');
  }

  if (gameMode === 'birthday') {
    if (level > BIRTHDAY_LEVELS) {
      achieveText.textContent = `∞ SURVIVAL — ${snake.length} SEGMENTS`;
      achieveBar.style.width = '100%';
      if (unlockLabel) unlockLabel.innerHTML = '<span class="obj-dot"></span> MODE: INFINITE GROWTH';
    } else {
      const msgs = [
        'THE JOURNEY BEGINS', 'FINDING YOUR PATH', 'BUILDING MOMENTUM',
        'THE GRIND IS REAL', 'HALFWAY THERE', 'NO TURNING BACK',
        'ALMOST LEGENDARY', 'THE FINAL STRETCH', 'DESTINY AWAITS', 'THE CAKE IS HERE'
      ];
      let idx = level >= BIRTHDAY_LEVELS ? 9 : level >= 36 ? 8 : level >= 31 ? 7
              : level >= 26 ? 6 : level >= 21 ? 5 : level >= 16 ? 4
              : level >= 11 ? 3 : level >= 6 ? 2 : level >= 2 ? 1 : 0;
      achieveText.textContent = msgs[idx];
      achieveBar.style.width = Math.min(100, ((level - 1) / 37) * 100) + '%';

      milestones.forEach(m => {
        m.classList.toggle('reached', level >= parseInt(m.dataset.level));
      });

      if (unlockLabel) {
        const rem = BIRTHDAY_LEVELS - level;
        unlockLabel.innerHTML = rem <= 0
          ? '<span class="obj-dot"></span> 🎂 BIRTHDAY UNLOCKED'
          : `<span class="obj-dot"></span> ${rem} LEVEL${rem > 1 ? 'S' : ''} TO THE CAKE`;
      }
    }
  } else {
    // Classic mode
    const need = pointsForLevel(level) - levelPoints;
    achieveText.textContent = `LEVEL ${level} — EAT ${need} MORE`;
    achieveBar.style.width = Math.min(100, (levelPoints / pointsForLevel(level)) * 100) + '%';

    milestones.forEach(m => {
      m.classList.toggle('reached', level >= parseInt(m.dataset.level));
    });

    if (unlockLabel) {
      unlockLabel.innerHTML = `<span class="obj-dot"></span> ❤️ ${hearts}/3 HEARTS — LEVEL ${level}`;
    }
  }

  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = fmtScore(highScore);
  }
}

function fmtScore(n) {
  return n.toLocaleString().padStart(6, '0').replace(/,/g, ',');
}

// ─── Food ─────────────────────────────────────────────────────────────────────
function spawnFood() {
  let pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

// ─── Controls ────────────────────────────────────────────────────────────────
function bindControls() {
  // Keyboard controls
  document.addEventListener('keydown', e => {
    const gameKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d',' ','Enter','Escape'];
    if (gameKeys.includes(e.key)) e.preventDefault();
    unlockAudio();
    handleDirection(e.key);
    if (e.key === 'Enter' || e.key === ' ') handleStart();
    if (e.key === 'Escape') handleSelect();
  });

  // Start / Pause buttons
  btnStart.addEventListener('click',  () => { unlockAudio(); handleStart(); });
  btnSelect.addEventListener('click', () => { unlockAudio(); handleSelect(); });

  // ─── Swipe Gesture Controls (touch devices) ─────────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  const SWIPE_THRESHOLD = 20; // minimum px to count as swipe

  document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    unlockAudio();
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // If it's a quick tap with no movement — treat as start/pause
    if (absDx < 10 && absDy < 10 && dt < 300) {
      // Only handle tap on canvas area for start/pause
      const rect = canvas.getBoundingClientRect();
      const tx = e.changedTouches[0].clientX;
      const ty = e.changedTouches[0].clientY;
      if (tx >= rect.left && tx <= rect.right && ty >= rect.top && ty <= rect.bottom) {
        if (gameState === 'idle' || gameState === 'dead') {
          handleStart();
        } else if (gameState === 'playing') {
          handleSelect(); // pause
        } else if (gameState === 'paused') {
          handleStart(); // resume
        }
      }
      return;
    }

    // Swipe detected
    if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return;

    if (absDx > absDy) {
      // Horizontal swipe
      handleDirection(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    } else {
      // Vertical swipe
      handleDirection(dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }
  }, { passive: true });

  // Prevent pull-to-refresh and scroll on touch move during gameplay
  document.addEventListener('touchmove', e => {
    if (gameState === 'playing') e.preventDefault();
  }, { passive: false });
}

function handleDirection(key) {
  if (gameState !== 'playing') return;
  const map = {
    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
    a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
  };
  const d = map[key];
  if (!d || (d.x === -dir.x && d.y === -dir.y)) return;
  nextDir = d;
}

function handleStart() {
  if (gameState === 'menu') return;
  if (gameState === 'idle' || gameState === 'dead') {
    startGame();
  } else if (gameState === 'paused') {
    gameState = 'playing';
    scheduleLoop();
    hideOverlay();
    Sounds.resume();
  }
}

function handleSelect() {
  if (gameState === 'playing') {
    gameState = 'paused';
    stopLoop();
    Sounds.pause();
    showOverlay(`<div class="pause-screen"><div class="pause-title">PAUSED</div><div class="pause-sub">PRESS SELECT TO RESUME</div></div>`);
  } else if (gameState === 'paused') {
    gameState = 'playing';
    scheduleLoop();
    hideOverlay();
    Sounds.resume();
  }
}

// ─── Global Hooks ─────────────────────────────────────────────────────────────
window.restartGame = function() {
  stopConfetti();
  hideOverlay();
  startGame();
};

window.backToMenu = function() {
  stopConfetti();
  stopLoop();
  hideOverlay();
  hideQuote();
  gameMode = null;
  showModeSelect();
};

window.continueGame = function() {
  stopConfetti();
  hideOverlay();
  level = BIRTHDAY_LEVELS + 1;
  gameState = 'playing';
  updateHUD();
  scheduleLoop();
};

// ─── Confetti ────────────────────────────────────────────────────────────────
let confettiInterval = null;
let confettiParticles = [];

function startConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  confettiParticles = [];
  const colors = ['#a0ffc3', '#ff6b98', '#fffb00', '#00fc9b'];
  const sizes  = [4, 8, 4, 8, 4];
  for (let i = 0; i < 60; i++) {
    const el   = document.createElement('div');
    const size  = sizes[Math.floor(Math.random() * sizes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:${color};left:${Math.random()*100}%;top:-${size}px;opacity:${.6+Math.random()*.4};`;
    container.appendChild(el);
    confettiParticles.push({ el, y: -size, vy: 2 + Math.random() * 3 });
  }
  confettiInterval = setInterval(() => {
    confettiParticles.forEach(p => {
      p.y += p.vy;
      p.el.style.top = p.y + 'px';
      if (p.y > window.innerHeight) p.y = -8;
    });
  }, 16);
}

function stopConfetti() {
  clearInterval(confettiInterval);
  const c = document.getElementById('confettiContainer');
  if (c) c.innerHTML = '';
}

// ─── Quote Modal ──────────────────────────────────────────────────────────────
function showQuote(quote, cb) {
  quoteText.textContent     = `"${quote.text}"`;
  quoteDirector.textContent = `— ${quote.director}`;
  quoteFilm.textContent     = quote.film;
  quoteBox.classList.remove('hidden');
  quoteBox.classList.add('visible');

  const dismiss = () => {
    quoteBox.classList.remove('visible');
    quoteBox.classList.add('hidden');
    quoteBox.removeEventListener('click', dismiss);
    document.removeEventListener('keydown', dismissKey);
    setTimeout(cb, 300);
  };
  const dismissKey = e => { if (e.key === ' ' || e.key === 'Enter') dismiss(); };
  quoteBox.addEventListener('click', dismiss);
  document.addEventListener('keydown', dismissKey);
}

function hideQuote() {
  quoteBox.classList.add('hidden');
  quoteBox.classList.remove('visible');
}

// ─── Overlay ──────────────────────────────────────────────────────────────────
function showOverlay(html) {
  overlayInner.innerHTML = html;
  overlay.classList.remove('hidden');
}
function hideOverlay() {
  overlay.classList.add('hidden');
  overlayInner.innerHTML = '';
}

// ─── Drawing ──────────────────────────────────────────────────────────────────
function drawIdle() {
  resizeCanvas();
  drawBoard();
  ctx.fillStyle = '#a0ffc3';
  ctx.font = `bold ${Math.floor(cellSize * 0.7)}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('PRESS START', canvas.width / 2, canvas.height * 0.45);
  ctx.font = `${Math.floor(cellSize * 0.4)}px 'Press Start 2P', monospace`;
  ctx.fillStyle = '#ff6b98';
  ctx.fillText('TO PLAY', canvas.width / 2, canvas.height * 0.55);
}

function draw(frameTime = performance.now(), alpha = 1) {
  drawBoard();
  drawFood(frameTime);
  drawSnake(alpha);
}

function drawBoard() {
  if (boardBuffer) {
    ctx.drawImage(boardBuffer, 0, 0);
    return;
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas.width, canvas.height);
}

function drawGrid(targetCtx = ctx, width = canvas.width, height = canvas.height) {
  targetCtx.strokeStyle = 'rgba(160,255,195,0.04)';
  targetCtx.lineWidth = 1;
  for (let i = 0; i <= GRID; i++) {
    targetCtx.beginPath();
    targetCtx.moveTo(i * cellSize, 0);
    targetCtx.lineTo(i * cellSize, height);
    targetCtx.stroke();
    targetCtx.beginPath();
    targetCtx.moveTo(0, i * cellSize);
    targetCtx.lineTo(width, i * cellSize);
    targetCtx.stroke();
  }
}

function interpolateAxis(from, to, alpha) {
  let delta = to - from;
  if (delta > GRID / 2) delta -= GRID;
  if (delta < -GRID / 2) delta += GRID;

  const value = from + delta * alpha;
  return ((value % GRID) + GRID) % GRID;
}

function getInterpolatedSegment(index, alpha) {
  const current = snake[index];
  if (!current) return null;

  const fallback = previousSnake?.[previousSnake.length - 1] || current;
  const previous = previousSnake?.[index] || fallback;

  return {
    x: interpolateAxis(previous.x, current.x, alpha),
    y: interpolateAxis(previous.y, current.y, alpha),
  };
}

function drawSnake(alpha = 1) {
  const renderDir = alpha < 1 && previousDir ? previousDir : dir;
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const interpolated = getInterpolatedSegment(i, alpha) || seg;
    const x = interpolated.x * cellSize, y = interpolated.y * cellSize;
    if (isHead) {
      ctx.fillStyle = '#00fc9b';
      ctx.shadowColor = 'rgba(160,255,195,0.8)';
      ctx.shadowBlur = 15;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      const es = 3;
      if      (renderDir.x ===  1) { ctx.fillRect(x+cellSize-6, y+4, es, es); ctx.fillRect(x+cellSize-6, y+cellSize-7, es, es); }
      else if (renderDir.x === -1) { ctx.fillRect(x+3, y+4, es, es);         ctx.fillRect(x+3, y+cellSize-7, es, es); }
      else if (renderDir.y === -1) { ctx.fillRect(x+4, y+3, es, es);         ctx.fillRect(x+cellSize-7, y+3, es, es); }
      else                         { ctx.fillRect(x+4, y+cellSize-6, es, es); ctx.fillRect(x+cellSize-7, y+cellSize-6, es, es); }
    } else {
      const segmentAlpha = Math.max(0.3, 1 - i * 0.04);
      ctx.fillStyle = `rgba(160,255,195,${segmentAlpha})`;
      ctx.shadowColor = 'rgba(160,255,195,0.3)';
      ctx.shadowBlur = 6;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let j = 3; j < cellSize - 2; j += 4) ctx.fillRect(x + 1, y + j, cellSize - 2, 1);
    }
    ctx.shadowBlur = 0;
  });
}

function drawFood(frameTime = performance.now()) {
  const x = food.x * cellSize, y = food.y * cellSize;
  const pulse = Math.sin(frameTime / 500) * 0.15 + 0.85;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#ff6b98';
  ctx.shadowColor = 'rgba(255,107,152,0.7)';
  ctx.shadowBlur = 12;
  ctx.fillRect(x + 2, y + 8, cellSize - 4, cellSize - 10);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 0;
  ctx.fillRect(x + 2, y + 12, cellSize - 4, 2);
  ctx.shadowColor = 'rgba(255,251,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#fffb00';
  ctx.fillRect(x + cellSize/2 - 1, y + 2, 2, 6);
  ctx.fillStyle = '#ff6b98';
  ctx.fillRect(x + cellSize/2 - 2, y, 4, 3);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.5 * pulse;
  ctx.fillRect(x + 2, y + 8, cellSize - 4, 3);
  ctx.restore();
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
