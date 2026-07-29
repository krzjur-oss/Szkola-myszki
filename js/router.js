// =========================================================
// ROUTER & NAVIGATION
// =========================================================
import { state, getStars, updateMenuStats, getAdaptiveModifier } from './state.js';
import { showTutorial } from './tutorials.js';
import { stopFireworks } from './fireworks.js';
import {
  stopActiveGame,
  clearGameArea,
  setCurrentTypeAndLevel,
  gameData,
  updateHUD,
  incrementGameSession,
  currentType,
  currentLevel
} from './engine.js';

import { startClickBasic, CLICK_BASIC_CFGS } from './games/click_basic.js';
import { startClickPrecision, PRECISION_CFGS } from './games/click_precision.js';
import { startDoubleClick, DOUBLE_CFGS } from './games/double_click.js';
import { startDrag } from './games/drag.js';
import { startMaze } from './games/maze.js';
import { startMixed } from './games/mixed.js';

export const GAME_CONFIGS = {
  click_basic:    { time: 30, targets: 20, minSize: 40, maxSize: 80, title: 'Kliknij cel!', levels: [
    { time: 40, minSize: 60, maxSize: 90, instruction: 'Klikaj koła lewym przyciskiem myszy!' },
    { time: 30, minSize: 40, maxSize: 70, instruction: 'Klikaj szybciej – cele są mniejsze!' },
    { time: 25, minSize: 44, maxSize: 60, instruction: 'Trudny poziom – małe i szybkie cele!' },
  ]},
  click_precision:{ title: 'Precyzja – klikaj tylko ★', levels: [
    { time: 40, instruction: 'Klikaj TYLKO ★ gwiazdki! Ignoruj koła.' },
    { time: 35, instruction: 'Klikaj TYLKO zielone kształty!' },
    { time: 30, instruction: 'Klikaj TYLKO koła (nie trójkąty, nie gwiazdy)!' },
  ]},
  double_click:   { title: 'Podwójne kliknięcie!', levels: [
    { time: 40, minSize: 70, maxSize: 90, instruction: 'Kliknij DWIE razy szybko na każdym kole!' },
    { time: 35, minSize: 55, maxSize: 75, instruction: 'Szybciej! Mniejsze cele.' },
    { time: 28, minSize: 50, maxSize: 68, instruction: 'Ekspert – małe cele, szybki podwójny klik!' },
  ]},
  drag:           { title: 'Przeciąganie!', levels: [
    { time: 60, pairs: 3, instruction: 'Przeciągnij każdy element na pasujące pole!' },
    { time: 50, pairs: 4, instruction: 'Więcej elementów – przeciągnij je wszystkie!' },
    { time: 45, pairs: 5, instruction: 'Mistrz przeciągania – wszystkie 5 par!' },
  ]},
  maze:           { title: 'Labirynt!', levels: [
    { time: 100, complexity: 1, instruction: 'Prowadź kulkę od START do METY. Nie dotykaj ścian!' },
    { time: 75, complexity: 2, instruction: 'Trudniejszy labirynt. Spokojnie i precyzyjnie!' },
    { time: 55, complexity: 3, instruction: 'Ekstremalny labirynt! Pełna koncentracja!' },
  ]},
  mixed:          { title: 'Wyzwanie!', levels: [
    { time: 45, instruction: '🟢 1× = jeden klik  |  🔵 2× = dwa kliknięcia' },
    { time: 38, instruction: '🟢 1×  |  🔵 2×  |  co 3. runda: 🟡★ kliknij tylko gwiazdkę!' },
    { time: 30, instruction: '🟢 1×  |  🔵 2×  |  🟡★ – precyzja co 3. rundę. Szybko!' },
  ]}
};

export const GAME_META = {
  click_basic:     { title:'Kliknij cel!',        icon:'👆', color:'#00e676',
    levels:[{label:'Łatwy',desc:'Klikaj koła które się pojawiają',time:40},{label:'Średni',desc:'Mniejsze cele, szybciej znikają',time:30},{label:'Trudny',desc:'Małe i błyskawiczne!',time:25}]},
  click_precision: { title:'Precyzja',            icon:'🎯', color:'#ffd740',
    levels:[{label:'Łatwy',desc:'Kliknij figurę z lewego panelu – tylko kolor różny',time:40},{label:'Średni',desc:'Kształt i kolor – cele co 4s się zmieniają',time:35},{label:'Trudny',desc:'Szybka rotacja co 2.5s – bądź czujny!',time:30}]},
  double_click:    { title:'Podwójne kliknięcie', icon:'✌️', color:'#ff4081',
    levels:[{label:'Łatwy',desc:'Klikaj 2× w fioletowe cele',time:40},{label:'Średni',desc:'🔵 2× klik | 🟢 1× klik – czytaj!',time:35},{label:'Trudny',desc:'Mix 1× i 2× – szybciej i mniejsze!',time:28}]},
  drag:            { title:'Przeciąganie',        icon:'✋', color:'#d500f9',
    levels:[{label:'Łatwy',desc:'3 pary do dopasowania',time:60,pairs:3},{label:'Średni',desc:'4 pary do dopasowania',time:50,pairs:4},{label:'Trudny',desc:'5 par – mistrz przeciągania!',time:45,pairs:5}]},
  maze:            { title:'Labirynt',            icon:'🌀', color:'#00d4ff',
    levels:[{label:'Łatwy',desc:'Duże korytarze, 100 sekund',time:100,targetCols:6,targetRows:4},{label:'Średni',desc:'Węższe ścieżki, 75 sekund',time:75,targetCols:10,targetRows:7},{label:'Trudny',desc:'Bardzo ciasne przejścia!',time:55,targetCols:15,targetRows:10}]},
  mixed:           { title:'Wyzwanie!',           icon:'🏆', color:'#ff6d00',
    levels:[{label:'Łatwy',desc:'🟢 1× klik | 🔵 2× klik',time:45},{label:'Średni',desc:'🟢 1× | 🔵 2× | 🟡★ precyzja co 3. rundę',time:38},{label:'Trudny',desc:'Wszystkie typy, więcej precyzji – szybko!',time:30}]},
};

window.GAME_CONFIGS = GAME_CONFIGS;
window.GAME_META = GAME_META;

export function showScreen(id) {
  if (id !== 'result-screen') stopFireworks();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (!el) {
    const menuEl = document.getElementById('menu-screen');
    if (menuEl) menuEl.classList.add('active');
    return;
  }
  el.classList.add('active');
}

export function navigate(hash) {
  try { history.pushState(null, '', '#' + hash); } catch(e) {}
  _dispatch(hash);
}

export function _dispatch(hash) {
  stopActiveGame();
  if (!hash || hash === 'menu') { updateMenuStats(); showScreen('menu-screen'); return; }
  const lv = hash.match(/^level\/([^/]+)$/);
  if (lv) { showLevelScreen(lv[1]); return; }
  const gm = hash.match(/^game\/([^/]+)\/([123])$/);
  if (gm) { _launchGame(gm[1], parseInt(gm[2]) - 1); return; }
  updateMenuStats(); showScreen('menu-screen');
}

export function showLevelScreen(gameId) {
  const meta = GAME_META[gameId];
  if (!meta) { navigate('menu'); return; }
  document.getElementById('level-game-title').innerHTML =
    '<span>' + meta.icon + '</span><span style="color:' + meta.color + '">' + meta.title + '</span>';

  const adaptiveBanner = document.getElementById('level-adaptive-banner');
  if (adaptiveBanner) {
    const mod = getAdaptiveModifier(gameId);
    if (mod.active) {
      adaptiveBanner.style.display = 'flex';
      adaptiveBanner.className = 'level-adaptive-banner ' + mod.badgeClass;
      adaptiveBanner.innerHTML = mod.badgeText + `<br><small style="font-size:0.8rem; font-weight:400; opacity:0.9;">${mod.detailText}</small>`;
    } else {
      adaptiveBanner.style.display = 'none';
    }
  }

  const cards = document.getElementById('level-cards');
  const rows = meta.levels.map(function(lv, i) {
    const s = getStars(gameId, i);
    const stars = '⭐'.repeat(s) + '☆'.repeat(3 - s);
    const div = document.createElement('div');
    div.className = 'level-card';
    div.style.cssText = '--lv-color:' + meta.color;

    const pct = i === 0 ? 25 : i === 1 ? 60 : 95;
    const diffColor = i === 0 ? '#00e676' : i === 1 ? '#ffd740' : '#ff1744';
    const diffGradient = i === 0 
      ? 'linear-gradient(90deg, #00e676, #4caf50)' 
      : i === 1 
        ? 'linear-gradient(90deg, #00e676, #ffd740)' 
        : 'linear-gradient(90deg, #00e676, #ffd740, #ff1744)';
    const diffText = i === 0 ? 'Łatwy' : i === 1 ? 'Średni' : 'Trudny';

    div.innerHTML =
      '<div class="lv-num">' + ['I','II','III'][i] + '</div>' +
      '<div class="lv-label">' + lv.label + '</div>' +
      '<div class="lv-desc">' + lv.desc + '</div>' +

      '<div class="difficulty-container">' +
        '<div class="difficulty-header">' +
          '<span>Trudność:</span>' +
          '<span class="difficulty-value" style="color:' + diffColor + '">' + diffText + ' (' + pct + '%)</span>' +
        '</div>' +
        '<div class="difficulty-slider-track">' +
          '<div class="difficulty-slider-fill" style="width:' + pct + '%; background:' + diffGradient + '"></div>' +
          '<div class="difficulty-slider-thumb" style="left:' + pct + '%; border-color:' + diffColor + '; box-shadow:0 0 8px ' + diffColor + '"></div>' +
        '</div>' +
      '</div>' +

      '<div class="lv-stars">' + stars + '</div>' +
      '<button class="lv-btn" style="background:' + meta.color + '">' +
        (s > 0 ? '🔄 Zagraj ponownie' : '▶ Zagraj') +
      '</button>';

    const rankKey = gameId + '-' + (i + 1);
    const rankings = (state.rankings && state.rankings[rankKey]) || [];
    
    const rBtn = document.createElement('button');
    rBtn.className = 'lv-ranking-btn';
    rBtn.innerHTML = '🏆 Zobacz ranking';
    
    const rDrawer = document.createElement('div');
    rDrawer.className = 'lv-ranking-drawer';
    
    let drawerContent = `
      <div style="font-family:'Fredoka One',cursive; font-size:0.8rem; color:var(--accent); margin-bottom:6px; text-align:left;">TOP 5 REKORDÓW:</div>
    `;
    if (rankings.length === 0) {
      drawerContent += `<div style="font-size:0.75rem; color:var(--muted); text-align:left;">Brak wyników. Bądź pierwszy!</div>`;
    } else {
      drawerContent += `
        <table class="ranking-table" style="font-size:0.75rem; width:100%;">
          <tbody>
      `;
      rankings.slice(0, 5).forEach((item, idx) => {
        const posClass = idx < 3 ? `ranking-pos-${idx + 1}` : '';
        drawerContent += `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
            <td class="ranking-pos ${posClass}" style="padding: 3px 2px; width: 15px;">${idx + 1}</td>
            <td style="text-align:left; font-weight:800; max-width: 85px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 3px 2px;" title="${item.name}">${item.name}</td>
            <td style="text-align:right; color:var(--yellow); padding: 3px 2px;">${item.score}</td>
            <td style="text-align:right; color:var(--green); padding: 3px 2px;">${item.acc}%</td>
          </tr>
        `;
      });
      drawerContent += `
          </tbody>
        </table>
      `;
    }
    rDrawer.innerHTML = drawerContent;
    
    rBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      rDrawer.classList.toggle('open');
      if (rDrawer.classList.contains('open')) {
        rBtn.innerHTML = '❌ Zamknij';
        rBtn.style.borderColor = 'var(--red)';
        rBtn.style.color = 'var(--red)';
      } else {
        rBtn.innerHTML = '🏆 Zobacz ranking';
        rBtn.style.borderColor = '';
        rBtn.style.color = '';
      }
    });
    rBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      rDrawer.classList.toggle('open');
      if (rDrawer.classList.contains('open')) {
        rBtn.innerHTML = '❌ Zamknij';
        rBtn.style.borderColor = 'var(--red)';
        rBtn.style.color = 'var(--red)';
      } else {
        rBtn.innerHTML = '🏆 Zobacz ranking';
        rBtn.style.borderColor = '';
        rBtn.style.color = '';
      }
    });
    
    rDrawer.addEventListener('click', function(e) { e.stopPropagation(); });
    rDrawer.addEventListener('touchend', function(e) { e.stopPropagation(); });
    
    div.appendChild(rBtn);
    div.appendChild(rDrawer);

    const dest = 'game/' + gameId + '/' + (i + 1);
    div.addEventListener('click', function() { navigate(dest); });
    div.addEventListener('touchend', function(e) { e.preventDefault(); navigate(dest); });
    return div;
  });
  cards.innerHTML = '';
  rows.forEach(function(el) { cards.appendChild(el); });
  showScreen('level-screen');
}

export function startGame(type, level = 0) {
  setCurrentTypeAndLevel(type, level);
  const alreadyPlayed = state.completed[type + '-' + (level+1)];
  if (!alreadyPlayed) {
    showTutorial(type, () => _startGame(type, level));
  } else {
    _startGame(type, level);
  }
}

export function _startGame(type, level) {
  setCurrentTypeAndLevel(type, level);
  incrementGameSession();
  const cfg = GAME_CONFIGS[type] || { title: '', levels: [] };
  const lvl = (cfg.levels && cfg.levels[level]) || { instruction: '', time: 30 };

  document.getElementById('g-title').textContent = (cfg.title || '') + ' — ' + (['Łatwy','Średni','Trudny'][level] || '');
  document.getElementById('g-instruction').textContent = lvl.instruction || '';

  gameData.score = 0;
  gameData.hits = 0;
  gameData.miss = 0;
  gameData.time = lvl.time || 30;
  gameData.maxTime = lvl.time || 30;

  updateHUD();
  showScreen('game-screen');
  clearGameArea();

  if (type === 'click_basic')          startClickBasic(CLICK_BASIC_CFGS[level]);
  else if (type === 'click_precision')  startClickPrecision(PRECISION_CFGS[level], level);
  else if (type === 'double_click')     startDoubleClick(DOUBLE_CFGS[level]);
  else if (type === 'drag')            startDrag(lvl, level);
  else if (type === 'maze')            startMaze(lvl, level);
  else if (type === 'mixed')           startMixed(lvl, level);
}

function _launchGame(gameId, levelIdx) {
  const meta = GAME_META[gameId];
  if (!meta || !meta.levels[levelIdx]) { navigate('level/' + gameId); return; }
  _startGame(gameId, levelIdx);
}

export function nextLevel() {
  stopFireworks();
  if (currentLevel < 2) navigate('game/' + currentType + '/' + (currentLevel + 2));
  else navigate('level/' + currentType);
}

export function retryGame() {
  navigate('game/' + currentType + '/' + (currentLevel + 1));
}

export function goMenu() {
  navigate('menu');
}

window.addEventListener('popstate', function() {
  try {
    _dispatch(location.hash.slice(1) || 'menu');
  } catch(e) {
    showScreen('menu-screen');
  }
});

// Attach routing and menu functions to window for HTML inline handlers
window.navigate = navigate;
window.showScreen = showScreen;
window.nextLevel = nextLevel;
window.retryGame = retryGame;
window.goMenu = goMenu;
window.startGame = startGame;
