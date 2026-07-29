// =========================================================
// CORE GAME ENGINE
// =========================================================
import { SoundFX } from './sound.js';
import { state, saveState, addScoreToRanking, renderResultRanking, setCurrentScoreEntry } from './state.js';
import { eventPos } from './helpers.js';
import { animateStars, startFireworks, stopFireworks } from './fireworks.js';

export let currentGame = null;
export let gameTimer = null;
export let gameData = { score: 0, hits: 0, miss: 0, time: 30, maxTime: 30 };
export let gameSession = 0;

export let currentType = '';
export let currentLevel = 0;

export function setCurrentTypeAndLevel(type, level) {
  currentType = type;
  currentLevel = level;
  window.currentType = currentType;
  window.currentLevel = currentLevel;
}

export function incrementGameSession() {
  gameSession++;
  return gameSession;
}

export function clearGameArea() {
  const oldArea = document.getElementById('game-area');
  if (!oldArea) return;
  const newArea = oldArea.cloneNode(false);
  newArea.id = 'game-area';

  const msg = document.createElement('div');
  msg.className = 'game-message hidden';
  msg.id = 'game-message';
  msg.innerHTML = '<h2 id="msg-h2">Start!</h2><p id="msg-p">Powodzenia!</p>';
  newArea.appendChild(msg);

  const mazeC = document.createElement('canvas');
  mazeC.id = 'maze-canvas';
  mazeC.className = 'hidden';
  newArea.appendChild(mazeC);

  const traceC = document.createElement('canvas');
  traceC.id = 'trace-canvas';
  traceC.className = 'hidden';
  newArea.appendChild(traceC);

  if (oldArea.parentNode) {
    oldArea.parentNode.replaceChild(newArea, oldArea);
  }
}

export function updateHUD() {
  const elScore = document.getElementById('hud-score');
  const elHits = document.getElementById('hud-hits');
  const elMiss = document.getElementById('hud-miss');
  const elTime = document.getElementById('hud-time');
  const elProg = document.getElementById('prog-bar');

  if (elScore) elScore.textContent = gameData.score;
  if (elHits) elHits.textContent = gameData.hits;
  if (elMiss) elMiss.textContent = gameData.miss;
  if (elTime) elTime.textContent = Math.ceil(gameData.time);

  if (elProg) {
    const pct = (gameData.time / gameData.maxTime) * 100;
    elProg.style.width = pct + '%';
    elProg.style.background =
      pct > 50 ? 'linear-gradient(90deg,var(--accent),var(--purple))' :
      pct > 25 ? 'linear-gradient(90deg,var(--yellow),var(--orange))' :
                 'linear-gradient(90deg,var(--red),var(--orange))';
  }
}

export function startTimer(onEnd) {
  if (gameTimer) clearInterval(gameTimer);
  gameTimer = setInterval(() => {
    gameData.time -= 0.1;
    updateHUD();
    if (gameData.time <= 0) {
      clearInterval(gameTimer);
      gameTimer = null;
      if (onEnd) onEnd();
      else endGame();
    }
  }, 100);
}

export function addHit(x, y, pts = 100, soundOverride) {
  gameData.hits++;
  gameData.score += pts;
  spawnHitEffect(x, y, pts, '#00e676', null, soundOverride);
  updateHUD();
}

export function addMiss(x, y, soundOverride) {
  gameData.miss++;
  spawnHitEffect(x, y, -10, '#ff1744', '-10', soundOverride);
  updateHUD();
}

export function spawnHitEffect(x, y, pts, color, label, soundOverride) {
  const area = document.getElementById('game-area');
  if (!area || isNaN(x) || isNaN(y)) return;

  if (soundOverride) {
    SoundFX.play(soundOverride);
  } else if (pts > 0) {
    SoundFX.play('hit');
  } else {
    SoundFX.play('miss');
  }

  const ef = document.createElement('div');
  ef.className = 'hit-effect';
  ef.style.cssText = `left:${x}px;top:${y}px;width:60px;height:60px;color:${color}`;
  area.appendChild(ef);

  for (let i = 0; i < 8; i++) {
    const pt = document.createElement('div');
    pt.className = 'hit-particle';
    pt.style.background = color;
    pt.style.left = `${x}px`;
    pt.style.top = `${y}px`;
    const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.4;
    const distance = 40 + Math.random() * 50;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    pt.style.setProperty('--dx', `${dx}px`);
    pt.style.setProperty('--dy', `${dy}px`);
    area.appendChild(pt);
    setTimeout(() => pt.remove(), 700);
  }

  const pop = document.createElement('div');
  pop.className = 'score-pop';
  pop.textContent = label || (pts > 0 ? '+' + pts : pts);
  pop.style.cssText = `left:${x}px;top:${y}px;color:${color}`;
  area.appendChild(pop);

  setTimeout(() => { ef.remove(); pop.remove(); }, 800);
}

export function spawnTouchRing(x, y) {
  const area = document.getElementById('game-area');
  if (!area || isNaN(x) || isNaN(y)) return;
  const ring = document.createElement('div');
  ring.className = 'touch-ring';
  ring.style.left = x + 'px';
  ring.style.top = y + 'px';
  area.appendChild(ring);
  setTimeout(() => ring.remove(), 450);
}

export function randomPos(size, area) {
  const pad = size / 2 + 10;
  const maxW = Math.max(10, area.width - pad * 2);
  const maxH = Math.max(10, area.height - pad * 2);
  return {
    x: pad + Math.random() * maxW,
    y: pad + Math.random() * maxH
  };
}

export function initAreaMissHandlers(area) {
  area.addEventListener('click', (e) => {
    if (gameData.time <= 0) return;
    if (e.target === area) {
      const x = e.offsetX ?? e.clientX - area.getBoundingClientRect().left;
      const y = e.offsetY ?? e.clientY - area.getBoundingClientRect().top;
      if (!isNaN(x) && !isNaN(y)) addMiss(x, y);
    }
  });
  area.addEventListener('touchend', (e) => {
    if (gameData.time <= 0) return;
    if (e.target === area) {
      e.preventDefault();
      const p = eventPos(e, area);
      if (!isNaN(p.x) && !isNaN(p.y)) addMiss(p.x, p.y);
    }
  }, { passive: false });
}

export function stopActiveGame() {
  incrementGameSession();
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  if (window._mazeCleanup) {
    window._mazeCleanup();
    window._mazeCleanup = null;
  }
  stopFireworks();
}

export function endGame() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  const area = document.getElementById('game-area');
  if (area) {
    area.onclick = null;
    area.ondblclick = null;
    area.querySelectorAll('.target,.drag-item').forEach(e => e.remove());
    if (area.dataset.precTimer) {
      clearTimeout(parseInt(area.dataset.precTimer));
      delete area.dataset.precTimer;
    }
  }

  if (window._mazeCleanup) {
    window._mazeCleanup();
    window._mazeCleanup = null;
  }

  const precPanel = document.getElementById('prec-panel');
  if (precPanel) precPanel.remove();

  const instr = document.getElementById('g-instruction');
  if (instr) instr.style.display = '';

  const total = gameData.hits + gameData.miss;
  const acc = total > 0 ? Math.round((gameData.hits / total) * 100) : 0;
  const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;

  if (stars > 0) {
    SoundFX.play('victory');
  } else {
    SoundFX.play('miss');
  }

  const emojis = ['😔','😊','🎉','🏆'];
  const titles = ['Nie poddawaj się!', 'Dobra robota!', 'Świetnie!', 'Mistrz!'];

  const resEmoji = document.getElementById('res-emoji');
  const resStars = document.getElementById('res-stars');
  const resTitle = document.getElementById('res-title');
  const resSub = document.getElementById('res-sub');

  if (resEmoji) resEmoji.textContent = emojis[stars];
  if (resStars) resStars.textContent = '⭐'.repeat(stars) + '☆'.repeat(3-stars);
  if (resTitle) resTitle.textContent = titles[stars];

  const gameConfigs = window.GAME_CONFIGS || {};
  const gameMeta = window.GAME_META || {};
  const config = gameConfigs[currentType] || gameMeta[currentType] || { title: '' };
  if (resSub) resSub.textContent = (['Łatwy','Średni','Trudny'][currentLevel] || '') + ' — ' + (config.title || '');

  document.getElementById('r-score').textContent = gameData.score;
  document.getElementById('r-acc').textContent = acc + '%';
  document.getElementById('r-hits').textContent = gameData.hits;
  document.getElementById('r-miss').textContent = gameData.miss;

  const elapsed = Math.round(gameData.maxTime - Math.max(gameData.time, 0));
  const timeRow = document.getElementById('res-time-row');
  const timeEl  = document.getElementById('r-time');
  if (timeRow && timeEl) {
    if (currentType === 'maze' || currentType === 'drag') {
      timeEl.textContent = elapsed + ' s';
      timeRow.style.display = 'flex';
    } else {
      timeRow.style.display = 'none';
    }
  }

  const btnNext = document.getElementById('btn-next');
  if (btnNext) {
    const hasNext = currentLevel < 2;
    if (hasNext) {
      btnNext.style.display = 'block';
      const nextName = ['Łatwy','Średni','Trudny'][currentLevel + 1];
      btnNext.textContent = 'Następny poziom – ' + nextName + ' ▶';
      btnNext.onclick = () => window.nextLevel();
      btnNext.style.background = '';
    } else {
      btnNext.style.display = 'block';
      btnNext.textContent = '🏆 Wszystkie poziomy ukończone!';
      btnNext.onclick = () => window.navigate('level/' + currentType);
      btnNext.style.background = 'linear-gradient(135deg, var(--yellow), var(--orange))';
    }
  }

  animateStars(stars);

  state.totalScore += gameData.score;
  state.totalGames++;
  state.totalStars += stars;
  if (acc > state.bestAcc) state.bestAcc = acc;

  const checkTrophyUnlocked = (type) => {
    return (state.completed[type + '-1'] === 3) && 
           (state.completed[type + '-2'] === 3) && 
           (state.completed[type + '-3'] === 3);
  };

  const wasUnlocked = checkTrophyUnlocked(currentType);
  const key = currentType + '-' + (currentLevel + 1);
  if (!state.completed[key] || state.completed[key] < stars) state.completed[key] = stars;
  const isUnlockedNow = checkTrophyUnlocked(currentType);

  const banner = document.getElementById('trophy-unlocked-banner');
  const bannerName = document.getElementById('trophy-unlocked-name');
  if (banner && bannerName) {
    if (!wasUnlocked && isUnlockedNow) {
      const trophyNames = {
        click_basic: 'Mistrz Szybkości ⚡',
        click_precision: 'Sokole Oko 🎯',
        double_click: 'Władca Dwukliku 💥',
        drag: 'Wielki Tragarz 📦',
        maze: 'Nawigator Labiryntu 🌀',
        mixed: 'Władca Myszy 👑'
      };
      bannerName.textContent = trophyNames[currentType] || 'Złota Odznaka';
      banner.style.display = 'flex';
      setTimeout(() => {
        try { SoundFX.play('trophy'); } catch(e){}
      }, 500);
    } else {
      banner.style.display = 'none';
    }
  }

  const nick = state.playerNickname || localStorage.getItem('mousegame_nick') || 'Myszka';
  const entry = addScoreToRanking(currentType, currentLevel, nick, gameData.score, acc, stars);
  setCurrentScoreEntry(entry);

  const nickInput = document.getElementById('player-nick');
  if (nickInput) {
    nickInput.value = nick;
  }
  renderResultRanking(currentType, currentLevel);

  saveState();

  if (window.showScreen) window.showScreen('result-screen');
  startFireworks(stars);
}

// Global touch ring handler
document.addEventListener('touchstart', function(e) {
  const area = document.getElementById('game-area');
  if (!area) return;
  const rect = area.getBoundingClientRect();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const touch = e.changedTouches[i];
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      spawnTouchRing(x, y);
    }
  }
}, { passive: true });
