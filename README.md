# 🎂 PLAYER_ONE — Birthday Snake Game

A custom Snake game built as a birthday gift. The player navigates through 37 levels to unlock a birthday surprise.

---

## 🚀 Deploy to Cloudflare Pages

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click **"Create a project"** → **"Upload assets"** (direct upload)
3. Drag the **entire `snake-birthday` folder** (all files inside it)
4. Give it a project name (e.g. `player-one-birthday`)
5. Click **Deploy**
6. Share the link — it'll be something like `player-one-birthday.pages.dev`

That's it. No build step needed. Pure static files.

---

## ✏️ Add Your Personal Message

Open `src/game.js` and find this section (around line 130):

```javascript
<div id="msgContent" style="display:none;">
YOUR MESSAGE GOES HERE.

Write whatever you want to tell them.
This will appear letter by letter, like a terminal output.

Make it count — they played 37 levels to get here.
</div>
```

Replace the text between the `<div id="msgContent">` tags with your actual message.
It will type out letter-by-letter like a terminal, so write it as plain text — line breaks are preserved.

Example:
```
Hey, you actually made it to level 37.

I'm not surprised. You've always been the kind of person
who sees things through.

37 years of being exactly who you are —
stubborn, curious, and quietly brilliant.

Happy Birthday. Here's to 37 more levels.

— [Your name]
```

---

## 🎮 How the Game Works

- **Levels 1–36**: Normal Snake. Eat 3× level food items to advance.
- After each level: A quote from a Tamil director (Myskin / Thiyagaraja Kumararaja / Ram) slides up.
- **Level 37**: The food becomes a birthday cake 🎂. Eat it to trigger the celebration.
- After reaching level 37:
  1. Birthday explosion with pixel confetti
  2. 3-second pause → glitch transition
  3. Terminal message from you types out

## Controls
- **Arrow keys** / WASD (keyboard)
- **D-pad buttons** (touch/mobile)
- **START** = Start game / Resume
- **SELECT** = Pause / Unpause

---

## File Structure
```
snake-birthday/
├── index.html          ← Main entry point
├── _redirects          ← Cloudflare routing
├── _headers            ← MIME type headers
├── src/
│   ├── style.css       ← All styles + animations
│   ├── game.js         ← Game engine (edit message here)
│   ├── sounds.js       ← Web Audio sound effects
│   └── quotes.js       ← Tamil director quotes
└── README.md
```
