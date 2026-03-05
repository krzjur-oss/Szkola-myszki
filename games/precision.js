// ============================================================
// games/precision.js – Precyzja
// ============================================================
import { startSession, stopSession, addHit, addMiss,
         getArea, getAreaRect, randomPos, onActivate, session,
         watchResize, unwatchResize } from '../core/engine.js';
import { showResult, showTutorial, GAMES } from '../core/ui.js';
import { recordResult } from '../core/state.js';

const LEVELS = [
  {
    instruction: 'Kliknij TYLKO ★ gwiazdki! Ignoruj koła i kwadraty.',
    goodShape: 'star', goodColor: null,
    badShapes: ['round','square','triangle'],
    badColors: ['#00d4ff','#ff4081','#d500f9','#ff6d00'],
    goodCount: 1, badCount: 3,
  },
  {
    instruction: 'Kliknij TYLKO 🟢 zielone kształty! Ignoruj inne kolory.',
    goodShape: null, goodColor: '#00e676',
    badShapes: ['round','star','square','triangle'],
    badColors: ['#00d4ff','#ffd740','#ff4081','#d500f9'],
    goodCount: 1, badCount: 4,
  },
  {
    instruction: 'Kliknij TYLKO 🔵 niebieskie koła! Reszta to pułapki.',
    goodShape: 'round', goodColor: '#00d4ff',
    badShapes: ['star','square','triangle'],
    badColors: ['#00e676','#ffd740','#ff4081','#d500f9'],
    goodCount: 1, badCount: 5,
  },
];

const LABELS = { star:'★', square:'■', triangle:'▲', round:'●' };

export function init(level) {
  const cfg = GAMES['precision'].levels[level - 1];
  showTutorial('precision', () => _startGame(cfg, level));
}

function _startGame(cfg, level) {
  const lvl  = LEVELS[level - 1];
  const area = getArea();
  area.addEventListener('click', (e) => {
    if (!session.running) return;
    if (e.target === area) {
      const x = e.offsetX ?? e.clientX - area.getBoundingClientRect().left;
      const y = e.offsetY ?? e.clientY - area.getBoundingClientRect().top;
      if (!isNaN(x)) addMiss(x, y);
    }
  });

  startSession({ time: cfg.time, onTimeUp: () => _end(level) });
  document.getElementById('g-instruction').textContent = lvl.instruction;
  _spawn(lvl, level);
  watchResize(() => {});
}

function _spawn(lvl, level) {
  if (!session.running) return;
  const area = getArea();
  area.querySelectorAll('.target').forEach(t => t.remove());
  const rect = getAreaRect();

  const makeT = (shape, color, isGood) => {
    const size = 52 + Math.random() * 26;
    const pos  = randomPos(size, rect);
    const t    = document.createElement('div');
    t.className = 'target' + (shape !== 'round' ? ' target-' + shape : '');
    t.style.cssText = [
      `width:${size}px`,`height:${size}px`,
      `left:${pos.x-size/2}px`,`top:${pos.y-size/2}px`,
      `background:${color}`,`box-shadow:0 0 15px ${color}88`,
      `font-size:${size*.45}px`,`line-height:${size}px`,`text-align:center`,
      `color:rgba(0,0,0,0.45)`
    ].join(';');
    t.textContent = LABELS[shape] ?? '';

    onActivate(t, (e) => {
      e.stopPropagation();
      if (!session.running) return;
      const r = t.getBoundingClientRect(), ar = getAreaRect();
      const cx = r.left - ar.left + r.width/2, cy = r.top - ar.top + r.height/2;
      if (isGood) {
        const pts = 100 + Math.round(80 * (session.time / session.maxTime));
        addHit(cx, cy, pts);
        t.classList.add('shrinking');
        setTimeout(() => { t.remove(); _spawn(lvl, level); }, 150);
      } else {
        addMiss(cx, cy);
        t.style.outline = '3px solid #ff1744';
        t.style.transform = 'scale(1.15)';
        setTimeout(() => { if (t.isConnected) { t.style.outline=''; t.style.transform=''; }}, 400);
      }
    });
    return t;
  };

  const all = [];
  for (let i = 0; i < lvl.goodCount; i++) {
    const shape = lvl.goodShape ?? lvl.badShapes[Math.floor(Math.random()*lvl.badShapes.length)];
    const color = lvl.goodColor ?? '#00e676';
    all.push(makeT(shape, color, true));
  }
  for (let i = 0; i < lvl.badCount; i++) {
    const shape = lvl.goodShape
      ? lvl.badShapes[Math.floor(Math.random()*lvl.badShapes.length)]
      : lvl.badShapes[Math.floor(Math.random()*lvl.badShapes.length)];
    const color = lvl.badColors[Math.floor(Math.random()*lvl.badColors.length)];
    all.push(makeT(shape, color, false));
  }
  all.sort(() => Math.random() - .5).forEach(t => area.appendChild(t));
}

function _end(level) {
  unwatchResize();
  getArea()?.querySelectorAll('.target').forEach(t => t.remove());
  const { stars, acc } = recordResult({
    gameId: 'precision', level,
    score: session.score, hits: session.hits, miss: session.miss
  });
  showResult({ gameId: 'precision', level, stars, acc,
               score: session.score, hits: session.hits, miss: session.miss });
}
