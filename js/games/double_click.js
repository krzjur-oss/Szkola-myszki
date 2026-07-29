// =========================================================
// GAME MODULE: DOUBLE CLICK (Podwójne kliknięcie)
// =========================================================
import {
  gameData,
  gameSession,
  addHit,
  addMiss,
  randomPos,
  initAreaMissHandlers,
  startTimer
} from '../engine.js';
import { onActivate } from '../helpers.js';

export const DOUBLE_CFGS = [
  { minSize:70, maxSize:92, mix:false, ratio:1.0, lifetime:3500, time:40 },
  { minSize:52, maxSize:74, mix:true,  ratio:0.6, lifetime:2800, time:35 },
  { minSize:38, maxSize:58, mix:true,  ratio:0.5, lifetime:2000, time:28 },
];

export function startDoubleClick(cfg) {
  const area = document.getElementById('game-area');
  initAreaMissHandlers(area);
  spawnDoubleTarget(cfg);
  startTimer();
}

export function spawnDoubleTarget(cfg) {
  if (gameData.time <= 0) return;
  const area = document.getElementById('game-area');
  [...area.querySelectorAll('.target')].forEach(t => t.remove());

  const isDouble = !cfg.mix || Math.random() < cfg.ratio;
  const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
  const rect = area.getBoundingClientRect();
  const pos  = randomPos(size, rect);

  const t = document.createElement('div');
  t.className = 'target';

  if (isDouble) {
    t.style.cssText = [
      `width:${size}px`, `height:${size}px`,
      `left:${pos.x - size/2}px`, `top:${pos.y - size/2}px`,
      `background:#5c6bc0`, `border:3px solid #9fa8da`,
      `box-shadow:0 0 25px #5c6bc055`,
      `font-size:${size * 0.32}px`, `font-family:'Fredoka One',cursive`,
      `color:#fff`, `line-height:${size}px`, `text-align:center`
    ].join(';');
    t.textContent = '2×';

    let clicks = 0, clickTimeout = null, dcDone = false;
    onActivate(t, (e) => {
      e.stopPropagation();
      if (gameData.time <= 0 || dcDone) return;
      clicks++;
      if (clickTimeout) clearTimeout(clickTimeout);
      if (clicks >= 2) {
        dcDone = true; t._done = true; clicks = 0;
        const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
        const pts = 150 + Math.round(80 * (gameData.time / gameData.maxTime));
        addHit(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2, pts, 'double');
        t.classList.add('shrinking');
        const _gs1 = gameSession;
        setTimeout(() => { t.remove(); if (gameSession === _gs1 && gameData.time > 0) spawnDoubleTarget(cfg); }, 150);
      } else {
        clickTimeout = setTimeout(() => {
          const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
          if (ar.width) addMiss(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2);
          clicks = 0;
        }, 500);
      }
    });
  } else {
    const colors = ['#00e676','#ffd740','#ff4081','#ff7043'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    t.style.cssText = [
      `width:${size}px`, `height:${size}px`,
      `left:${pos.x - size/2}px`, `top:${pos.y - size/2}px`,
      `background:${col}`, `border:3px solid rgba(255,255,255,0.3)`,
      `box-shadow:0 0 20px ${col}55`,
      `font-size:${size * 0.32}px`, `font-family:'Fredoka One',cursive`,
      `color:#000`, `line-height:${size}px`, `text-align:center`
    ].join(';');
    t.textContent = '1×';

    let scDone = false;
    onActivate(t, (e) => {
      e.stopPropagation();
      if (gameData.time <= 0 || scDone) return;
      scDone = true; t._done = true;
      const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
      const pts = 100 + Math.round(60 * (gameData.time / gameData.maxTime));
      addHit(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2, pts);
      t.classList.add('shrinking');
      const _gs2 = gameSession;
      setTimeout(() => { t.remove(); if (gameSession === _gs2 && gameData.time > 0) spawnDoubleTarget(cfg); }, 150);
    });
  }

  area.appendChild(t);

  const _gsdc = gameSession;
  setTimeout(() => {
    if (t.parentNode && gameSession === _gsdc && gameData.time > 0 && !t._done) {
      t._done = true;
      const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
      addMiss(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2);
      t.remove();
      spawnDoubleTarget(cfg);
    } else if (t.parentNode) t.remove();
  }, cfg.lifetime);
}
