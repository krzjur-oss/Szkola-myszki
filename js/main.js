// =========================================================
// APPLICATION ENTRY POINT
// =========================================================
import { loadState } from './state.js';
import { _dispatch, showScreen } from './router.js';
import { initVConsoleTrigger } from './vconsole.js';

function initApp() {
  try {
    loadState();
  } catch(e) {
    console.error('Błąd ładowania stanu:', e);
  }

  try {
    _dispatch(location.hash.slice(1) || 'menu');
  } catch(e) {
    console.error('Błąd routera:', e);
    showScreen('menu-screen');
  }

  if (!document.querySelector('.screen.active')) {
    const m = document.getElementById('menu-screen');
    if (m) m.classList.add('active');
  }

  initVConsoleTrigger();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
