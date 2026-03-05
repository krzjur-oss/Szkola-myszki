// ============================================================
// games/mixed.js – Wyzwanie! (single + double + precision)
// ============================================================
import { startSession, addHit, addMiss,
         getArea, getAreaRect, randomPos, onActivate, session,
         watchResize, unwatchResize } from '../core/engine.js';
import { showResult, showTutorial, GAMES } from '../core/ui.js';
import { recordResult } from '../core/state.js';

let _roundCount = 0;
let _levelIdx   = 0;

export function init(level) {
  _levelIdx   = level;
  _roundCount = 0;
  const cfg = GAMES['mixed'].levels[level - 1];
  showTutorial('mixed', () => _startGame(cfg, level));
}

function _startGame(cfg, level) {
  const area = getArea();
  area.addEventListener('click', (e) => {
    if (!session.running) return;
    if (e.target === area) {
      const x = e.offsetX ?? e.clientX - area.getBoundingClientRect().left;
      const y = e.offsetY ?? e.clientY - area.getBoundingClientRect().top;
      if (!isNaN(x)) addMiss(x, y);
    }
  });
  area.addEventListener('touchend', (e) => {
    if (!session.running || e.target !== area) return;
    e.preventDefault();
    const r = area.getBoundingClientRect(), t = e.changedTouches[0];
    addMiss(t.clientX - r.left, t.clientY - r.top);
  }, { passive: false });

  startSession({ time: cfg.time, onTimeUp: () => _end(level) });
  _spawn(level);
  watchResize(() => {});
}

function _pickType(level) {
  _roundCount++;
  if (level === 1) return _roundCount % 2 === 0 ? 'double' : 'single';
  if (_roundCount % 3 === 0) return 'precision';
  return _roundCount % 3 === 1 ? 'single' : 'double';
}

function _spawn(level) {
  if (!session.running) return;
  const area = getArea();
  area.querySelectorAll('.target').forEach(t => t.remove());
  const type = _pickType(level);
  const rect = getAreaRect();

  if (type === 'precision') {
    let done = false;

    // Dobry cel – żółta gwiazdka
    const gs = 65 + Math.random() * 20;
    const gp = randomPos(gs, rect);
    const good = _makeEl('target', {
      width:`${gs}px`, height:`${gs}px`,
      left:`${gp.x-gs/2}px`, top:`${gp.y-gs/2}px`,
      background:'#ffd740', boxShadow:'0 0 22px #ffd74099',
      fontSize:`${gs*.5}px`, lineHeight:`${gs}px`, textAlign:'center',
      fontFamily:"'Fredoka One',cursive", color:'#000'
    }, '★');

    onActivate(good, (e) => {
      e.stopPropagation();
      if (!session.running || done) return;
      done = true;
      const r = good.getBoundingClientRect(), ar = getAreaRect();
      const pts = 150 + Math.round(100*(session.time/session.maxTime));
      addHit(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2, pts);
      area.querySelectorAll('.target').forEach(t => { t.classList.add('shrinking'); });
      setTimeout(() => { area.querySelectorAll('.target').forEach(t=>t.remove()); _spawn(level); }, 150);
    });
    area.appendChild(good);

    // Złe cele
    [{shape:'square',color:'#ff4081'},{shape:'triangle',color:'#d500f9'}].forEach(bad => {
      const bs = 58+Math.random()*18, bp = randomPos(bs, rect);
      const b = _makeEl('target target-'+bad.shape, {
        width:`${bs}px`, height:`${bs}px`,
        left:`${bp.x-bs/2}px`, top:`${bp.y-bs/2}px`,
        background:bad.color, boxShadow:`0 0 14px ${bad.color}88`,
        fontSize:`${bs*.4}px`, lineHeight:`${bs}px`, textAlign:'center',
        color:'rgba(0,0,0,0.45)'
      }, bad.shape==='square'?'■':'▲');

      onActivate(b, (e) => {
        e.stopPropagation();
        if (!session.running) return;
        const r = b.getBoundingClientRect(), ar = getAreaRect();
        addMiss(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2);
        b.style.outline='3px solid #ff1744'; b.style.transform='scale(1.15)';
        setTimeout(() => { if(b.isConnected){b.style.outline='';b.style.transform='';} }, 400);
      });
      area.appendChild(b);
    });

    const timer = setTimeout(() => {
      if (done) return; done = true;
      area.querySelectorAll('.target').forEach(t=>t.remove());
      if (session.running) _spawn(level);
    }, 4000);
    return;
  }

  // single / double
  const col   = type==='single' ? '#00e676' : '#42a5f5';
  const label = type==='single' ? '1×' : '2×';
  const size  = 65 + Math.random()*28;
  const pos   = randomPos(size, rect);

  const t = _makeEl('target', {
    width:`${size}px`, height:`${size}px`,
    left:`${pos.x-size/2}px`, top:`${pos.y-size/2}px`,
    background:col, boxShadow:`0 0 20px ${col}88`,
    fontSize:`${size*.38}px`, lineHeight:`${size}px`, textAlign:'center',
    fontFamily:"'Fredoka One',cursive", color:'#000'
  }, label);

  if (type === 'single') {
    onActivate(t, (e) => {
      e.stopPropagation();
      if (!session.running) return;
      const r=t.getBoundingClientRect(),ar=getAreaRect();
      const pts=80+Math.round(70*(session.time/session.maxTime));
      addHit(r.left-ar.left+r.width/2, r.top-ar.top+r.height/2, pts);
      t.classList.add('shrinking');
      setTimeout(()=>{ t.remove(); _spawn(level); }, 150);
    });
  } else {
    let clicks=0, ct=null;
    onActivate(t, (e) => {
      e.stopPropagation();
      if (!session.running) return;
      clicks++;
      if (ct) clearTimeout(ct);
      const r=t.getBoundingClientRect(),ar=getAreaRect();
      const cx=r.left-ar.left+r.width/2, cy=r.top-ar.top+r.height/2;
      if (clicks>=2) {
        clicks=0;
        const pts=120+Math.round(80*(session.time/session.maxTime));
        addHit(cx,cy,pts);
        t.classList.add('shrinking');
        setTimeout(()=>{ t.remove(); _spawn(level); }, 150);
      } else {
        ct=setTimeout(()=>{ addMiss(cx,cy); clicks=0; }, 500);
      }
    });
  }

  area.appendChild(t);
  setTimeout(()=>{ if(t.parentNode&&session.running){t.remove();_spawn(level);}
                   else if(t.parentNode) t.remove(); }, 3500);
}

function _makeEl(className, styles, text) {
  const el = document.createElement('div');
  el.className = className;
  el.style.cssText = Object.entries(styles)
    .map(([k,v]) => k.replace(/([A-Z])/g,'-$1').toLowerCase()+':'+v)
    .join(';');
  el.textContent = text;
  return el;
}

function _end(level) {
  unwatchResize();
  getArea()?.querySelectorAll('.target').forEach(t=>t.remove());
  const { stars, acc } = recordResult({
    gameId:'mixed', level,
    score:session.score, hits:session.hits, miss:session.miss
  });
  showResult({ gameId:'mixed', level, stars, acc,
               score:session.score, hits:session.hits, miss:session.miss });
}
