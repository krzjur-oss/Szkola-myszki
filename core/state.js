// ============================================================
// core/state.js – globalny stan aplikacji i localStorage
// ============================================================

export const state = {
  totalScore: 0,
  totalGames: 0,
  totalStars: 0,
  bestAcc: 0,
  completed: {}   // klucz: "gameId-level" (1-based), wartość: liczba gwiazdek
};

export function saveState() {
  try { localStorage.setItem('mousegame_v2', JSON.stringify(state)); } catch {}
}

export function loadState() {
  try {
    const d = localStorage.getItem('mousegame_v2');
    if (d) Object.assign(state, JSON.parse(d));
  } catch {}
}

export function recordResult({ gameId, level, score, hits, miss }) {
  const total = hits + miss;
  const acc   = total > 0 ? Math.round((hits / total) * 100) : 0;

  const starsByAcc   = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
  const maxPossible  = hits * 200;
  const scorePct     = maxPossible > 0 ? (score / maxPossible) * 100 : 0;
  const starsByScore = scorePct >= 70 ? 3 : scorePct >= 40 ? 2 : scorePct >= 15 ? 1 : 0;
  const stars        = Math.round(starsByAcc * 0.7 + starsByScore * 0.3);

  state.totalScore += score;
  state.totalGames += 1;
  state.totalStars += stars;
  if (acc > state.bestAcc) state.bestAcc = acc;

  const key = `${gameId}-${level}`;
  if (!state.completed[key] || state.completed[key] < stars) {
    state.completed[key] = stars;
  }

  saveState();
  return { stars, acc };
}

export function getStars(gameId, level) {
  return state.completed[`${gameId}-${level}`] ?? 0;
}
