// ============================================================
// games/click-basic.js – Kliknij cel!
// ============================================================
import { startSession, stopSession, addHit, addMiss,
         getArea, getAreaRect, randomPos, onActivate, session,
         watchResize, unwatchResize } from '../core/engine.js';
import { showResult, showTutorial, GAMES } from '../core/ui.js';
import { recordResult } from '../core/state.js';
import { navigate } from '../core/router.js';

export function init(level) {
  const cfg = GAMES['click-basic'].levels[level - 1];

  showTutorial('click-basic', () => _startGame(cfg, level));
}

function _startGame(cfg, level) {
  const area = getArea();

  // Miss na puste miejsce
  area.addEventListener('click', _onAreaClick);
  area.addEventListener('touchend', _onAreaTouch, { passive: false });

  startSession({
    time: cfg.time,
    onTimeUp: () => _end(level)
  });

  _spawnTarget(cfg);
  watchResize(() => {}); // targets relocate naturally when area resizes
}

function _onAreaClick(e) {
  if (!session.running) return;
  if (e.target === getArea()) addMiss(e.offsetX, e.offsetY);
}

function _onAreaTouch(e) {
  if (!session.running) return;
  if (e.target === getArea()) {
    e.preventDefault();
    const area = getArea();
    const r = area.getBoundingClientRect();
    const t = e.changedTouches[0];
    addMiss(t.clientX - r.left, t.clientY - r.top);
  }
}

function _spawnTarget(cfg) {
  if (!session.running) return;
  const area  = getArea();
  const rect  = getAreaRect();
  const minS  = cfg.minSize ?? 40, maxS = cfg.maxSize ?? 80;
  const size  = minS + Math.random() * (maxS - minS);
  const pos   = randomPos(size, rect);
  const colors = ['#00d4ff','#00e676','#ffd740','#ff4081','#d500f9','#ff6d00'];
  const col   = colors[Math.floor(Math.random() * colors.length)];

  const t = document.createElement('div');
  t.className = 'target';
  t.style.cssText = `width:${size}px;height:${size}px;left:${pos.x-size/2}px;top:${pos.y-size/2}px;background:${col};box-shadow:0 0 20px ${col}55;line-height:${size}px;text-align:center;font-size:${size*.4}px`;
  t.textContent = ['🎯','⭐','💎','🔵'][Math.floor(Math.random()*4)];

  onActivate(t, (e) => {
    e.stopPropagation();
    if (!session.running) return;
    const r  = t.getBoundingClientRect(), ar = getAreaRect();
    const cx = r.left - ar.left + r.width/2, cy = r.top - ar.top + r.height/2;
    const base  = Math.round(150 * (80 / Math.max(size, 20)));
    const speed = Math.round(50 * (session.time / session.maxTime));
    addHit(cx, cy, Math.max(50, Math.min(base + speed, 300)));
    t.classList.add('shrinking');
    setTimeout(() => { t.remove(); _spawnTarget(cfg); }, 150);
  });

  area.appendChild(t);

  // Auto-remove if not clicked
  const lifetime = 1200 + size * 15;
  setTimeout(() => {
    if (t.parentNode && session.running) {
      const r = t.getBoundingClientRect(), ar = getAreaRect();
      addMiss(r.left - ar.left + r.width/2, r.top - ar.top + r.height/2);
      t.remove();
      _spawnTarget(cfg);
    } else if (t.parentNode) {
      t.remove();
    }
  }, lifetime);
}

function _end(level) {
  unwatchResize();
  const area = getArea();
  area?.removeEventListener('click', _onAreaClick);
  area?.removeEventListener('touchend', _onAreaTouch);
  area?.querySelectorAll('.target').forEach(t => t.remove());

  const { stars, acc } = recordResult({
    gameId: 'click-basic', level,
    score: session.score, hits: session.hits, miss: session.miss
  });
  showResult({ gameId: 'click-basic', level, stars, acc,
               score: session.score, hits: session.hits, miss: session.miss });
}
