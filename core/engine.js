// ============================================================
// core/engine.js – silnik gry: timer, punkty, efekty, resize
// ============================================================

// ── Aktywna sesja gry ──────────────────────────────────────
export const session = {
  score: 0, hits: 0, miss: 0,
  time: 30, maxTime: 30,
  running: false
};

let _timerInterval = null;
let _onTimeUp = null;

export function startSession({ time, onTimeUp }) {
  session.score = 0; session.hits = 0; session.miss = 0;
  session.time = time; session.maxTime = time;
  session.running = true;
  _onTimeUp = onTimeUp;
  _tickHUD();

  if (_timerInterval) clearInterval(_timerInterval);
  _timerInterval = setInterval(() => {
    if (!session.running) return;
    session.time = Math.max(0, session.time - 0.1);
    _tickHUD();
    if (session.time <= 0) {
      session.running = false;
      clearInterval(_timerInterval);
      _onTimeUp?.();
    }
  }, 100);
}

export function stopSession() {
  session.running = false;
  clearInterval(_timerInterval);
}

// ── Punktacja ──────────────────────────────────────────────
export function addHit(x, y, pts = 100) {
  session.hits++;
  session.score += pts;
  _spawnEffect(x, y, pts, '#00e676');
  _tickHUD();
}

export function addMiss(x, y) {
  session.miss++;
  const penalty = 15;
  session.score = Math.max(0, session.score - penalty);
  _spawnEffect(x, y, -penalty, '#ff1744', '-' + penalty);
  _tickHUD();
}

// ── HUD ───────────────────────────────────────────────────
function _tickHUD() {
  const pct = (session.time / session.maxTime) * 100;
  _q('#hud-score').textContent = session.score;
  _q('#hud-hits').textContent  = session.hits;
  _q('#hud-miss').textContent  = session.miss;
  _q('#hud-time').textContent  = Math.ceil(session.time);
  const bar = _q('#prog-bar');
  bar.style.width = pct + '%';
  bar.style.background =
    pct > 50 ? 'linear-gradient(90deg,var(--accent),var(--purple))' :
    pct > 25 ? 'linear-gradient(90deg,var(--yellow),var(--orange))' :
               'linear-gradient(90deg,var(--red),var(--orange))';
}

// ── Efekty wizualne ────────────────────────────────────────
function _spawnEffect(x, y, pts, color, label) {
  const area = getArea();
  if (!area || isNaN(x) || isNaN(y)) return;

  const ef = document.createElement('div');
  ef.className = 'hit-effect';
  ef.style.cssText = `left:${x}px;top:${y}px;width:60px;height:60px;background:${color};opacity:0.5`;
  area.appendChild(ef);

  const pop = document.createElement('div');
  pop.className = 'score-pop';
  pop.textContent = label ?? (pts > 0 ? '+' + pts : pts);
  pop.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  area.appendChild(pop);

  setTimeout(() => { ef.remove(); pop.remove(); }, 800);
}

// ── Helpers ────────────────────────────────────────────────
export function getArea()  { return document.getElementById('game-area'); }
export function getAreaRect() { return getArea()?.getBoundingClientRect() ?? new DOMRect(); }

export function randomPos(size, rect) {
  const pad = size / 2 + 10;
  return {
    x: pad + Math.random() * (rect.width  - pad * 2),
    y: pad + Math.random() * (rect.height - pad * 2)
  };
}

export function eventPos(e, container) {
  const rect = container.getBoundingClientRect();
  const src = (e.changedTouches?.length > 0) ? e.changedTouches[0]
             : (e.touches?.length > 0)        ? e.touches[0]
             : e;
  if (!src || src.clientX === undefined) return { x: 0, y: 0, cx: 0, cy: 0 };
  return { x: src.clientX - rect.left, y: src.clientY - rect.top,
           cx: src.clientX, cy: src.clientY };
}

// Dodaj click + touchend bez duplikatów
export function onActivate(el, handler) {
  let touchFired = false;
  el.addEventListener('touchend', (e) => {
    e.preventDefault(); touchFired = true; handler(e);
    setTimeout(() => { touchFired = false; }, 400);
  }, { passive: false });
  el.addEventListener('click', (e) => { if (!touchFired) handler(e); });
}

// ── ResizeObserver – reaguj na zmianę rozmiaru okna ───────
let _resizeTimer  = null;
let _resizeCb     = null;
let _resizeObserver = null;

export function watchResize(callback) {
  _resizeCb = callback;
  _resizeObserver?.disconnect();
  _resizeObserver = new ResizeObserver(() => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => { _resizeCb?.(); }, 150);
  });
  const area = getArea();
  if (area) _resizeObserver.observe(area);
}

export function unwatchResize() {
  _resizeObserver?.disconnect();
  _resizeCb = null;
}

// ── Utility ───────────────────────────────────────────────
function _q(sel) {
  const el = document.querySelector(sel);
  return el ?? { textContent: '', style: {} };
}
