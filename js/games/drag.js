// =========================================================
// GAME MODULE: DRAG & DROP (Przeciąganie)
// =========================================================
import {
  gameData,
  gameTimer,
  gameSession,
  addHit,
  addMiss,
  startTimer,
  endGame
} from '../engine.js';
import { getAdaptiveModifier } from '../state.js';
import { SoundFX } from '../sound.js';

export const DRAG_ITEMS = [
  { emoji: '🍎', color: '#ef5350', label: 'czerwone' },
  { emoji: '💙', color: '#42a5f5', label: 'niebieskie' },
  { emoji: '💚', color: '#66bb6a', label: 'zielone' },
  { emoji: '💛', color: '#ffca28', label: 'żółte' },
  { emoji: '💜', color: '#ab47bc', label: 'fioletowe' },
];

export function startDrag(cfg, levelIdx) {
  if (gameTimer) clearInterval(gameTimer);
  const area = document.getElementById('game-area');
  const pairs = cfg.pairs;
  const items = DRAG_ITEMS.slice(0, pairs);

  const mod = getAdaptiveModifier('drag');
  const sizeFactor = mod.sizeFactor || 1.0;
  const timeFactor = mod.timeFactor || 1.0;

  const dragTime = Math.max(15, Math.round(cfg.time * timeFactor));
  gameData.maxTime = dragTime;
  gameData.time = dragTime;
  const timeEl = document.getElementById('hud-time');
  if (timeEl) timeEl.textContent = dragTime;

  const areaW = area.offsetWidth;
  const zoneW = Math.max(65, Math.round(90 * sizeFactor));
  const zoneH = Math.max(65, Math.round(90 * sizeFactor));

  // Determine effective play span for high-resolution displays
  const maxSpan = Math.min(areaW - zoneW - 20, 1100);
  const leftOffset = areaW > 1150 ? Math.floor((areaW - maxSpan) / 2) : 10;
  const rightOffset = areaW > 1150 ? Math.floor((areaW - maxSpan) / 2) : 10;

  // Drop zones on right
  items.forEach((item, i) => {
    const dz = document.createElement('div');
    dz.className = 'drop-zone';
    dz.dataset.color = item.color;
    const x = areaW - rightOffset - zoneW;
    const dzSpacing = Math.min(zoneH + 15, Math.floor((area.offsetHeight - 80) / pairs));
    const y = 40 + i * dzSpacing;
    dz.style.cssText = `width:${zoneW}px;height:${zoneH}px;left:${x}px;top:${y}px;border-color:${item.color}44;color:${item.color}44;font-size:${Math.round(zoneW*0.45)}px;line-height:${zoneH}px`;
    dz.textContent = item.emoji;
    area.appendChild(dz);
  });

  // Drag items on left
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const itemW = Math.max(55, Math.round(75 * sizeFactor));
  const itemH = Math.max(55, Math.round(75 * sizeFactor));

  shuffled.forEach((item, i) => {
    const di = document.createElement('div');
    di.className = 'drag-item';
    di.dataset.color = item.color;
    const spacing = Math.min(110, Math.floor((area.offsetHeight - 80) / pairs));
    const x = leftOffset + 20 + Math.random() * 80, y = 40 + i * spacing;
    di.style.cssText = `width:${itemW}px;height:${itemH}px;left:${x}px;top:${y}px;background:${item.color}22;border-color:${item.color};font-size:${Math.round(itemW*0.48)}px;line-height:${itemH}px`;
    di.textContent = item.emoji;
    makeDraggable(di, area);
    area.appendChild(di);
  });

  startTimer();
  checkDragWin(pairs);
}

export function makeDraggable(el, area) {
  let offX, offY, dragging = false;
  const onMouseMove = (e) => {
    if (!dragging) return;
    const ar = area.getBoundingClientRect();
    el.style.left = (e.clientX - ar.left - offX) + 'px';
    el.style.top = (e.clientY - ar.top - offY) + 'px';
    highlightDrop(el);
  };
  const onMouseUp = (e) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    tryDrop(el, area, e.clientX, e.clientY);
  };
  el.addEventListener('mousedown', (e) => {
    dragging = true;
    el.classList.add('dragging');
    SoundFX.play('drag_grab');
    offX = e.offsetX; offY = e.offsetY;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    e.preventDefault();
  });

  // Touch support
  el.addEventListener('touchstart', (e) => {
    dragging = true;
    el.classList.add('dragging');
    SoundFX.play('drag_grab');
    const t = e.touches[0];
    const r = el.getBoundingClientRect();
    offX = t.clientX - r.left; offY = t.clientY - r.top;
    e.preventDefault();
  }, {passive:false});
  el.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const ar = area.getBoundingClientRect();
    el.style.left = (t.clientX - ar.left - offX) + 'px';
    el.style.top = (t.clientY - ar.top - offY) + 'px';
    highlightDrop(el);
    e.preventDefault();
  }, {passive:false});
  el.addEventListener('touchend', (e) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    const t = e.changedTouches[0];
    tryDrop(el, area, t.clientX, t.clientY);
  });
}

function highlightDrop(el) {
  const area = document.getElementById('game-area');
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width/2, cy = r.top + r.height/2;
  area.querySelectorAll('.drop-zone').forEach(dz => {
    const dr = dz.getBoundingClientRect();
    const over = cx > dr.left && cx < dr.right && cy > dr.top && cy < dr.bottom;
    dz.classList.toggle('highlight', over && dz.dataset.color === el.dataset.color);
  });
}

function tryDrop(el, area, cx, cy) {
  let matched = false;
  area.querySelectorAll('.drop-zone').forEach(dz => {
    dz.classList.remove('highlight');
    const dr = dz.getBoundingClientRect();
    const hit = cx > dr.left && cx < dr.right && cy > dr.top && cy < dr.bottom;
    if (hit && !matched) {
      if (dz.dataset.color === el.dataset.color && !dz.classList.contains('done')) {
        dz.classList.add('done');
        el.classList.add('matched');
        const ar = area.getBoundingClientRect();
        addHit(dr.left-ar.left+dr.width/2, dr.top-ar.top+dr.height/2, 200, 'drag_match');
        matched = true;
      } else {
        const ar = area.getBoundingClientRect();
        addMiss(cx - ar.left, cy - ar.top);
      }
    }
  });
}

function checkDragWin(total) {
  const mySession = gameSession;
  const interval = setInterval(() => {
    if (gameSession !== mySession) { clearInterval(interval); return; }
    const done = document.querySelectorAll('.drop-zone.done').length;
    if (done >= total) { clearInterval(interval); clearInterval(gameTimer); endGame(); }
    if (gameData.time <= 0) clearInterval(interval);
  }, 200);
}
