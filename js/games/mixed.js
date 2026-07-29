// =========================================================
// GAME MODULE: MIXED (Wyzwanie / Miks)
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

let mixedRoundCount = 0;

export function startMixed(cfg, levelIdx) {
  mixedRoundCount = 0;
  const area = document.getElementById('game-area');
  initAreaMissHandlers(area);
  spawnMixed(levelIdx);
  startTimer();
}

function pickMixedType(levelIdx) {
  mixedRoundCount++;
  if (levelIdx === 0) {
    return mixedRoundCount % 2 === 0 ? 'double' : 'single';
  }
  if (mixedRoundCount % 3 === 0) return 'precision';
  return mixedRoundCount % 3 === 1 ? 'single' : 'double';
}

export function spawnMixed(levelIdx) {
  if (gameData.time <= 0) return;
  const area = document.getElementById('game-area');
  [...area.querySelectorAll('.target')].forEach(t => t.remove());

  const type = pickMixedType(levelIdx);
  const rect = area.getBoundingClientRect();

  if (type === 'precision') {
    let precDone = false;

    const goodSize = 65 + Math.random() * 20;
    const goodPos  = randomPos(goodSize, rect);
    const good = document.createElement('div');
    good.className = 'target';
    good.style.cssText = [
      `width:${goodSize}px`, `height:${goodSize}px`,
      `left:${goodPos.x - goodSize/2}px`, `top:${goodPos.y - goodSize/2}px`,
      `background:#ffd740`, `box-shadow:0 0 22px #ffd74099`,
      `font-size:${goodSize * 0.5}px`, `font-family:'Fredoka One',cursive`,
      `color:#000`, `line-height:${goodSize}px`, `text-align:center`,
    ].join(';');
    good.textContent = '★';

    onActivate(good, (e) => {
      e.stopPropagation();
      if (precDone) return;
      precDone = true;
      const r = good.getBoundingClientRect(), ar = area.getBoundingClientRect();
      addHit(r.left - ar.left + r.width/2, r.top - ar.top + r.height/2, 160);
      [...area.querySelectorAll('.target')].forEach(t => { t.classList.add('shrinking'); });
      const _gsMxPH = gameSession;
      setTimeout(() => {
        [...area.querySelectorAll('.target')].forEach(t => t.remove());
        if (gameSession === _gsMxPH && gameData.time > 0) spawnMixed(levelIdx);
      }, 150);
    });
    area.appendChild(good);

    const bads = [
      { shape: 'square',   color: '#ff4081' },
      { shape: 'triangle', color: '#d500f9' },
    ];
    bads.forEach(bad => {
      const bSize = 58 + Math.random() * 18;
      const bPos  = randomPos(bSize, rect);
      const b = document.createElement('div');
      b.className = 'target target-' + bad.shape;
      b.style.cssText = [
        `width:${bSize}px`, `height:${bSize}px`,
        `left:${bPos.x - bSize/2}px`, `top:${bPos.y - bSize/2}px`,
        `background:${bad.color}`, `box-shadow:0 0 14px ${bad.color}88`,
        `font-size:${bSize * 0.4}px`, `color:rgba(0,0,0,0.45)`,
        `line-height:${bSize}px`, `text-align:center`,
      ].join(';');
      b.textContent = bad.shape === 'square' ? '■' : '▲';
      onActivate(b, (e) => {
        e.stopPropagation();
        const r = b.getBoundingClientRect(), ar = area.getBoundingClientRect();
        addMiss(r.left - ar.left + r.width/2, r.top - ar.top + r.height/2);
        b.style.outline = '3px solid #ff1744';
        b.style.transform = 'scale(1.15)';
        setTimeout(() => { if (b.isConnected) { b.style.outline = ''; b.style.transform = ''; } }, 400);
      });
      area.appendChild(b);
    });

    const _gsMxPT = gameSession;
    setTimeout(() => {
      if (precDone || gameSession !== _gsMxPT) return;
      precDone = true;
      [...area.querySelectorAll('.target')].forEach(t => t.remove());
      if (gameData.time > 0) spawnMixed(levelIdx);
    }, 4000);

    return;
  }

  if (type === 'single') {
    const size = 65 + Math.random() * 28;
    const pos  = randomPos(size, rect);
    const t = document.createElement('div');
    t.className = 'target';
    t.style.cssText = [
      `width:${size}px`, `height:${size}px`,
      `left:${pos.x - size/2}px`, `top:${pos.y - size/2}px`,
      `background:#00e676`, `box-shadow:0 0 20px #00e67688`,
      `font-size:${size * 0.38}px`, `font-family:'Fredoka One',cursive`,
      `color:#000`, `line-height:${size}px`, `text-align:center`,
    ].join(';');
    t.textContent = '1×';
    let mxsDone = false;
    onActivate(t, (e) => {
      e.stopPropagation();
      if (mxsDone) return; mxsDone = true;
      const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
      addHit(r.left - ar.left + r.width/2, r.top - ar.top + r.height/2, 120);
      t.classList.add('shrinking');
      const _gsMxSH = gameSession;
      setTimeout(() => { t.remove(); if (gameSession === _gsMxSH && gameData.time > 0) spawnMixed(levelIdx); }, 150);
    });
    area.appendChild(t);
    const _gsMxS = gameSession;
    setTimeout(() => {
      if (t.parentNode && gameSession === _gsMxS && !mxsDone) {
        mxsDone = true;
        t.remove();
        if (gameData.time > 0) spawnMixed(levelIdx);
      } else if (t.parentNode) t.remove();
    }, 3500);
    return;
  }

  const size = 65 + Math.random() * 28;
  const pos  = randomPos(size, rect);
  const t = document.createElement('div');
  t.className = 'target';
  t.style.cssText = [
    `width:${size}px`, `height:${size}px`,
    `left:${pos.x - size/2}px`, `top:${pos.y - size/2}px`,
    `background:#42a5f5`, `box-shadow:0 0 20px #42a5f588`,
    `font-size:${size * 0.38}px`, `font-family:'Fredoka One',cursive`,
    `color:#000`, `line-height:${size}px`, `text-align:center`,
  ].join(';');
  t.textContent = '2×';
  let clicks = 0, ct = null, mxdDone = false;
  onActivate(t, (e) => {
    e.stopPropagation();
    if (mxdDone) return;
    const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
    const cx = r.left - ar.left + r.width/2, cy = r.top - ar.top + r.height/2;
    clicks++;
    if (ct) clearTimeout(ct);
    if (clicks >= 2) {
      mxdDone = true; clicks = 0;
      addHit(cx, cy, 180);
      t.classList.add('shrinking');
      const _gsMxDH = gameSession;
      setTimeout(() => { t.remove(); if (gameSession === _gsMxDH && gameData.time > 0) spawnMixed(levelIdx); }, 150);
    } else {
      ct = setTimeout(() => { addMiss(cx, cy); clicks = 0; }, 500);
    }
  });
  area.appendChild(t);
  const _gsMxD = gameSession;
  setTimeout(() => {
    if (t.parentNode && gameSession === _gsMxD && !mxdDone) {
      mxdDone = true;
      t.remove();
      if (gameData.time > 0) spawnMixed(levelIdx);
    } else if (t.parentNode) t.remove();
  }, 3500);
}
