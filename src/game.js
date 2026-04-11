import { Sounds, unlockAudio } from './sounds.js';
import { getQuoteForLevel } from './quotes.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const GRID = 20;
const BASE_INTERVAL = 180;
const BIRTHDAY_LEVELS = 38; // levels 1–37 normal, level 38 = cake finale

function pointsForLevel(level) {
  return level * 3;
}

function intervalForLevel(level) {
  return Math.max(60, BASE_INTERVAL - (level - 1) * 4);
}

// ─── Game Mode ───────────────────────────────────────────────────────────────
// 'birthday' | 'classic' | null
let gameMode = null;

// ─── State ───────────────────────────────────────────────────────────────────
let snake, dir, nextDir, food, score, highScore, level, levelPoints;
let foodEaten, gameLoop, gameState, cellSize;
let hearts, checkpointSnake, checkpointScore, checkpointLevel;
// gameState: 'menu' | 'idle' | 'playing' | 'paused' | 'levelup' | 'quote'
//            | 'birthday' | 'glitch' | 'snakewish' | 'message' | 'dead'

// ─── DOM refs ────────────────────────────────────────────────────────────────
const canvas        = document.getElementById('gameCanvas');
const ctx           = canvas.getContext('2d');
const scoreEl       = document.getElementById('scoreVal');
const highScoreEl   = document.getElementById('highScoreVal');
const levelEl       = document.getElementById('levelVal');
const heartsEl      = document.getElementById('heartsVal');
const heartsBlock   = document.getElementById('heartsBlock');
const achieveBar    = document.getElementById('achieveBar');
const achieveText   = document.getElementById('achieveText');
const overlay       = document.getElementById('overlay');
const overlayInner  = document.getElementById('overlayInner');
const quoteBox      = document.getElementById('quoteBox');
const quoteText     = document.getElementById('quoteText');
const quoteDirector = document.getElementById('quoteDirector');
const quoteFilm     = document.getElementById('quoteFilm');
const btnUp         = document.getElementById('btnUp');
const btnDown       = document.getElementById('btnDown');
const btnLeft       = document.getElementById('btnLeft');
const btnRight      = document.getElementById('btnRight');
const btnSelect     = document.getElementById('btnSelect');
const btnStart      = document.getElementById('btnStart');

// ─── Init ─────────────────────────────────────────────────────────────────
function init() {
  highScore = parseInt(localStorage.getItem('snakeHS') || '0');
  highScoreEl.textContent = fmtScore(highScore);
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
  cellSize = Math.floor(size / GRID);
}

// ─── Mode Selection ───────────────────────────────────────────────────────
const modeModal = document.getElementById('modeSelectModal');

function showModeSelect() {
  gameState = 'menu';
  if (heartsBlock) heartsBlock.style.display = 'none';
  if (modeModal) modeModal.classList.remove('hidden');
  drawIdle();
}

window.selectMode = function(mode) {
  unlockAudio();
  Sounds.select();
  gameMode = mode;
  if (modeModal) modeModal.classList.add('hidden');
  if (heartsBlock) heartsBlock.style.display = mode === 'classic' ? 'flex' : 'none';
  gameState = 'idle';
  drawIdle();
};

// ─── Game Start / Reset ───────────────────────────────────────────────────
function startGame() {
  clearInterval(gameLoop);
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  dir      = { x: 1, y: 0 };
  nextDir  = { x: 1, y: 0 };
  score       = 0;
  level       = 1;
  levelPoints = 0;
  foodEaten   = 0;

  if (gameMode === 'classic') {
    hearts          = 3;
    checkpointSnake = null;
    checkpointScore = 0;
    checkpointLevel = 1;
    updateHeartsDisplay();
  }

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
  const head = {
    x: (snake[0].x + dir.x + GRID) % GRID,
    y: (snake[0].y + dir.y + GRID) % GRID
  };

  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    gameMode === 'classic' ? loseHeart() : die();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    Sounds.eat();
    score += 100 * level;
    levelPoints++;
    foodEaten++;
    snake.pop(); // snake never grows until infinite mode

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

    if (gameMode === 'classic') {
      // Save checkpoint at entry of new level
      checkpointSnake  = snake.map(s => ({ ...s }));
      checkpointScore  = score;
      checkpointLevel  = level;
      hearts = 3;
      updateHeartsDisplay();
    }

    updateHUD();
    hideOverlay();

    if (gameMode === 'classic') {
      const quote = getQuoteForLevel();
      showQuote(quote, () => {
        gameState = 'playing';
        spawnFood();
        scheduleLoop();
      });
    } else {
      // Birthday mode — no quotes, immediately continue
      gameState = 'playing';
      spawnFood();
      scheduleLoop();
    }
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
  setTimeout(cb, 2000);
}

// ─── Classic: Hearts / Respawn ────────────────────────────────────────────
function loseHeart() {
  clearInterval(gameLoop);
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
      <button onclick="window.backToMenu()" class="btn-restart" style="background:var(--surface-top);color:var(--primary);margin-top:8px;">[ CHANGE MODE ]</button>
    </div>
  `);
}

// ─── Birthday Sequence ─────────────────────────────────────────────────────
function triggerBirthday() {
  clearInterval(gameLoop);
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

  const unlockLabel = document.getElementById('nextUnlockLabel');

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

      document.querySelectorAll('.milestone').forEach(m => {
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

    document.querySelectorAll('.milestone').forEach(m => {
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
  document.addEventListener('keydown', e => {
    unlockAudio();
    handleDirection(e.key);
    if (e.key === 'Enter' || e.key === ' ') handleStart();
    if (e.key === 'Escape') handleSelect();
  });
  btnUp.addEventListener('click',     () => { unlockAudio(); handleDirection('ArrowUp'); });
  btnDown.addEventListener('click',   () => { unlockAudio(); handleDirection('ArrowDown'); });
  btnLeft.addEventListener('click',   () => { unlockAudio(); handleDirection('ArrowLeft'); });
  btnRight.addEventListener('click',  () => { unlockAudio(); handleDirection('ArrowRight'); });
  btnStart.addEventListener('click',  () => { unlockAudio(); handleStart(); });
  btnSelect.addEventListener('click', () => { unlockAudio(); handleSelect(); });
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
    clearInterval(gameLoop);
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
  clearInterval(gameLoop);
  hideOverlay();
  hideQuote();
  gameMode = null;
  gameState = 'menu';
  if (heartsBlock) heartsBlock.style.display = 'none';
  if (modeModal) modeModal.classList.remove('hidden');
  drawIdle();
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
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      const es = 3;
      if      (dir.x ===  1) { ctx.fillRect(x+cellSize-6, y+4, es, es); ctx.fillRect(x+cellSize-6, y+cellSize-7, es, es); }
      else if (dir.x === -1) { ctx.fillRect(x+3, y+4, es, es);         ctx.fillRect(x+3, y+cellSize-7, es, es); }
      else if (dir.y === -1) { ctx.fillRect(x+4, y+3, es, es);         ctx.fillRect(x+cellSize-7, y+3, es, es); }
      else                   { ctx.fillRect(x+4, y+cellSize-6, es, es); ctx.fillRect(x+cellSize-7, y+cellSize-6, es, es); }
    } else {
      const alpha = Math.max(0.3, 1 - i * 0.04);
      ctx.fillStyle = `rgba(160,255,195,${alpha})`;
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

function drawFood() {
  const x = food.x * cellSize, y = food.y * cellSize;
  const pulse = Math.sin(Date.now() / 500) * 0.15 + 0.85;
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
