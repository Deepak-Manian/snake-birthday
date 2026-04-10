// Web Audio API sound engine — zero external dependencies, works on Cloudflare Pages

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep({ frequency = 440, type = 'square', duration = 0.1, volume = 0.3, decay = true }) {
  try {
    const ac = getCtx();
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

export const Sounds = {
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
export function unlockAudio() {
  try {
    const ac = getCtx();
    if (ac.state === 'suspended') ac.resume();
  } catch(e) {}
}
