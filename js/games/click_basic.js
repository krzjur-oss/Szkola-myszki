// =========================================================
// GAME MODULE: CLICK BASIC (Jednym kliknięciem)
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

export const CLICK_BASIC_CFGS = [
  { minSize:65, maxSize:95, lifetime:2200, time:40 },  // Łatwy
  { minSize:42, maxSize:68, lifetime:1400, time:30 },  // Średni
  { minSize:28, maxSize:48, lifetime:900,  time:25 },  // Trudny
];

export function startClickBasic(cfg) {
  const area = document.getElementById('game-area');
  initAreaMissHandlers(area);
  spawnTarget_basic(cfg);
  startTimer();
}

export function spawnTarget_basic(cfg) {
  if (gameData.time <= 0) return;
  const area = document.getElementById('game-area');
  const rect = area.getBoundingClientRect();
  const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
  const pos  = randomPos(size, rect);
  const colors = ['#00d4ff','#00e676','#ffd740','#ff4081','#d500f9','#ff6d00'];
  const col  = colors[Math.floor(Math.random() * colors.length)];
  const icons = ['🎯','⭐','💎','🔵','🟠','🟣'];

  const t = document.createElement('div');
  t.className = 'target';
  t.style.cssText = [
    `width:${size}px`, `height:${size}px`,
    `left:${pos.x - size/2}px`, `top:${pos.y - size/2}px`,
    `background:${col}`, `box-shadow:0 0 20px ${col}55`,
    `font-size:${size * 0.45}px`, `line-height:${size}px`, `text-align:center`
  ].join(';');
  t.textContent = icons[Math.floor(Math.random() * icons.length)];

  let cbDone = false;
  onActivate(t, (e) => {
    e.stopPropagation();
    if (gameData.time <= 0 || cbDone) return;
    cbDone = true;
    const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
    const cx = r.left - ar.left + r.width/2, cy = r.top - ar.top + r.height/2;
    const pts = Math.round(80 * (80 / Math.max(size, 20)) + (gameData.time / gameData.maxTime) * 60);
    addHit(cx, cy, Math.max(30, Math.min(pts, 250)));
    t.classList.add('shrinking');
    setTimeout(() => { t.remove(); if (gameData.time > 0) spawnTarget_basic(cfg); }, 150);
  });

  area.appendChild(t);

  const _gscb = gameSession;
  setTimeout(() => {
    if (t.parentNode && gameSession === _gscb && gameData.time > 0 && !cbDone) {
      cbDone = true;
      const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
      addMiss(r.left - ar.left + r.width/2, r.top - ar.top + r.height/2);
      t.remove();
      spawnTarget_basic(cfg);
    } else if (t.parentNode) t.remove();
  }, cfg.lifetime);
}
