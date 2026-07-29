// =========================================================
// GAME MODULE: MAZE (Labirynt)
// =========================================================
import {
  gameData,
  gameTimer,
  addHit,
  addMiss,
  startTimer,
  endGame
} from '../engine.js';
import { getAdaptiveModifier } from '../state.js';

let mazeCtx, mazeCanvas, mazeData = {};

export function startMaze(cfg, levelIdx) {
  if (gameTimer) clearInterval(gameTimer);
  const area = document.getElementById('game-area');
  const canvas = document.getElementById('maze-canvas');
  canvas.classList.remove('hidden');

  const areaRect = area.getBoundingClientRect();
  canvas.width  = Math.floor(areaRect.width);
  canvas.height = Math.floor(areaRect.height);
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width  = canvas.width  + 'px';
  canvas.style.height = canvas.height + 'px';

  mazeCanvas = canvas;
  mazeCtx = canvas.getContext('2d');

  const screenW = window.innerWidth || canvas.width;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  const isSmallScreen = screenW < 768 || canvas.width < 550;
  const isLargeScreen = screenW >= 1400 || canvas.width >= 1200;
  const isSmallTouch = isTouchDevice && isSmallScreen;

  let baseCellSize = levelIdx === 0 ? 48 : levelIdx === 1 ? 36 : 26;
  if (isLargeScreen) {
    baseCellSize = levelIdx === 0 ? 58 : levelIdx === 1 ? 44 : 34;
  } else if (isSmallTouch) {
    baseCellSize = levelIdx === 0 ? 56 : levelIdx === 1 ? 44 : 34;
  } else if (isSmallScreen) {
    baseCellSize = levelIdx === 0 ? 50 : levelIdx === 1 ? 38 : 28;
  }

  const mod = getAdaptiveModifier('maze');
  const sizeFactor = mod.sizeFactor || 1.0;
  const timeFactor = mod.timeFactor || 1.0;

  const cellSize = Math.max(22, Math.round(baseCellSize * sizeFactor));

  const cols = Math.max(Math.floor((canvas.width  - 20) / cellSize), 4);
  const rows = Math.max(Math.floor((canvas.height - 60) / cellSize), 4);

  const maze = generateMaze(cols, rows, levelIdx, cellSize);
  const offsetX = Math.floor((canvas.width  - cols * cellSize) / 2);
  const offsetY = 30;

  const rawMargin = isSmallTouch 
    ? Math.max(2, Math.floor(cellSize * 0.14))
    : Math.max(4, Math.min(10, Math.floor(cellSize * 0.22)));
  const wallMargin = Math.max(2, Math.round(rawMargin * sizeFactor));
  const distMultiplier = isSmallTouch ? 2.2 : isTouchDevice ? 1.8 : 1.2;
  const unfreezeMultiplier = isSmallTouch ? 1.2 : 0.8;
  const touchOffsetY = isSmallTouch ? -12 : 0;

  const resizeObserver = new ResizeObserver(entries => {
    if (!mazeData || !mazeData.maze || mazeData.completed || gameData.time <= 0) return;
    for (let entry of entries) {
      const { width, height } = entry.contentRect;
      canvas.width = Math.floor(width);
      canvas.height = Math.floor(height);
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      mazeData.offsetX = Math.floor((canvas.width - mazeData.cols * cellSize) / 2);
      drawMaze();
    }
  });
  resizeObserver.observe(area);

  mazeData = {
    maze, cols, rows, offsetX, offsetY, cellSize,
    ballX: offsetX + cellSize * 0.5, ballY: offsetY + cellSize * 0.5,
    startX: offsetX + cellSize * 0.5, startY: offsetY + cellSize * 0.5,
    endCol: cols - 1, endRow: rows - 1,
    hitWall: false, completed: false, frozen: true, touches: 0,
    resizeObserver: resizeObserver,
    isTouchDevice, isSmallScreen, isSmallTouch,
    wallMargin, distMultiplier, unfreezeMultiplier, touchOffsetY
  };

  document.addEventListener('mousemove', onMazeMouse);
  document.addEventListener('touchmove', onMazeTouchMove, { passive: false });

  window._mazeCleanup = () => {
    document.removeEventListener('mousemove', onMazeMouse);
    document.removeEventListener('touchmove', onMazeTouchMove);
    if (mazeData && mazeData.resizeObserver) {
      try { mazeData.resizeObserver.disconnect(); } catch(e) {}
    }
    mazeData = {};
  };

  drawMaze();

  const mazeTime = Math.max(20, Math.round((cfg.time || 60) * timeFactor));
  gameData.maxTime = mazeTime;
  gameData.time = mazeTime;
  startTimer();
}

function generateMaze(cols, rows, difficulty, cellSize) {
  const cells = Array.from({length: rows}, () => Array.from({length: cols}, () => ({ visited: false, walls: [true,true,true,true] })));
  const stack = [];
  const start = cells[0][0];
  start.visited = true;
  stack.push({r:0,c:0});
  const dirs = [{r:-1,c:0,w:0,ow:2},{r:0,c:1,w:1,ow:3},{r:1,c:0,w:2,ow:0},{r:0,c:-1,w:3,ow:1}];
  while (stack.length) {
    const {r,c} = stack[stack.length-1];
    const nbrs = dirs.map(d => ({r:r+d.r,c:c+d.c,w:d.w,ow:d.ow}))
      .filter(n => n.r>=0 && n.r<rows && n.c>=0 && n.c<cols && !cells[n.r][n.c].visited);
    if (!nbrs.length) { stack.pop(); continue; }
    const n = nbrs[Math.floor(Math.random()*nbrs.length)];
    cells[r][c].walls[n.w] = false;
    cells[n.r][n.c].walls[n.ow] = false;
    cells[n.r][n.c].visited = true;
    stack.push({r:n.r,c:n.c});
  }
  return cells;
}

function drawMaze() {
  if (!mazeData || !mazeData.maze) return;
  const ctx = mazeCtx;
  const {maze,cols,rows,offsetX,offsetY,ballX,ballY,endCol,endRow,cellSize:CS} = mazeData;
  const CELLSZ = CS || 40;
  ctx.clearRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  ctx.fillStyle = '#0f1923';
  ctx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);

  ctx.fillStyle = 'rgba(0,230,118,0.15)';
  ctx.fillRect(offsetX + endCol*CELLSZ+2, offsetY + endRow*CELLSZ+2, CELLSZ-4, CELLSZ-4);

  ctx.strokeStyle = '#2a4a6a';
  ctx.lineWidth = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * CELLSZ, y = offsetY + r * CELLSZ;
      const cell = maze[r][c];
      ctx.beginPath();
      if (cell.walls[0]) { ctx.moveTo(x,y); ctx.lineTo(x+CELLSZ,y); }
      if (cell.walls[1]) { ctx.moveTo(x+CELLSZ,y); ctx.lineTo(x+CELLSZ,y+CELLSZ); }
      if (cell.walls[2]) { ctx.moveTo(x+CELLSZ,y+CELLSZ); ctx.lineTo(x,y+CELLSZ); }
      if (cell.walls[3]) { ctx.moveTo(x,y+CELLSZ); ctx.lineTo(x,y); }
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#00d4ff';
  ctx.font = 'bold 11px Nunito';
  ctx.textAlign = 'center';
  ctx.fillText('START', offsetX + CELLSZ/2, offsetY - 5);

  ctx.fillStyle = '#00e676';
  ctx.fillText('META', offsetX + endCol*CELLSZ + CELLSZ/2, offsetY + endRow*CELLSZ + CELLSZ/2 + 5);

  if (typeof ballX === 'number' && typeof ballY === 'number' && isFinite(ballX) && isFinite(ballY)) {
    const grd = ctx.createRadialGradient(ballX, ballY, 2, ballX, ballY, 14);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(0.4, '#00d4ff');
    grd.addColorStop(1, '#0050aa');
    ctx.beginPath();
    ctx.arc(ballX, ballY, 13, 0, Math.PI*2);
    ctx.fillStyle = grd;
    ctx.fill();
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  if (mazeData.hitWall) {
    ctx.fillStyle = 'rgba(255,0,0,0.25)';
    ctx.fillRect(0,0,mazeCanvas.width,mazeCanvas.height);
    mazeData.hitWall = false;
  }

  if (mazeData.frozen) {
    const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 150);
    ctx.strokeStyle = `rgba(255,80,80,${0.5 + 0.5 * pulse})`;
    ctx.lineWidth = 3 + pulse * 3;
    ctx.beginPath();
    ctx.arc(mazeData.startX, mazeData.startY, CELLSZ * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,100,100,${0.3 + 0.4 * pulse})`;
    ctx.font = 'bold 12px Nunito, sans-serif';
    ctx.textAlign = 'center';
    const txt = mazeData.touches === 0 
      ? (mazeData.isTouchDevice ? 'Dotknij tu! 👆' : 'Zacznij tu! 🖱️') 
      : 'Wróć tu! ↩';
    ctx.fillText(txt, mazeData.startX, mazeData.startY + CELLSZ * 1.3);
    ctx.lineWidth = 1;

    requestAnimationFrame(drawMaze);
  }
}

function onMazeMouse(e) {
  if (!mazeData || !mazeData.maze || mazeData.completed || gameData.time <= 0) return;
  const CELLSZ = mazeData.cellSize || 40;
  const rect = mazeCanvas.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) return;
  const scaleX = mazeCanvas.width  / rect.width;
  const scaleY = mazeCanvas.height / rect.height;
  const mx = (e.clientX - rect.left) * scaleX;
  const my = (e.clientY - rect.top)  * scaleY;
  if (typeof mx !== 'number' || typeof my !== 'number' || !isFinite(mx) || !isFinite(my)) return;
  if (mx < 0 || my < 0 || mx > mazeCanvas.width || my > mazeCanvas.height) return;
  const {offsetX, offsetY, cols, rows, maze, startX, startY, endCol, endRow} = mazeData;

  const dx = mx - mazeData.ballX;
  const dy = my - mazeData.ballY;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const distMult = mazeData.distMultiplier || 1.2;
  if (!mazeData.frozen && dist > CELLSZ * distMult) {
    mazeData.ballX = startX;
    mazeData.ballY = startY;
    mazeData.hitWall = true;
    mazeData.frozen = true;
    mazeData.touches++;
    addMiss(mx, my, 'maze_wall');
    drawMaze();
    return;
  }

  const col = Math.floor((mx - offsetX) / CELLSZ);
  const row = Math.floor((my - offsetY) / CELLSZ);
  const ballCol = Math.floor((mazeData.ballX - offsetX) / CELLSZ);
  const ballRow = Math.floor((mazeData.ballY - offsetY) / CELLSZ);

  let wallHit = false;
  if (col < 0 || col >= cols || row < 0 || row >= rows) {
    wallHit = true;
  } else {
    const cellX = offsetX + col * CELLSZ, cellY = offsetY + row * CELLSZ;
    const margin = mazeData.wallMargin !== undefined ? mazeData.wallMargin : 10;
    if (col !== ballCol || row !== ballRow) {
      const dc = col - ballCol, dr = row - ballRow;
      if (Math.abs(dc) + Math.abs(dr) === 1) {
        let wallIdx = dc === 1 ? 1 : dc === -1 ? 3 : dr === 1 ? 2 : 0;
        if (maze[ballRow] && maze[ballRow][ballCol] && maze[ballRow][ballCol].walls[wallIdx]) {
          wallHit = true;
        }
      }
    }
    const localX = mx - cellX, localY = my - cellY;
    if (maze[row] && maze[row][col]) {
      const cell = maze[row][col];
      if (cell.walls[0] && localY < margin) wallHit = true;
      if (cell.walls[2] && localY > CELLSZ - margin) wallHit = true;
      if (cell.walls[3] && localX < margin) wallHit = true;
      if (cell.walls[1] && localX > CELLSZ - margin) wallHit = true;
    }
  }

  if (wallHit) {
    mazeData.ballX = startX;
    mazeData.ballY = startY;
    mazeData.hitWall = true;
    mazeData.frozen = true;
    mazeData.touches++;
    addMiss(mx, my, 'maze_wall');
    drawMaze();
    return;
  }

  if (mazeData.frozen) {
    const startDx = mx - startX, startDy = my - startY;
    const unfreezeMult = mazeData.unfreezeMultiplier || 0.8;
    if (Math.sqrt(startDx*startDx + startDy*startDy) < CELLSZ * unfreezeMult) {
      mazeData.frozen = false;
    } else {
      drawMaze();
      return;
    }
  }

  mazeData.ballX = mx;
  mazeData.ballY = my;

  if (col === endCol && row === endRow && !mazeData.completed) {
    mazeData.completed = true;
    if (gameTimer) clearInterval(gameTimer);
    addHit(mx, my, 500);
    document.removeEventListener('mousemove', onMazeMouse);
    document.removeEventListener('touchmove', onMazeTouchMove);
    if (mazeData.resizeObserver) mazeData.resizeObserver.disconnect();
    mazeData = {};
    setTimeout(endGame, 500);
  }

  drawMaze();
}

function onMazeTouchMove(e) {
  e.preventDefault();
  if (!mazeData || !mazeData.maze || mazeData.completed || gameData.time <= 0) return;
  const touch = e.touches[0];
  const offsetY = mazeData.touchOffsetY || 0;
  onMazeMouse({ clientX: touch.clientX, clientY: touch.clientY + offsetY });
}
