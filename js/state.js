// =========================================================
// STATE & PERSISTENCE
// =========================================================
import { SoundFX } from './sound.js';

export const state = {
  totalScore: 0,
  totalGames: 0,
  totalStars: 0,
  bestAcc: 0,
  completed: {},
  rankings: {},
  playerNickname: 'Myszka',
  adaptiveDifficulty: false,
  gameHistory: []
};

export const saveState = () => {
  try {
    localStorage.setItem('mousegame', JSON.stringify(state));
  } catch(e) {}
};

export const loadState = () => {
  try {
    const d = localStorage.getItem('mousegame');
    if (d) {
      try {
        Object.assign(state, JSON.parse(d));
      } catch(e) {}
    }
    if (!state.completed) state.completed = {};
    if (!state.rankings) state.rankings = {};
    if (!Array.isArray(state.gameHistory)) state.gameHistory = [];
    if (typeof state.adaptiveDifficulty !== 'boolean') state.adaptiveDifficulty = false;
    if (!state.playerNickname) {
      try {
        state.playerNickname = localStorage.getItem('mousegame_nick') || 'Myszka';
      } catch(e) {
        state.playerNickname = 'Myszka';
      }
    }
  } catch(e) {
    if (!state.completed) state.completed = {};
    if (!state.rankings) state.rankings = {};
    if (!Array.isArray(state.gameHistory)) state.gameHistory = [];
    if (typeof state.adaptiveDifficulty !== 'boolean') state.adaptiveDifficulty = false;
    if (!state.playerNickname) state.playerNickname = 'Myszka';
  }

  try {
    const menuInput = document.getElementById('menu-player-nick');
    if (menuInput) {
      menuInput.value = state.playerNickname || 'Myszka';
    }
    const adaptiveToggle = document.getElementById('menu-adaptive-toggle');
    if (adaptiveToggle) {
      adaptiveToggle.checked = !!state.adaptiveDifficulty;
    }
    updateMenuStats();
  } catch(e) {}
};

export function updatePlayerNickFromMenu(val) {
  const nick = val.trim() || 'Myszka';
  state.playerNickname = nick;
  try {
    localStorage.setItem('mousegame_nick', nick);
  } catch(e) {}
  saveState();
}

let currentScoreEntry = null;

export function setCurrentScoreEntry(entry) {
  currentScoreEntry = entry;
}

export function getCurrentScoreEntry() {
  return currentScoreEntry;
}

export function addScoreToRanking(gameId, levelIdx, name, score, acc, stars) {
  const key = gameId + '-' + (levelIdx + 1);
  if (!state.rankings) state.rankings = {};
  if (!state.rankings[key]) state.rankings[key] = [];
  
  const entry = {
    name: name || 'Myszka',
    score: score,
    acc: acc,
    stars: stars,
    date: new Date().toLocaleDateString('pl-PL') + ' ' + new Date().toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'})
  };
  
  state.rankings[key].push(entry);
  
  // Sort descending by score, then accuracy, then stars
  state.rankings[key].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.acc !== a.acc) return b.acc - a.acc;
    return b.stars - a.stars;
  });
  
  // Keep top 10
  if (state.rankings[key].length > 10) {
    state.rankings[key] = state.rankings[key].slice(0, 10);
  }
  
  saveState();
  currentScoreEntry = entry;
  return entry;
}

export function renderResultRanking(currentType, currentLevel) {
  const key = currentType + '-' + (currentLevel + 1);
  const rankingList = (state.rankings && state.rankings[key]) || [];
  const tbody = document.getElementById('res-ranking-body');
  const levelTitle = ['Łatwy', 'Średni', 'Trudny'][currentLevel] || '';
  
  const lvlNameEl = document.getElementById('ranking-lvl-name');
  if (lvlNameEl) {
    lvlNameEl.textContent = levelTitle;
  }
  
  if (tbody) {
    tbody.innerHTML = '';
    if (rankingList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--muted); padding:10px 0;">Brak zapisanych wyników</td></tr>';
      return;
    }
    
    rankingList.forEach((item, idx) => {
      const isCurrent = (item === currentScoreEntry);
      const row = document.createElement('tr');
      if (isCurrent) {
        row.className = 'ranking-row-highlight';
      }
      
      const posClass = idx < 3 ? `ranking-pos-${idx + 1}` : '';
      const starIcon = '⭐'.repeat(item.stars || 0);
      
      row.innerHTML = `
        <td class="ranking-pos ${posClass}">${idx + 1}</td>
        <td style="text-align:left; font-weight:800; max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.name}">${item.name}</td>
        <td style="text-align:right; color:var(--yellow)">${item.score} <span style="font-size:0.7rem; color:var(--muted)">pkt</span></td>
        <td style="text-align:right; color:var(--green)">${item.acc}% ${starIcon ? '<span style="font-size:0.7rem;">' + starIcon + '</span>' : ''}</td>
      `;
      tbody.appendChild(row);
    });
  }
}

export function submitScore(currentType, currentLevel) {
  const input = document.getElementById('player-nick');
  const nick = (input ? input.value : '').trim() || 'Myszka';
  state.playerNickname = nick;
  try {
    localStorage.setItem('mousegame_nick', nick);
  } catch(e) {}
  
  const menuInput = document.getElementById('menu-player-nick');
  if (menuInput) menuInput.value = nick;
  
  if (currentScoreEntry) {
    currentScoreEntry.name = nick;
    saveState();
    if (currentType !== undefined && currentLevel !== undefined) {
      renderResultRanking(currentType, currentLevel);
    }
  }
  
  SoundFX.play('click');
  
  const btn = document.querySelector('#nick-group .btn-save-score');
  if (btn) {
    btn.textContent = 'Zapisano! ✅';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.textContent = 'Zapisz 🏆';
      btn.disabled = false;
      btn.style.opacity = '1';
    }, 2000);
  }
}

export function updateMenuStats() {
  try {
    const elScore = document.getElementById('total-score');
    if (elScore) elScore.textContent = state.totalScore || 0;

    const elGames = document.getElementById('total-games');
    if (elGames) elGames.textContent = state.totalGames || 0;

    const elStars = document.getElementById('total-stars');
    if (elStars) elStars.textContent = '⭐ ' + (state.totalStars || 0);

    const elAcc = document.getElementById('best-acc');
    if (elAcc) elAcc.textContent = state.bestAcc ? state.bestAcc + '%' : '-';

    if (state.completed) {
      for (const [k, v] of Object.entries(state.completed)) {
        const el = document.getElementById('b-' + k);
        if (el) el.classList.add('done');
      }
    }

    const categories = ['click_basic', 'click_precision', 'double_click', 'drag', 'maze', 'mixed'];
    categories.forEach(catId => {
      let threeStarCount = 0;
      if (state.completed) {
        for (let lvl = 1; lvl <= 3; lvl++) {
          const key = catId + '-' + lvl;
          if (state.completed[key] === 3) {
            threeStarCount++;
          }
        }
      }

      const trophyCard = document.getElementById('trophy-' + catId);
      const progressEl = document.getElementById('progress-' + catId);

      if (progressEl) {
        progressEl.innerHTML = `⭐ <span>${threeStarCount}/3</span>`;
      }

      if (trophyCard) {
        if (threeStarCount === 3) {
          trophyCard.classList.add('unlocked');
        } else {
          trophyCard.classList.remove('unlocked');
        }
      }
    });

    // Sync Adaptive & Accuracy UI
    const adaptiveToggle = document.getElementById('menu-adaptive-toggle');
    if (adaptiveToggle) {
      adaptiveToggle.checked = !!state.adaptiveDifficulty;
    }

    const stats = getAccuracyStats();
    const menuRatingEl = document.getElementById('menu-accuracy-rating');
    if (menuRatingEl) {
      menuRatingEl.textContent = stats.totalGames > 0 
        ? `${stats.rating} (${stats.recentAvgAccuracy}% celności)` 
        : 'Zagraj pierwsze gry, by stworzyć profil!';
    }

    const menuAdaptiveDesc = document.getElementById('menu-adaptive-desc');
    if (menuAdaptiveDesc) {
      if (!state.adaptiveDifficulty) {
        menuAdaptiveDesc.textContent = 'Trudność adaptacyjna wyłączona (standardowe rozmiary i czas celów).';
      } else {
        const mod = getAdaptiveModifier('click_basic');
        menuAdaptiveDesc.textContent = mod.detailText;
      }
    }
  } catch(e) {
    console.warn('Błąd updateMenuStats:', e);
  }
}

export function openAccuracyModal() {
  const modal = document.getElementById('accuracy-modal');
  if (!modal) return;

  const stats = getAccuracyStats();
  const gameNames = {
    click_basic: 'Jednym kliknięciem 👆',
    click_precision: 'Precyzja 🎯',
    double_click: 'Podwójne kliknięcie ✌️',
    drag: 'Przeciąganie 📦',
    maze: 'Labirynt 🌀',
    mixed: 'Wyzwanie 🏆'
  };

  const overallAccEl = document.getElementById('acc-modal-overall');
  const totalGamesEl = document.getElementById('acc-modal-games');
  const ratingEl = document.getElementById('acc-modal-rating');
  const tableBody = document.getElementById('acc-modal-table-body');
  const adviceEl = document.getElementById('acc-modal-advice');

  if (overallAccEl) overallAccEl.textContent = (stats.recentAvgAccuracy || stats.avgAccuracy || 0) + '%';
  if (totalGamesEl) totalGamesEl.textContent = stats.totalGames || 0;
  if (ratingEl) ratingEl.textContent = stats.rating || 'NOWIK';

  if (tableBody) {
    tableBody.innerHTML = '';
    const categories = ['click_basic', 'click_precision', 'double_click', 'drag', 'maze', 'mixed'];
    
    categories.forEach(catId => {
      const gData = stats.byGame[catId] || { count: 0, avg: 0, last: 0 };
      const tr = document.createElement('tr');
      const accColor = gData.avg >= 85 ? 'var(--green)' : gData.avg >= 65 ? 'var(--yellow)' : gData.count > 0 ? 'var(--red)' : 'var(--muted)';
      tr.innerHTML = `
        <td style="text-align:left; font-weight:700; color:#fff;">${gameNames[catId]}</td>
        <td style="text-align:center;">${gData.count}</td>
        <td style="text-align:right; font-weight:800; color:${accColor};">${gData.count > 0 ? gData.avg + '%' : '—'}</td>
      `;
      tableBody.appendChild(tr);
    });
  }

  if (adviceEl) {
    if (stats.totalGames === 0) {
      adviceEl.textContent = 'Brak zarejestrowanych gier. Rozegraj kilka poziomów, aby odblokować rekomendacje treningowe!';
    } else if (stats.recentAvgAccuracy >= 85) {
      adviceEl.textContent = 'Znakomita celność! Twój kursor pracuje niezwykle precyzyjnie. Włącz tryb adaptacyjny, aby zmierzyć się z mniejszymi i szybszymi celami!';
    } else if (stats.recentAvgAccuracy < 65) {
      adviceEl.textContent = 'Pracujesz nad wyczuciem myszy. Polecamy włączyć Trudność Adaptacyjną — powiększy ona cele i da Ci więcej czasu na reakcję!';
    } else {
      adviceEl.textContent = 'Dobra stabilność celowania! Twoja celność mieści się w optymalnym przedziale 60-85%. kontynuuj trening!';
    }
  }

  if (typeof window.renderAccuracyChart === 'function') {
    try { window.renderAccuracyChart('accuracy-chart-root'); } catch(e) { console.warn('Accuracy chart error:', e); }
  }

  modal.classList.add('active');
}

export function closeAccuracyModal() {
  const modal = document.getElementById('accuracy-modal');
  if (modal) modal.classList.remove('active');
}

export function recordGamePerformance(gameId, levelIdx, hits, miss, accuracy, score, stars) {
  if (!Array.isArray(state.gameHistory)) state.gameHistory = [];
  
  const record = {
    gameId,
    levelIdx,
    hits,
    miss,
    accuracy: Math.round(accuracy),
    score,
    stars,
    timestamp: Date.now()
  };
  
  state.gameHistory.push(record);
  if (state.gameHistory.length > 25) {
    state.gameHistory = state.gameHistory.slice(state.gameHistory.length - 25);
  }
  
  saveState();
  return record;
}

export function setAdaptiveDifficulty(enabled) {
  state.adaptiveDifficulty = !!enabled;
  saveState();
  const toggleEl = document.getElementById('menu-adaptive-toggle');
  if (toggleEl) toggleEl.checked = state.adaptiveDifficulty;
  updateMenuStats();
}

export function getAccuracyStats(targetGameId = null) {
  const history = Array.isArray(state.gameHistory) ? state.gameHistory : [];
  
  let filtered = history;
  if (targetGameId) {
    filtered = history.filter(h => h.gameId === targetGameId);
  }
  
  const total = filtered.length;
  if (total === 0) {
    return {
      avgAccuracy: 0,
      recentAvgAccuracy: 0,
      totalGames: 0,
      rating: 'NOWIK',
      byGame: {}
    };
  }
  
  const sumAcc = filtered.reduce((acc, item) => acc + (item.accuracy || 0), 0);
  const avgAccuracy = Math.round(sumAcc / total);
  
  const recentSlice = filtered.slice(-5);
  const recentSum = recentSlice.reduce((acc, item) => acc + (item.accuracy || 0), 0);
  const recentAvgAccuracy = Math.round(recentSum / recentSlice.length);
  
  const byGame = {};
  history.forEach(item => {
    if (!byGame[item.gameId]) {
      byGame[item.gameId] = { count: 0, sum: 0, avg: 0, last: 0 };
    }
    byGame[item.gameId].count++;
    byGame[item.gameId].sum += item.accuracy || 0;
    byGame[item.gameId].last = item.accuracy || 0;
    byGame[item.gameId].avg = Math.round(byGame[item.gameId].sum / byGame[item.gameId].count);
  });
  
  let rating = 'NOWIK 🐣';
  if (recentAvgAccuracy >= 90) rating = 'MISTRZ PRECYZJI 🏆';
  else if (recentAvgAccuracy >= 80) rating = 'ZAAWANSOWANY 🎯';
  else if (recentAvgAccuracy >= 65) rating = 'ŚREDNIO-ZAAWANSOWANY ⚡';
  else if (recentAvgAccuracy >= 50) rating = 'POCZĄTKUJĄCY 📈';
  
  return {
    avgAccuracy,
    recentAvgAccuracy,
    totalGames: total,
    rating,
    byGame
  };
}

export function getAdaptiveModifier(gameId) {
  if (!state.adaptiveDifficulty) {
    return {
      active: false,
      sizeFactor: 1.0,
      timeFactor: 1.0,
      mode: 'normal',
      levelLabel: 'STANDARDOWA',
      badgeText: '⚙️ Standardowa trudność',
      detailText: 'Trudność adaptacyjna jest wyłączona. Wszystkie parametry są standardowe.',
      badgeClass: 'adaptive-normal'
    };
  }
  
  const history = Array.isArray(state.gameHistory) ? state.gameHistory : [];
  const modeHistory = history.filter(h => h.gameId === gameId);
  
  // Use mode-specific recent games if at least 2, otherwise fallback to overall recent games
  const pool = modeHistory.length >= 2 ? modeHistory : history;
  const recent = pool.slice(-5);
  
  if (recent.length === 0) {
    return {
      active: true,
      sizeFactor: 1.0,
      timeFactor: 1.0,
      mode: 'balanced',
      levelLabel: '⚖️ OPTYMALNA',
      badgeText: '⚡ Adaptacja: OPTYMALNA (Brak historii gier)',
      detailText: 'Zagraj 1-2 mecze, aby system dopasował rozmiar i czas celów do Twojego poziomu!',
      badgeClass: 'adaptive-balanced'
    };
  }
  
  const avgAcc = Math.round(recent.reduce((acc, h) => acc + h.accuracy, 0) / recent.length);
  
  if (avgAcc >= 85) {
    return {
      active: true,
      sizeFactor: 0.82,
      timeFactor: 0.82,
      mode: 'challenge',
      avgAcc,
      levelLabel: '🔥 WYZWANIE',
      badgeText: `⚡ Adaptacja: WYZWANIE (Cele -18% / ${avgAcc}% celności)`,
      detailText: `Świetne wyniki! Przy celności ${avgAcc}% system zmniejszył cele o 18% i przyspieszył ich tempo.`,
      badgeClass: 'adaptive-challenge'
    };
  } else if (avgAcc < 65) {
    return {
      active: true,
      sizeFactor: 1.25,
      timeFactor: 1.25,
      mode: 'support',
      avgAcc,
      levelLabel: '🛡️ WSPARCIE',
      badgeText: `⚡ Adaptacja: WSPARCIE (Cele +25% / ${avgAcc}% celności)`,
      detailText: `System pomaga w nauce (${avgAcc}% celności) – cele zostały powiększone o 25% i są dłużej widoczne.`,
      badgeClass: 'adaptive-support'
    };
  } else {
    return {
      active: true,
      sizeFactor: 1.0,
      timeFactor: 1.0,
      mode: 'balanced',
      avgAcc,
      levelLabel: '⚖️ ZBALANSOWANA',
      badgeText: `⚡ Adaptacja: OPTYMALNA (${avgAcc}% celności)`,
      detailText: `Celność w normie (${avgAcc}%). Standardowe wymiary celów i optymalne tempo.`,
      badgeClass: 'adaptive-balanced'
    };
  }
}

export function getStars(gameId, levelIdx) {
  return (state.completed && state.completed[gameId + '-' + (levelIdx + 1)]) || 0;
}

// Global attachment for inline event handlers
window.updatePlayerNickFromMenu = updatePlayerNickFromMenu;
window.setAdaptiveDifficulty = setAdaptiveDifficulty;
window.openAccuracyModal = openAccuracyModal;
window.closeAccuracyModal = closeAccuracyModal;
window.submitScore = function() {
  if (window.currentType !== undefined && window.currentLevel !== undefined) {
    submitScore(window.currentType, window.currentLevel);
  } else {
    submitScore();
  }
};
