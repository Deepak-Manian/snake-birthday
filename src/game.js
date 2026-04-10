import { Sounds, unlockAudio } from './sounds.js';
import { getQuoteForLevel } from './quotes.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const GRID = 20; // cells
const BASE_INTERVAL = 180; // ms at level 1

// Points needed to advance each level
function pointsForLevel(level) {
  return level * 3; // 3 food items per level
}

function intervalForLevel(level) {
  return Math.max(60, BASE_INTERVAL - (level - 1) * 4);
}

// ─── State ───────────────────────────────────────────────────────────────────
let snake, dir, nextDir, food, score, highScore, level, levelPoints;
let foodEaten, gameLoop, gameState, cellSize;
// gameState: 'idle' | 'playing' | 'paused' | 'levelup' | 'quote' | 'birthday' | 'glitch' | 'message' | 'dead'

// ─── DOM refs ────────────────────────────────────────────────────────────────
const canvas       = document.getElementById('gameCanvas');
const ctx          = canvas.getContext('2d');
const scoreEl      = document.getElementById('scoreVal');
const highScoreEl  = document.getElementById('highScoreVal');
const levelEl      = document.getElementById('levelVal');
const achieveBar   = document.getElementById('achieveBar');
const achieveText  = document.getElementById('achieveText');
const overlay      = document.getElementById('overlay');
const overlayInner = document.getElementById('overlayInner');
const quoteBox     = document.getElementById('quoteBox');
const quoteText    = document.getElementById('quoteText');
const quoteDirector= document.getElementById('quoteDirector');
const quoteFilm    = document.getElementById('quoteFilm');
const btnUp        = document.getElementById('btnUp');
const btnDown      = document.getElementById('btnDown');
const btnLeft      = document.getElementById('btnLeft');
const btnRight     = document.getElementById('btnRight');
const btnSelect    = document.getElementById('btnSelect');
const btnStart     = document.getElementById('btnStart');

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
  highScore = parseInt(localStorage.getItem('snakeHS') || '0');
  highScoreEl.textContent = fmtScore(highScore);
  gameState = 'idle';
  resizeCanvas();
  drawIdle();
  bindControls();
  window.addEventListener('resize', () => { resizeCanvas(); if (gameState !== 'playing') drawIdle(); });
}

function resizeCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, container.clientHeight || container.clientWidth);
  canvas.width = size;
  canvas.height = size;
  cellSize = Math.floor(size / GRID);
}

// ─── Game Start / Reset ───────────────────────────────────────────────────
function startGame() {
  clearInterval(gameLoop);
  snake = [
    { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  level = 1;
  levelPoints = 0;
  foodEaten = 0;
  gameState = 'playing';
  updateHUD();
  spawnFood();
  scheduleLoop();
  hideOverlay();
  hideQuote();
}

function scheduleLoop() {
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, intervalForLevel(level));
}

// ─── Tick ────────────────────────────────────────────────────────────────────
function tick() {
  if (gameState !== 'playing') return;

  dir = { ...nextDir };
  const head = { x: (snake[0].x + dir.x + GRID) % GRID, y: (snake[0].y + dir.y + GRID) % GRID };

  // Collision with self
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    die(); return;
  }

  snake.unshift(head);

  // Eat food?
  if (head.x === food.x && head.y === food.y) {
    Sounds.eat();
    score += 100 * level;
    levelPoints++;
    foodEaten++;
    updateHUD();
    if (level === 38 && levelPoints >= pointsForLevel(level)) {
      // BIRTHDAY — snake ate the cake on level 38!
      setTimeout(triggerBirthday, 200);
    } else if (level < 38 && levelPoints >= pointsForLevel(level)) {
      // Level up!
      setTimeout(triggerLevelUp, 100);
    } else {
      spawnFood();
    }
  } else {
    snake.pop();
    // subtle move sound every 3 ticks
    if (foodEaten % 3 === 0) Sounds.move();
  }

  draw();
}

// ─── Level Up Flow ────────────────────────────────────────────────────────
function triggerLevelUp() {
  clearInterval(gameLoop);
  gameState = 'levelup';
  Sounds.levelUp();

  showLevelUpBanner(level, () => {
    level++;
    levelPoints = 0;
    
    // Reset snake length so extreme growth only happens after Level 38
    snake = [
      { x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    
    updateHUD();
    const quote = getQuoteForLevel();
    
    // Hide overlay before showing quote screen
    hideOverlay();
    
    showQuote(quote, () => {
      gameState = 'playing';
      spawnFood();
      scheduleLoop();
    });
  });
}

function showLevelUpBanner(completedLevel, cb) {
  showOverlay(`
    <div class="level-up-banner">
      <div class="lu-title">LEVEL UP</div>
      <div class="lu-level">LEVEL ${completedLevel} CLEAR</div>
      <div class="lu-sub">NEXT: LEVEL ${completedLevel + 1}</div>
    </div>
  `);
  setTimeout(() => { cb(); }, 2000);
}

// ─── Birthday Sequence ─────────────────────────────────────────────────────
function triggerBirthday() {
  clearInterval(gameLoop);
  gameState = 'birthday';
  Sounds.birthday();

  // Start confetti
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

  // After 3 seconds — GLITCH TRANSITION
  setTimeout(() => {
    triggerGlitch();
  }, 3500);
}

function triggerGlitch() {
  gameState = 'glitch';
  Sounds.glitch();
  stopConfetti();

  const inner = overlayInner;
  inner.classList.add('glitching');

  // Rapid glitch frames
  let glitchCount = 0;
  const glitchInterval = setInterval(() => {
    inner.style.transform = `translate(${(Math.random()-0.5)*20}px, ${(Math.random()-0.5)*20}px) skewX(${(Math.random()-0.5)*5}deg)`;
    inner.style.filter = `hue-rotate(${Math.random()*360}deg) brightness(${0.5+Math.random()*2})`;
    glitchCount++;
    if (glitchCount > 15) {
      clearInterval(glitchInterval);
      inner.style.transform = '';
      inner.style.filter = '';
      inner.classList.remove('glitching');
      showMessage();
    }
  }, 80);
}

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
          <!-- Edit the text inside msgContent below -->
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
        <button onclick="window.continueGame()" class="btn-restart" style="background:var(--secondary); color:#000;">[ KEEP PLAYING ]</button>
        <button onclick="window.restartGame()" class="btn-restart">[ RESTART ]</button>
      </div>
    </div>
  `);

  // Type out the message
  setTimeout(() => {
    const content = document.getElementById('msgContent').textContent.trim();
    const body = document.getElementById('msgBody');
    const typed = document.getElementById('msgTyped');
    
    // First type the "command"
    const cmd = ' cat birthday_message.txt';
    let i = 0;
    const typeCmd = setInterval(() => {
      typed.textContent += cmd[i];
      i++;
      if (i >= cmd.length) {
        clearInterval(typeCmd);
        // Then show message body
        setTimeout(() => {
          body.style.display = 'block';
          typeMessage(content, body, () => {
            // Show restart button
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
    el.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (cb) cb();
    }
  }, 28);
}

// ─── Death ───────────────────────────────────────────────────────────────────
function die() {
  clearInterval(gameLoop);
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
    </div>
  `);
}

// ─── Confetti ────────────────────────────────────────────────────────────────
let confettiInterval = null;
let confettiParticles = [];

function startConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  confettiParticles = [];
  
  const colors = ['#a0ffc3', '#ff6b98', '#fffb00', '#00fc9b', '#ff6b98'];
  const sizes = [4, 8, 4, 8, 4]; // pixel squares only
  
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = `
      position: absolute;
      width: ${size}px; height: ${size}px;
      background: ${color};
      left: ${Math.random() * 100}%;
      top: -${size}px;
      opacity: ${0.6 + Math.random() * 0.4};
    `;
    container.appendChild(el);
    confettiParticles.push({
      el,
      x: parseFloat(el.style.left),
      y: -size,
      vy: 2 + Math.random() * 3,
      // No horizontal drift — 90 degree fall (design rule)
    });
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
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
}

// ─── Quote Modal ──────────────────────────────────────────────────────────────
function showQuote(quote, cb) {
  quoteText.textContent = `"${quote.text}"`;
  quoteDirector.textContent = `— ${quote.director}`;
  quoteFilm.textContent = quote.film;
  quoteBox.classList.remove('hidden');
  quoteBox.classList.add('visible');
  
  // Wait for clear user action (click/tap) to dismiss
  const dismiss = () => {
    quoteBox.classList.remove('visible');
    quoteBox.classList.add('hidden');
    
    // Re-bind click event cleanly in case they clicked
    quoteBox.removeEventListener('click', dismiss);
    document.removeEventListener('keydown', dismissKey);
    
    setTimeout(cb, 300);
  };
  
  const dismissKey = (e) => {
    if (e.key === ' ' || e.key === 'Enter') dismiss();
  };
  
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  
  ctx.fillStyle = '#a0ffc3';
  ctx.font = `bold ${Math.floor(cellSize * 0.7)}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('PRESS START', canvas.width / 2, canvas.height * 0.45);
  ctx.font = `${Math.floor(cellSize * 0.4)}px 'Press Start 2P', monospace`;
  ctx.fillStyle = '#ff6b98';
  ctx.fillText('TO PLAY', canvas.width / 2, canvas.height * 0.55);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
}

function drawGrid() {
  ctx.strokeStyle = 'rgba(160,255,195,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID; i++) {
    ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(canvas.width, i * cellSize); ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((seg, i) => {
    const isHead = i === 0;
    const x = seg.x * cellSize, y = seg.y * cellSize;
    
    if (isHead) {
      ctx.fillStyle = '#00fc9b';
      ctx.shadowColor = 'rgba(160,255,195,0.8)';
      ctx.shadowBlur = 15;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      
      // Eyes
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      const eyeSize = 3;
      // Position eyes based on direction
      if (dir.x === 1) { // Right
        ctx.fillRect(x + cellSize - 6, y + 4, eyeSize, eyeSize); // top eye
        ctx.fillRect(x + cellSize - 6, y + cellSize - 7, eyeSize, eyeSize); // bottom eye
      } else if (dir.x === -1) { // Left
        ctx.fillRect(x + 3, y + 4, eyeSize, eyeSize);
        ctx.fillRect(x + 3, y + cellSize - 7, eyeSize, eyeSize);
      } else if (dir.y === -1) { // Up
        ctx.fillRect(x + 4, y + 3, eyeSize, eyeSize);
        ctx.fillRect(x + cellSize - 7, y + 3, eyeSize, eyeSize);
      } else { // Down (default)
        ctx.fillRect(x + 4, y + cellSize - 6, eyeSize, eyeSize);
        ctx.fillRect(x + cellSize - 7, y + cellSize - 6, eyeSize, eyeSize);
      }
    } else {
      const alpha = Math.max(0.3, 1 - i * 0.04);
      ctx.fillStyle = `rgba(160,255,195,${alpha})`;
      ctx.shadowColor = 'rgba(160,255,195,0.3)';
      ctx.shadowBlur = 6;
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
      
      // Body Texture (horizontal scanlines)
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let j = 3; j < cellSize - 2; j += 4) {
        ctx.fillRect(x + 1, y + j, cellSize - 2, 1);
      }
    }
    ctx.shadowBlur = 0;
  });
}

function drawFood() {
  const x = food.x * cellSize, y = food.y * cellSize;
  const t = Date.now() / 500;
  const pulse = Math.sin(t) * 0.15 + 0.85;
  
  ctx.save();
  ctx.globalAlpha = pulse;
  
  // Birthday cake 🎂 drawn as pixels for every level
  ctx.fillStyle = '#ff6b98';
  ctx.shadowColor = 'rgba(255,107,152,0.7)';
  ctx.shadowBlur = 12;
  ctx.fillRect(x + 2, y + 8, cellSize - 4, cellSize - 10); // Base
  
  // Detail line
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 0;
  ctx.fillRect(x + 2, y + 12, cellSize - 4, 2);
  
  // Candle & Flame
  ctx.shadowColor = 'rgba(255,251,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#fffb00';
  ctx.fillRect(x + cellSize/2 - 1, y + 2, 2, 6); // candle
  ctx.fillStyle = '#ff6b98';
  ctx.fillRect(x + cellSize/2 - 2, y, 4, 3); // flame
  
  // Icing
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.5 * pulse;
  ctx.fillRect(x + 2, y + 8, cellSize - 4, 3);
  
  ctx.restore();
}

// ─── HUD Update ───────────────────────────────────────────────────────────────
function updateHUD() {
  scoreEl.textContent = fmtScore(score);
  levelEl.textContent = level > 38 ? '∞' : String(level).padStart(2, '0');
  
  if (level > 38) {
    achieveText.textContent = `INFINITE RUN — ${foodEaten} EATEN`;
    achieveBar.style.width = '100%';
    const unlockLabel = document.getElementById('nextUnlockLabel');
    if (unlockLabel) unlockLabel.textContent = 'SURVIVAL';
  } else {
    achieveText.textContent = `LVL ${level} — ${foodEaten} EATEN`;
    const pct = Math.min(100, (level / 38) * 100);
    achieveBar.style.width = pct + '%';
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
  // Keyboard
  document.addEventListener('keydown', e => {
    unlockAudio();
    handleDirection(e.key);
    if (e.key === 'Enter' || e.key === ' ') handleStart();
    if (e.key === 'Escape') handleSelect();
  });

  // D-pad buttons
  btnUp.addEventListener('click', () => { unlockAudio(); handleDirection('ArrowUp'); });
  btnDown.addEventListener('click', () => { unlockAudio(); handleDirection('ArrowDown'); });
  btnLeft.addEventListener('click', () => { unlockAudio(); handleDirection('ArrowLeft'); });
  btnRight.addEventListener('click', () => { unlockAudio(); handleDirection('ArrowRight'); });
  btnStart.addEventListener('click', () => { unlockAudio(); handleStart(); });
  btnSelect.addEventListener('click', () => { unlockAudio(); handleSelect(); });
}

function handleDirection(key) {
  if (gameState !== 'playing') return;
  const map = {
    'ArrowUp':    { x: 0,  y: -1 },
    'ArrowDown':  { x: 0,  y: 1  },
    'ArrowLeft':  { x: -1, y: 0  },
    'ArrowRight': { x: 1,  y: 0  },
    'w': { x: 0,  y: -1 },
    's': { x: 0,  y: 1  },
    'a': { x: -1, y: 0  },
    'd': { x: 1,  y: 0  },
  };
  const d = map[key];
  if (!d) return;
  // Prevent reversing
  if (d.x === -dir.x && d.y === -dir.y) return;
  nextDir = d;
}

function handleStart() {
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
    clearInterval(gameLoop);
    Sounds.pause();
    showOverlay(`<div class="pause-screen"><div class="pause-title">PAUSED</div><div class="pause-sub">PRESS SELECT TO RESUME</div></div>`);
  } else if (gameState === 'paused') {
    gameState = 'playing';
    clearInterval(gameLoop);
    scheduleLoop();
    hideOverlay();
    Sounds.resume();
  }
}

// ─── Global restart hook ──────────────────────────────────────────────────────
window.restartGame = function() {
  stopConfetti();
  hideOverlay();
  startGame();
};

window.continueGame = function() {
  stopConfetti();
  hideOverlay();
  level = 39; // Enter infinite mode
  gameState = 'playing';
  updateHUD();
  scheduleLoop();
};

// ─── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
