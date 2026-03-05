// ============================================================
// games/maze.js – Labirynt
// ============================================================
import { startSession, stopSession, addHit, addMiss,
         getArea, session, watchResize, unwatchResize } from '../core/engine.js';
import { showResult, showTutorial, GAMES } from '../core/ui.js';
import { recordResult } from '../core/state.js';

let _canvas, _ctx, _md = null;   // _md = mazeData

export function init(level) {
  const cfg = GAMES['maze'].levels[level - 1];
  showTutorial('maze', () => _startGame(cfg, level));
}

function _startGame(cfg, level) {
  const area = getArea();
  _canvas = document.createElement('canvas');
  _canvas.style.cssText = 'position:absolute;top:0;left:0;touch-action:none;cursor:none';
  area.appendChild(_canvas);

  _buildMaze(cfg);
  document.addEventListener('mousemove', _onMove);
  document.addEventListener('touchmove', _onTouch, { passive: false });

  startSession({ time: cfg.time, onTimeUp: () => _end(level) });
  watchResize(() => { _buildMaze(cfg); });
}

function _buildMaze(cfg) {
  const area = getArea();
  if (!area) return;
  const ar = area.getBoundingClientRect();
  const W  = Math.floor(ar.width);
  const H  = Math.floor(ar.height);
  _canvas.width  = W; _canvas.height = H;
  _canvas.style.width = W + 'px'; _canvas.style.height = H + 'px';
  _ctx = _canvas.getContext('2d');

  const cols = cfg.targetCols ?? 8;
  const rows = cfg.targetRows ?? 6;
  const pad  = 40;
  const maxCW = Math.floor((W - pad*2) / cols);
  const maxCH = Math.floor((H - pad*2) / rows);
  const CS    = Math.max(Math.min(maxCW, maxCH), 20);
  const offX  = Math.floor((W - cols*CS) / 2);
  const offY  = Math.floor((H - rows*CS) / 2);
  const wMarg = cfg.wallMargin ?? 7;

  const sx = offX + CS*.5, sy = offY + CS*.5;
  _md = {
    maze: _generateMaze(cols, rows), cols, rows,
    CS, offX, offY, wMarg,
    ballX: sx, ballY: sy, startX: sx, startY: sy,
    endCol: cols-1, endRow: rows-1,
    hitWall: false, frozen: false, completed: false, touches: 0
  };
  _draw();
}

function _generateMaze(cols, rows) {
  const cells = Array.from({length: rows}, () =>
    Array.from({length: cols}, () => ({ visited: false, walls: [true,true,true,true] }))
  );
  const dirs = [{r:-1,c:0,w:0,ow:2},{r:0,c:1,w:1,ow:3},{r:1,c:0,w:2,ow:0},{r:0,c:-1,w:3,ow:1}];
  const stack = [{r:0,c:0}];
  cells[0][0].visited = true;
  while (stack.length) {
    const {r,c} = stack[stack.length-1];
    const nbrs = dirs.map(d => ({r:r+d.r,c:c+d.c,w:d.w,ow:d.ow}))
      .filter(n => n.r>=0&&n.r<rows&&n.c>=0&&n.c<cols&&!cells[n.r][n.c].visited);
    if (!nbrs.length) { stack.pop(); continue; }
    const n = nbrs[Math.floor(Math.random()*nbrs.length)];
    cells[r][c].walls[n.w] = false;
    cells[n.r][n.c].walls[n.ow] = false;
    cells[n.r][n.c].visited = true;
    stack.push({r:n.r,c:n.c});
  }
  return cells;
}

function _onMove(e) { _handlePos(e.clientX, e.clientY); }
function _onTouch(e) {
  e.preventDefault();
  if (!_md || !session.running) return;
  _handlePos(e.touches[0].clientX, e.touches[0].clientY);
}

function _handlePos(cx, cy) {
  if (!_md || _md.completed || !session.running) return;
  const rect = _canvas.getBoundingClientRect();
  const scX  = _canvas.width  / rect.width;
  const scY  = _canvas.height / rect.height;
  const mx   = (cx - rect.left) * scX;
  const my   = (cy - rect.top)  * scY;
  if (mx < 0 || my < 0 || mx > _canvas.width || my > _canvas.height) return;

  const {offX, offY, cols, rows, maze, CS, wMarg, startX, startY, endCol, endRow} = _md;
  const col = Math.floor((mx - offX) / CS);
  const row = Math.floor((my - offY) / CS);
  const bCol = Math.floor((_md.ballX - offX) / CS);
  const bRow = Math.floor((_md.ballY - offY) / CS);

  let hit = false;
  if (col < 0 || col >= cols || row < 0 || row >= rows) {
    hit = true;
  } else {
    const cellX = offX + col*CS, cellY = offY + row*CS;
    if (col !== bCol || row !== bRow) {
      const dc = col-bCol, dr = row-bRow;
      if (Math.abs(dc)+Math.abs(dr) === 1) {
        const wi = dc===1?1:dc===-1?3:dr===1?2:0;
        if (maze[bRow]?.[bCol]?.walls[wi]) hit = true;
      }
    }
    const lx = mx-cellX, ly = my-cellY;
    const cell = maze[row]?.[col];
    if (cell) {
      if (cell.walls[0] && ly < wMarg) hit = true;
      if (cell.walls[2] && ly > CS-wMarg) hit = true;
      if (cell.walls[3] && lx < wMarg) hit = true;
      if (cell.walls[1] && lx > CS-wMarg) hit = true;
    }
  }

  if (hit) {
    _md.ballX = startX; _md.ballY = startY;
    _md.hitWall = true; _md.frozen = true; _md.touches++;
    addMiss(mx, my);
    _draw(); return;
  }

  if (_md.frozen) {
    const dx = mx-startX, dy = my-startY;
    if (Math.sqrt(dx*dx+dy*dy) < CS*.8) _md.frozen = false;
    else { _draw(); return; }
  }

  _md.ballX = mx; _md.ballY = my;

  if (col === endCol && row === endRow) {
    _md.completed = true;
    const tBonus = Math.round(500 * (session.time / session.maxTime));
    const wPen   = _md.touches * 20;
    addHit(mx, my, Math.max(100, 300 + tBonus - wPen));
    stopSession();
    setTimeout(() => _end(_currentLevel), 500);
  }
  _draw();
}

let _currentLevel = 1;

function _draw() {
  if (!_ctx || !_md) return;
  const {maze,cols,rows,offX,offY,CS,ballX,ballY,endCol,endRow,startX,startY} = _md;
  const W = _canvas.width, H = _canvas.height;

  _ctx.fillStyle = '#0f1923';
  _ctx.fillRect(0,0,W,H);

  // Meta
  _ctx.fillStyle = 'rgba(0,230,118,0.15)';
  _ctx.fillRect(offX+endCol*CS+2, offY+endRow*CS+2, CS-4, CS-4);

  // Ściany
  _ctx.strokeStyle = '#2a4a6a'; _ctx.lineWidth = 2;
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const x=offX+c*CS, y=offY+r*CS, cell=maze[r][c];
    _ctx.beginPath();
    if (cell.walls[0]) { _ctx.moveTo(x,y);    _ctx.lineTo(x+CS,y); }
    if (cell.walls[1]) { _ctx.moveTo(x+CS,y); _ctx.lineTo(x+CS,y+CS); }
    if (cell.walls[2]) { _ctx.moveTo(x+CS,y+CS); _ctx.lineTo(x,y+CS); }
    if (cell.walls[3]) { _ctx.moveTo(x,y+CS); _ctx.lineTo(x,y); }
    _ctx.stroke();
  }

  // Etykiety
  _ctx.font = 'bold 11px Nunito,sans-serif'; _ctx.textAlign = 'center';
  _ctx.fillStyle = '#00d4ff';
  _ctx.fillText('START', offX+CS/2, offY-5);
  _ctx.fillStyle = '#00e676';
  _ctx.fillText('META', offX+endCol*CS+CS/2, offY+endRow*CS+CS/2+5);

  // Kulka
  const grd = _ctx.createRadialGradient(ballX,ballY,2,ballX,ballY,13);
  grd.addColorStop(0,'#fff'); grd.addColorStop(.4,'#00d4ff'); grd.addColorStop(1,'#0050aa');
  _ctx.beginPath(); _ctx.arc(ballX,ballY,13,0,Math.PI*2);
  _ctx.fillStyle = grd;
  _ctx.shadowColor='#00d4ff'; _ctx.shadowBlur=15;
  _ctx.fill(); _ctx.shadowBlur=0;

  // Flash przy uderzeniu
  if (_md.hitWall) {
    _ctx.fillStyle='rgba(255,0,0,0.25)';
    _ctx.fillRect(0,0,W,H);
    _md.hitWall=false;
  }

  // Zamrożony – pulsująca instrukcja
  if (_md.frozen) {
    const p = .5+.5*Math.sin(Date.now()/150);
    _ctx.strokeStyle=`rgba(255,80,80,${.5+.5*p})`;
    _ctx.lineWidth=3+p*3;
    _ctx.beginPath(); _ctx.arc(startX,startY,CS*.75,0,Math.PI*2); _ctx.stroke();
    _ctx.fillStyle=`rgba(255,100,100,${.3+.4*p})`;
    _ctx.font='bold 12px Nunito,sans-serif'; _ctx.textAlign='center';
    _ctx.fillText('↩ wróć tu!', startX, startY+CS*1.3);
    _ctx.lineWidth=1;
    requestAnimationFrame(() => _draw());
  }
}

function _end(level) {
  unwatchResize();
  document.removeEventListener('mousemove', _onMove);
  document.removeEventListener('touchmove', _onTouch);
  _canvas?.remove(); _canvas = null; _ctx = null; _md = null;

  const { stars, acc } = recordResult({
    gameId: 'maze', level,
    score: session.score, hits: session.hits, miss: session.miss
  });
  showResult({ gameId: 'maze', level, stars, acc,
               score: session.score, hits: session.hits, miss: session.miss });
}

// Eksportuj setter dla currentLevel (wywoływany z index.js)
export function setLevel(l) { _currentLevel = l; }
