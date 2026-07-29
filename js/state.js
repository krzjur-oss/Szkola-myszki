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
  playerNickname: 'Myszka'
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
    if (!state.playerNickname) state.playerNickname = 'Myszka';
  }

  try {
    const menuInput = document.getElementById('menu-player-nick');
    if (menuInput) {
      menuInput.value = state.playerNickname || 'Myszka';
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
  } catch(e) {
    console.warn('Błąd updateMenuStats:', e);
  }
}

export function getStars(gameId, levelIdx) {
  return (state.completed && state.completed[gameId + '-' + (levelIdx + 1)]) || 0;
}

// Global attachment for inline event handlers
window.updatePlayerNickFromMenu = updatePlayerNickFromMenu;
window.submitScore = function() {
  if (window.currentType !== undefined && window.currentLevel !== undefined) {
    submitScore(window.currentType, window.currentLevel);
  } else {
    submitScore();
  }
};
