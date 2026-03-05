// ============================================================
// core/router.js – nawigacja oparta na URL hash
// Format: #menu | #game/{gameId} | #level/{gameId} | #result/{gameId}/{level}
// ============================================================

const _routes = {};
let _currentRoute = null;

export function route(pattern, handler) {
  _routes[pattern] = handler;
}

export function navigate(hash) {
  history.pushState(null, '', '#' + hash);
  _dispatch(hash);
}

export function replace(hash) {
  history.replaceState(null, '', '#' + hash);
  _dispatch(hash);
}

export function currentHash() {
  return location.hash.slice(1) || 'menu';
}

function _dispatch(hash) {
  _currentRoute = hash;
  for (const [pattern, handler] of Object.entries(_routes)) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
    const match = hash.match(regex);
    if (match) {
      const keys = [...pattern.matchAll(/:([^/]+)/g)].map(m => m[1]);
      const params = Object.fromEntries(keys.map((k, i) => [k, match[i + 1]]));
      handler(params);
      return;
    }
  }
  // fallback – menu
  _routes['menu']?.({});
}

export function initRouter() {
  window.addEventListener('popstate', () => {
    _dispatch(currentHash());
  });
  _dispatch(currentHash());
}
