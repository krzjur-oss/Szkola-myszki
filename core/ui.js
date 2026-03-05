// ============================================================
// core/ui.js – ekrany aplikacji (menu, wybór poziomu, wyniki)
// ============================================================
import { state, getStars } from './state.js';
import { navigate } from './router.js';

// ── Definicje gier ─────────────────────────────────────────
export const GAMES = {
  'click-basic': {
    title: 'Kliknij cel!',
    icon: '👆',
    color: '#00e676',
    desc: 'Klikaj pojawiające się koła jak najszybciej!',
    levels: [
      { label: 'Łatwy',  desc: 'Duże koła, dużo czasu',         time: 40 },
      { label: 'Średni', desc: 'Mniejsze koła, mniej czasu',     time: 30 },
      { label: 'Trudny', desc: 'Małe i szybkie – sprawdź się!',  time: 25 },
    ]
  },
  'precision': {
    title: 'Precyzja',
    icon: '🎯',
    color: '#ffd740',
    desc: 'Klikaj tylko właściwy kształt lub kolor!',
    levels: [
      { label: 'Łatwy',  desc: 'Klikaj tylko gwiazdki ★',        time: 40 },
      { label: 'Średni', desc: 'Klikaj tylko zielone kształty',  time: 35 },
      { label: 'Trudny', desc: 'Klikaj tylko niebieskie koła',   time: 30 },
    ]
  },
  'double-click': {
    title: 'Podwójne kliknięcie',
    icon: '✌️',
    color: '#ff4081',
    desc: 'Klikaj dwa razy szybko – jak otwieranie pliku!',
    levels: [
      { label: 'Łatwy',  desc: 'Duże cele, dużo czasu',          time: 40 },
      { label: 'Średni', desc: 'Mniejsze cele',                  time: 35 },
      { label: 'Trudny', desc: 'Małe cele, szybki podwójny klik',time: 28 },
    ]
  },
  'drag': {
    title: 'Przeciąganie',
    icon: '✋',
    color: '#d500f9',
    desc: 'Chwyć, przeciągnij i upuść na właściwe miejsce!',
    levels: [
      { label: 'Łatwy',  desc: '3 pary do dopasowania',          time: 60, pairs: 3 },
      { label: 'Średni', desc: '4 pary do dopasowania',          time: 50, pairs: 4 },
      { label: 'Trudny', desc: '5 par – mistrz przeciągania!',   time: 45, pairs: 5 },
    ]
  },
  'maze': {
    title: 'Labirynt',
    icon: '🌀',
    color: '#00d4ff',
    desc: 'Prowadź kulkę od startu do mety bez dotykania ścian!',
    levels: [
      { label: 'Łatwy',  desc: 'Duże korytarze, 100 sekund',     time: 100, targetCols: 6,  targetRows: 4  },
      { label: 'Średni', desc: 'Węższe ścieżki, 75 sekund',      time: 75,  targetCols: 10, targetRows: 7  },
      { label: 'Trudny', desc: 'Bardzo ciasne przejścia!',       time: 55,  targetCols: 15, targetRows: 10 },
    ]
  },
  'mixed': {
    title: 'Wyzwanie!',
    icon: '🏆',
    color: '#ff6d00',
    desc: 'Mix wszystkich typów – czytaj kolor i działaj!',
    levels: [
      { label: 'Łatwy',  desc: '🟢 1× klik  |  🔵 2× klik',                          time: 45 },
      { label: 'Średni', desc: '🟢 1×  |  🔵 2×  |  🟡★ precyzja co 3. rundę',       time: 38 },
      { label: 'Trudny', desc: 'Wszystkie typy, więcej precyzji – szybko!',           time: 30 },
    ]
  }
};

// ── Główny kontener ────────────────────────────────────────
function _app() { return document.getElementById('app'); }

// ── EKRAN: MENU ────────────────────────────────────────────
export function showMenu() {
  _app().innerHTML = `
    <div class="screen menu-screen">
      <div class="logo">
        <h1>🖱️ Szkoła Myszki</h1>
        <p>Naucz się obsługi myszy i touchpada krok po kroku</p>
      </div>

      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value" style="color:var(--yellow)">${state.totalScore}</div>
          <div class="stat-label">Punkty</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color:var(--green)">${state.totalGames}</div>
          <div class="stat-label">Ukończone</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color:var(--yellow)">⭐ ${state.totalStars}</div>
          <div class="stat-label">Gwiazdki</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color:var(--accent)">${state.bestAcc ? state.bestAcc + '%' : '–'}</div>
          <div class="stat-label">Najlepsza dokładność</div>
        </div>
      </div>

      <div class="categories">
        ${Object.entries(GAMES).map(([id, g]) => {
          const stars = [1,2,3].map(l => getStars(id, l));
          const totalS = stars.reduce((a,b) => a+b, 0);
          return `
          <div class="category-card" style="--cat-color:${g.color}" data-game="${id}">
            <div class="cat-header">
              <span class="cat-icon">${g.icon}</span>
              <div>
                <div class="cat-title">${g.title}</div>
                <div class="cat-total-stars">${_starsHtml(totalS, 9)}</div>
              </div>
            </div>
            <div class="cat-desc">${g.desc}</div>
            <div class="cat-levels">
              ${g.levels.map((lv, i) => `
                <span class="level-badge ${stars[i] > 0 ? 'done' : ''}">
                  ${lv.label} ${_starsHtml(stars[i], 3)}
                </span>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

  _app().querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => navigate('level/' + card.dataset.game));
    card.addEventListener('touchend', (e) => {
      e.preventDefault();
      navigate('level/' + card.dataset.game);
    }, { passive: false });
  });
}

// ── EKRAN: WYBÓR POZIOMU ───────────────────────────────────
export function showLevelSelect(gameId) {
  const g = GAMES[gameId];
  if (!g) { navigate('menu'); return; }

  _app().innerHTML = `
    <div class="screen level-screen">
      <div class="level-header">
        <button class="back-btn" id="btn-back">← Menu</button>
        <div class="level-game-title">
          <span style="font-size:2rem">${g.icon}</span>
          <span style="color:${g.color}">${g.title}</span>
        </div>
      </div>

      <div class="level-desc">${g.desc}</div>

      <div class="level-cards">
        ${g.levels.map((lv, i) => {
          const stars = getStars(gameId, i + 1);
          return `
          <div class="level-card" style="--lv-color:${g.color}" data-level="${i+1}">
            <div class="lv-num">${['I','II','III'][i]}</div>
            <div class="lv-label">${lv.label}</div>
            <div class="lv-desc">${lv.desc}</div>
            <div class="lv-stars">${_starsHtml(stars, 3, true)}</div>
            <button class="btn btn-play" style="background:${g.color}">
              ${stars > 0 ? '🔄 Zagraj ponownie' : '▶ Zagraj'}
            </button>
          </div>`;
        }).join('')}
      </div>
    </div>`;

  document.getElementById('btn-back').addEventListener('click', () => navigate('menu'));
  _app().querySelectorAll('.level-card').forEach(card => {
    const startFn = () => navigate(`game/${gameId}/${card.dataset.level}`);
    card.querySelector('.btn-play').addEventListener('click', startFn);
  });
}

// ── EKRAN: POWŁOKA GRY ─────────────────────────────────────
export function showGameShell(gameId, level) {
  const g = GAMES[gameId];
  const lv = g?.levels[level - 1];

  _app().innerHTML = `
    <div class="screen game-screen" id="game-screen">
      <div class="game-header">
        <button class="back-btn" id="btn-back-game">← Menu</button>
        <div class="game-info">
          <div class="game-title">${g?.icon ?? ''} ${g?.title ?? ''} — ${lv?.label ?? ''}</div>
          <div class="game-instruction" id="g-instruction">${lv?.desc ?? ''}</div>
        </div>
        <div class="game-hud">
          <div class="hud-item">
            <div class="hud-val" id="hud-score" style="color:var(--yellow)">0</div>
            <div class="hud-lbl">Punkty</div>
          </div>
          <div class="hud-item">
            <div class="hud-val" id="hud-hits" style="color:var(--green)">0</div>
            <div class="hud-lbl">Trafienia</div>
          </div>
          <div class="hud-item">
            <div class="hud-val" id="hud-miss" style="color:var(--red)">0</div>
            <div class="hud-lbl">Pudła</div>
          </div>
          <div class="hud-item">
            <div class="hud-val" id="hud-time" style="color:var(--accent)">${lv?.time ?? 30}</div>
            <div class="hud-lbl">Czas</div>
          </div>
        </div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" id="prog-bar" style="width:100%"></div>
      </div>
      <div class="game-area" id="game-area"></div>
    </div>`;

  document.getElementById('btn-back-game').addEventListener('click', () => {
    navigate('menu');
  });
}

// ── EKRAN: WYNIKI ──────────────────────────────────────────
export function showResult({ gameId, level, stars, acc, score, hits, miss }) {
  const g = GAMES[gameId];
  const hasNext = level < 3;
  const emojis  = ['😔','😊','🎉','🏆'];
  const titles  = ['Nie poddawaj się!','Dobra robota!','Świetnie!','Mistrz!'];

  _app().innerHTML = `
    <div class="screen result-screen">
      <div class="result-card">
        <div class="result-emoji">${emojis[stars]}</div>
        <div class="stars large">${_starsHtml(stars, 3, true)}</div>
        <div class="result-title">${titles[stars]}</div>
        <div class="result-sub">${g?.icon} ${g?.title} — ${g?.levels[level-1]?.label}</div>
        <div class="result-stats">
          <div class="result-stat">
            <div class="result-stat-val" style="color:var(--yellow)">${score}</div>
            <div class="result-stat-lbl">Punkty</div>
          </div>
          <div class="result-stat">
            <div class="result-stat-val" style="color:var(--green)">${acc}%</div>
            <div class="result-stat-lbl">Dokładność</div>
          </div>
          <div class="result-stat">
            <div class="result-stat-val" style="color:var(--accent)">${hits}</div>
            <div class="result-stat-lbl">Trafienia</div>
          </div>
          <div class="result-stat">
            <div class="result-stat-val" style="color:var(--red)">${miss}</div>
            <div class="result-stat-lbl">Pudła</div>
          </div>
        </div>
        <div class="result-btns">
          ${hasNext ? `<button class="btn btn-primary" id="btn-next">Następny poziom ▶</button>` : ''}
          <button class="btn btn-secondary" id="btn-retry">🔄 Powtórz</button>
          <button class="btn btn-secondary" id="btn-levels">☰ Poziomy</button>
          <button class="btn btn-secondary" id="btn-menu">🏠 Menu</button>
        </div>
      </div>
    </div>`;

  if (hasNext) document.getElementById('btn-next')
    .addEventListener('click', () => navigate(`game/${gameId}/${level + 1}`));
  document.getElementById('btn-retry')
    .addEventListener('click', () => navigate(`game/${gameId}/${level}`));
  document.getElementById('btn-levels')
    .addEventListener('click', () => navigate(`level/${gameId}`));
  document.getElementById('btn-menu')
    .addEventListener('click', () => navigate('menu'));
}

// ── TUTORIAL OVERLAY ───────────────────────────────────────
const TUTORIALS = {
  'click-basic':   { icon:'👆', title:'Kliknij cel!',            tips:['Klikaj lewym przyciskiem myszy','Mniejszy cel = więcej punktów','Szybkość się opłaca!','Nie klikaj w puste miejsce'] },
  'precision':     { icon:'🎯', title:'Precyzja!',               tips:['Czytaj instrukcję u góry','Klikaj TYLKO właściwy cel','Za zły klik tracisz punkty!','Nie spiesz się'] },
  'double-click':  { icon:'✌️', title:'Podwójne kliknięcie!',    tips:['Klik–klik w tym samym miejscu','Dwa szybkie uderzenia','Nie ruszaj myszy między kliknięciami','Jedno kliknięcie = pudło'] },
  'drag':          { icon:'✋', title:'Przeciąganie!',            tips:['Klik → trzymaj → przeciągnij → puść','Dopasuj kolor do koloru pola','Touchpad: przesuń dwoma palcami'] },
  'maze':          { icon:'🌀', title:'Labirynt!',               tips:['Ruszaj myszą – kulka podąża','Powoli i precyzyjnie!','Dotknięcie ściany = wróć do startu','Touchpad: spokojne przesunięcia'] },
  'mixed':         { icon:'🏆', title:'Wyzwanie!',               tips:['🟢 Zielone = 1 klik','🔵 Niebieskie = 2 kliki','🟡★ Gwiazdka = kliknij tylko ją','Czytaj kolor i działaj!'] },
};

export function showTutorial(gameId, callback) {
  const t = TUTORIALS[gameId];
  if (!t) { callback(); return; }

  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
    <div class="tutorial-box">
      <div class="tutorial-icon">${t.icon}</div>
      <h2>${t.title}</h2>
      <ul>${t.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>
      <button class="btn btn-primary" id="btn-tut-start">▶ Zaczynamy!</button>
    </div>`;
  document.body.appendChild(overlay);

  document.getElementById('btn-tut-start').addEventListener('click', () => {
    overlay.remove();
    callback();
  });
}

// ── Helpers ────────────────────────────────────────────────
function _starsHtml(count, max = 3, large = false) {
  const cls = large ? 'star large' : 'star';
  return Array.from({ length: max }, (_, i) =>
    `<span class="${cls} ${i < count ? 'filled' : 'empty'}">${i < count ? '⭐' : '☆'}</span>`
  ).join('');
}
