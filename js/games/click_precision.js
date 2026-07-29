// =========================================================
// GAME MODULE: CLICK PRECISION (Precyzja)
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
import { getAdaptiveModifier } from '../state.js';
import { onActivate } from '../helpers.js';

export const PR_SHAPES = ['round','square','triangle','star'];
export const PR_COLORS = [
  { name:'czerwona',   hex:'#ef5350' },
  { name:'niebieska',  hex:'#42a5f5' },
  { name:'zielona',    hex:'#66bb6a' },
  { name:'żółta',      hex:'#ffca28' },
  { name:'fioletowa',  hex:'#ab47bc' },
  { name:'pomarańcz.', hex:'#ff7043' },
];
export const PR_LABELS = { round:'●', square:'■', triangle:'▲', star:'★' };
export const PR_NAMES  = { round:'koło', square:'kwadrat', triangle:'trójkąt', star:'gwiazdka' };

let prTarget = null;

export const PRECISION_CFGS = [
  { badCount: 3, lifetime: 0  },  // Łatwy
  { badCount: 4, lifetime: 4000 }, // Średni
  { badCount: 5, lifetime: 2500 }, // Trudny
];

export function startClickPrecision(cfg, levelIdx) {
  _buildPrecisionPanel();
  const instr = document.getElementById('g-instruction');
  if (instr) instr.style.display = 'none';

  const area = document.getElementById('game-area');
  initAreaMissHandlers(area);

  _pickPrecisionTarget();
  spawnPrecisionTargets(levelIdx);
  startTimer();
}

function _buildPrecisionPanel() {
  const area = document.getElementById('game-area');
  const old = document.getElementById('prec-panel');
  if (old) old.remove();

  const panel = document.createElement('div');
  panel.id = 'prec-panel';
  panel.style.cssText = [
    'position:absolute', 'left:8px', 'top:50%', 'transform:translateY(-50%)',
    'background:rgba(15,25,35,0.92)', 'border:2px solid var(--accent)',
    'border-radius:14px', 'padding:14px 10px', 'z-index:10',
    'display:flex', 'flex-direction:column', 'align-items:center', 'gap:8px',
    'min-width:72px', 'box-shadow:0 0 20px rgba(0,212,255,0.2)'
  ].join(';');
  panel.innerHTML = `
    <div style="font-size:.6rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px;text-align:center">Kliknij<br>to:</div>
    <div id="prec-icon" style="font-size:2.4rem;line-height:1"></div>
    <div id="prec-name" style="font-size:.65rem;font-weight:800;color:var(--text);text-align:center;line-height:1.3"></div>
  `;
  area.appendChild(panel);
}

function _pickPrecisionTarget() {
  const shape = PR_SHAPES[Math.floor(Math.random() * PR_SHAPES.length)];
  const color = PR_COLORS[Math.floor(Math.random() * PR_COLORS.length)];
  prTarget = { shape, color };
  _updatePrecisionPanel();
}

function _updatePrecisionPanel() {
  if (!prTarget) return;
  const icon = document.getElementById('prec-icon');
  const name = document.getElementById('prec-name');
  if (!icon || !name) return;
  icon.textContent = PR_LABELS[prTarget.shape];
  icon.style.color = prTarget.color.hex;
  icon.style.textShadow = `0 0 12px ${prTarget.color.hex}`;
  name.innerHTML = `<span style="color:${prTarget.color.hex}">${prTarget.color.name}</span><br>${PR_NAMES[prTarget.shape]}`;
}

function makeTarget(shape, color, size, pos, isGood, levelIdx) {
  const area = document.getElementById('game-area');
  const t = document.createElement('div');
  t.className = 'target ' + (shape !== 'round' ? 'target-' + shape : '');
  t.dataset.good = isGood ? '1' : '0';
  t.textContent = PR_LABELS[shape] || '';
  t.style.cssText = [
    `width:${size}px`, `height:${size}px`,
    `left:${pos.x - size/2}px`, `top:${pos.y - size/2}px`,
    `background:${color}`, `box-shadow:0 0 15px ${color}88`,
    `font-size:${size * 0.45}px`, `color:rgba(0,0,0,0.45)`,
    `line-height:${size}px`, `text-align:center`
  ].join(';');

  onActivate(t, (e) => {
    e.stopPropagation();
    if (gameData.time <= 0) return;
    const r = t.getBoundingClientRect(), ar = area.getBoundingClientRect();
    const cx = r.left - ar.left + r.width/2, cy = r.top - ar.top + r.height/2;
    if (t.dataset.good === '1' && !t._done) {
      t._done = true;
      const pts = 120 + Math.round(80 * (gameData.time / gameData.maxTime));
      addHit(cx, cy, pts);
      t.classList.add('shrinking');
      const _gs = gameSession;
      setTimeout(() => {
        t.remove();
        if (gameSession === _gs && gameData.time > 0) { _pickPrecisionTarget(); spawnPrecisionTargets(levelIdx); }
      }, 150);
    } else {
      addMiss(cx, cy);
      t.style.outline = '3px solid #ff1744';
      t.style.transform = 'scale(1.15)';
      setTimeout(() => { if (t.isConnected) { t.style.outline=''; t.style.transform=''; } }, 400);
    }
  });
  return t;
}

export function spawnPrecisionTargets(levelIdx) {
  if (gameData.time <= 0) return;
  const area = document.getElementById('game-area');
  [...area.querySelectorAll('.target')].forEach(t => t.remove());

  if (!prTarget) _pickPrecisionTarget();
  const cfg  = PRECISION_CFGS[levelIdx] || PRECISION_CFGS[0];
  const rect = area.getBoundingClientRect();
  const targets = [];

  const mod = getAdaptiveModifier('click_precision');
  const sizeFactor = mod.sizeFactor || 1.0;
  const timeFactor = mod.timeFactor || 1.0;

  const panelW = 90;
  const safeRect = { width: rect.width - panelW, height: rect.height };
  const safeOffset = panelW;

  const rawGoodSize = 58 + Math.random() * 22;
  const goodSize = Math.max(24, Math.round(rawGoodSize * sizeFactor));
  const gp = randomPos(goodSize, safeRect);
  gp.x += safeOffset;
  targets.push(makeTarget(prTarget.shape, prTarget.color.hex, goodSize, gp, true, levelIdx));

  for (let i = 0; i < cfg.badCount; i++) {
    const rawBadSize = 50 + Math.random() * 28;
    const size = Math.max(22, Math.round(rawBadSize * sizeFactor));
    const pos  = randomPos(size, safeRect);
    pos.x += safeOffset;

    let badShape, badColor;
    do { badShape = PR_SHAPES[Math.floor(Math.random() * PR_SHAPES.length)]; }
    while (badShape === prTarget.shape);

    do { badColor = PR_COLORS[Math.floor(Math.random() * PR_COLORS.length)]; }
    while (badColor.hex === prTarget.color.hex);

    const finalShape = levelIdx === 0 ? prTarget.shape : badShape;
    targets.push(makeTarget(finalShape, badColor.hex, size, pos, false, levelIdx));
  }

  targets.sort(() => Math.random() - 0.5);
  targets.forEach(t => area.appendChild(t));

  if (cfg.lifetime > 0) {
    const lifetime = Math.max(800, Math.round(cfg.lifetime * timeFactor));
    const mySession = gameSession;
    setTimeout(() => {
      if (gameSession === mySession && gameData.time > 0) {
        _pickPrecisionTarget(); spawnPrecisionTargets(levelIdx);
      }
    }, lifetime);
  }
}
