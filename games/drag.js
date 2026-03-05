// ============================================================
// games/drag.js – Przeciąganie
// ============================================================
import { startSession, stopSession, addHit, addMiss,
         getArea, getAreaRect, session,
         watchResize, unwatchResize } from '../core/engine.js';
import { showResult, showTutorial, GAMES } from '../core/ui.js';
import { recordResult } from '../core/state.js';

const ITEMS = [
  { emoji:'🍎', color:'#ef5350' },
  { emoji:'💙', color:'#42a5f5' },
  { emoji:'💚', color:'#66bb6a' },
  { emoji:'💛', color:'#ffca28' },
  { emoji:'💜', color:'#ab47bc' },
];

export function init(level) {
  const cfg = GAMES['drag'].levels[level - 1];
  showTutorial('drag', () => _startGame(cfg, level));
}

function _startGame(cfg, level) {
  const pairs = cfg.pairs ?? 3;
  const items = ITEMS.slice(0, pairs);
  const area  = getArea();
  const areaW = area.offsetWidth;
  const areaH = area.offsetHeight;

  // Drop zones – prawa strona
  items.forEach((item, i) => {
    const dz = document.createElement('div');
    dz.className = 'drop-zone';
    dz.dataset.color = item.color;
    const zW = 90, zH = 90;
    const x = areaW - 120, y = 40 + i * (zH + 20);
    dz.style.cssText = `width:${zW}px;height:${zH}px;left:${x}px;top:${y}px;border-color:${item.color}44;color:${item.color}44;font-size:2rem;line-height:${zH}px;text-align:center`;
    dz.textContent = item.emoji;
    area.appendChild(dz);
  });

  // Drag items – lewa strona (tasowane)
  [...items].sort(() => Math.random() - .5).forEach((item, i) => {
    const di = document.createElement('div');
    di.className = 'drag-item';
    di.dataset.color = item.color;
    const x = 30 + Math.random() * 120, y = 40 + i * 110;
    di.style.cssText = `left:${x}px;top:${y}px;background:${item.color}22;border-color:${item.color}`;
    di.textContent = item.emoji;
    _makeDraggable(di, area);
    area.appendChild(di);
  });

  startSession({ time: cfg.time, onTimeUp: () => _end(level) });
  _watchWin(pairs, level);
  watchResize(() => {});
}

function _makeDraggable(el, area) {
  let offX = 0, offY = 0, dragging = false;

  const move = (cx, cy) => {
    if (!dragging) return;
    const ar = area.getBoundingClientRect();
    el.style.left = (cx - ar.left - offX) + 'px';
    el.style.top  = (cy - ar.top  - offY) + 'px';
    _highlightDrop(el);
  };

  const end = (cx, cy) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    document.removeEventListener('mousemove', onMM);
    document.removeEventListener('mouseup',   onMU);
    _tryDrop(el, area, cx, cy);
  };

  const onMM = (e) => move(e.clientX, e.clientY);
  const onMU = (e) => end(e.clientX, e.clientY);

  el.addEventListener('mousedown', (e) => {
    dragging = true;
    el.classList.add('dragging');
    offX = e.offsetX; offY = e.offsetY;
    document.addEventListener('mousemove', onMM);
    document.addEventListener('mouseup',   onMU);
    e.preventDefault();
  });

  el.addEventListener('touchstart', (e) => {
    dragging = true;
    el.classList.add('dragging');
    const r = el.getBoundingClientRect();
    const t = e.touches[0];
    offX = t.clientX - r.left; offY = t.clientY - r.top;
    e.preventDefault();
  }, { passive: false });

  el.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    move(t.clientX, t.clientY);
    e.preventDefault();
  }, { passive: false });

  el.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    end(t.clientX, t.clientY);
  });
}

function _highlightDrop(el) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width/2, cy = r.top + r.height/2;
  getArea().querySelectorAll('.drop-zone').forEach(dz => {
    const dr = dz.getBoundingClientRect();
    const over = cx > dr.left && cx < dr.right && cy > dr.top && cy < dr.bottom;
    dz.classList.toggle('highlight', over && dz.dataset.color === el.dataset.color);
  });
}

function _tryDrop(el, area, cx, cy) {
  let matched = false;
  area.querySelectorAll('.drop-zone').forEach(dz => {
    dz.classList.remove('highlight');
    const dr = dz.getBoundingClientRect();
    const hit = cx > dr.left && cx < dr.right && cy > dr.top && cy < dr.bottom;
    if (hit && !matched) {
      const ar = area.getBoundingClientRect();
      if (dz.dataset.color === el.dataset.color && !dz.classList.contains('done')) {
        dz.classList.add('done');
        el.classList.add('matched');
        const pts = 150 + Math.round(100 * (session.time / session.maxTime));
        addHit(dr.left - ar.left + dr.width/2, dr.top - ar.top + dr.height/2, pts);
        matched = true;
      } else {
        addMiss(cx - ar.left, cy - ar.top);
      }
    }
  });
}

function _watchWin(total, level) {
  const iv = setInterval(() => {
    const done = getArea()?.querySelectorAll('.drop-zone.done').length ?? 0;
    if (done >= total) { clearInterval(iv); stopSession(); _end(level); }
    if (!session.running) clearInterval(iv);
  }, 200);
}

function _end(level) {
  unwatchResize();
  getArea()?.querySelectorAll('.drag-item,.drop-zone').forEach(e => e.remove());
  const { stars, acc } = recordResult({
    gameId: 'drag', level,
    score: session.score, hits: session.hits, miss: session.miss
  });
  showResult({ gameId: 'drag', level, stars, acc,
               score: session.score, hits: session.hits, miss: session.miss });
}
