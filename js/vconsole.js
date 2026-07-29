// =========================================================
// VCONSOLE DEBUGGER MODULE (5x click upper right corner)
// =========================================================

export function initVConsoleTrigger() {
  let clicks = 0;
  let timer = null;
  let vConsoleInstance = null;
  let isShown = false;

  function onCornerClick(e) {
    clicks++;
    if (timer) clearTimeout(timer);
    
    if (clicks >= 5) {
      clicks = 0;
      toggleVConsole();
    } else {
      timer = setTimeout(function() { clicks = 0; }, 2500);
    }
  }

  function toggleVConsole() {
    if (vConsoleInstance) {
      try {
        if (isShown) {
          if (typeof vConsoleInstance.hide === 'function') vConsoleInstance.hide();
          isShown = false;
        } else {
          if (typeof vConsoleInstance.show === 'function') vConsoleInstance.show();
          isShown = true;
        }
      } catch(err) {}
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/vconsole@latest/dist/vconsole.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = function() {
      if (window.VConsole) {
        try {
          vConsoleInstance = new window.VConsole();
          isShown = true;
          console.log('vConsole uruchomiona!');
        } catch(err) {
          console.warn('Błąd inicjalizacji vConsole:', err);
        }
      }
    };
    script.onerror = function() {
      console.error('Nie udało się załadować vConsole z CDN.');
    };
    document.head.appendChild(script);
  }

  function setupTrigger() {
    if (document.getElementById('vconsole-trigger')) return;
    const trigger = document.createElement('div');
    trigger.id = 'vconsole-trigger';
    trigger.style.cssText = 'position:fixed;top:0;right:0;width:90px;height:90px;z-index:999999;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;';
    trigger.setAttribute('title', 'vConsole (5x klik)');
    trigger.addEventListener('click', onCornerClick);
    document.body.appendChild(trigger);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTrigger);
  } else {
    setupTrigger();
  }
}
