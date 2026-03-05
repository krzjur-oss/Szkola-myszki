// ============================================================
// games/double-click.js – Podwójne kliknięcie
// ============================================================
import { startSession, addHit, addMiss,
         getArea, getAreaRect, randomPos, onActivate, session,
         watchResize, unwatchResize } from '../core/engine.js';
import { showResult, showTutorial, GAMES } from '../core/ui.js';
import { recordResult } from '../core/state.js';

export function init(level) {
  const cfg = GAMES['double-click'].levels[level - 1];
  showTutorial('double-click', () => _startGame(cfg, level));
}

function _startGame(cfg, level) {
  const area = getArea();
  area.addEventListener('click', (e) => {
    if (!session.running) return;
    const a = getArea();
    if (e.target === a) {
      const x = e.offsetX ?? e.clientX - a.getBoundingClientRect().left;
      const y = e.offsetY ?? e.clientY - a.getBoundingClientRect().top;
      if (!isNaN(x)) addMiss(x, y);
    }
  });
  startSession({ time: cfg.time, onTimeUp: () => _end(level) });
  _spawnTarget(cfg, level);
  watchResize(() => {});
}

function _spawnTarget(cfg, level) {
  if (!session.running) return;
  const area  = getArea();
  area.querySelectorAll('.target').forEach(t => t.remove());
  const minS  = cfg.minSize ?? 55, maxS = cfg.maxSize ?? 85;
  const size  = minS + Math.random() * (maxS - minS);
  const rect  = getAreaRect();
  const pos   = randomPos(size, rect);

  const t = document.createElement('div');
  t.className = 'target';
  t.style.cssText = [
    `width:${size}px`,`height:${size}px`,
    `left:${pos.x-size/2}px`,`top:${pos.y-size/2}px`,
    `background:#5c6bc0`,`border:3px solid #7986cb`,
    `box-shadow:0 0 25px #5c6bc055`,
    `font-size:${size*.35}px`,`font-family:'Fredoka One',cursive`,
    `color:#fff`,`line-height:${size}px`,`text-align:center`
  ].join(';');
  t.textContent = '2×';

  let clicks = 0, clickTimer = null;
  onActivate(t, (e) => {
    e.stopPropagation();
    if (!session.running) return;
    clicks++;
    if (clickTimer) clearTimeout(clickTimer);
    if (clicks >= 2) {
      clicks = 0;
      const r = t.getBoundingClientRect(), ar = getAreaRect();
      const pts = 120 + Math.round(80 * (session.time / session.maxTime));
      addHit(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2, pts);
      t.classList.add('shrinking');
      setTimeout(() => { t.remove(); _spawnTarget(cfg, level); }, 150);
    } else {
      clickTimer = setTimeout(() => {
        if (!session.running) { clicks = 0; return; }
        const r = t.getBoundingClientRect(), ar = getAreaRect();
        addMiss(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2);
        clicks = 0;
      }, 500);
    }
  });

  area.appendChild(t);
  const lifetime = 3000 + size * 20;
  setTimeout(() => {
    if (t.parentNode && session.running) { t.remove(); _spawnTarget(cfg, level); }
    else if (t.parentNode) t.remove();
  }, lifetime);
}

function _end(level) {
  unwatchResize();
  getArea()?.querySelectorAll('.target').forEach(t => t.remove());
  const { stars, acc } = recordResult({
    gameId: 'double-click', level,
    score: session.score, hits: session.hits, miss: session.miss
  });
  showResult({ gameId: 'double-click', level, stars, acc,
               score: session.score, hits: session.hits, miss: session.miss });
}
