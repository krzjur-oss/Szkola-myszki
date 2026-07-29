// =========================================================
// TUTORIALS & MODALS
// =========================================================

export const tutorials = {
  click_basic: {
    icon: '👆', title: 'Kliknij cel!',
    desc: 'Kołka będą pojawiać się na ekranie. Klikaj na nie lewym przyciskiem myszy jak najszybciej!',
    tips: ['Trzymaj rękę na myszy pewnie', 'Jeden palec na lewym przycisku', 'Patrz na kolorowe koło i klikaj!', 'Większe koła = więcej czasu']
  },
  click_precision: {
    icon: '🎯', title: 'Kliknij właściwy kształt!',
    desc: 'Klikaj tylko na wskazany kształt lub kolor. Uważaj – nie wszystkie cele są dobre!',
    tips: ['Czytaj zadanie u góry', 'Klikaj tylko dobry cel (zielony/gwiazdka itp.)', 'Za zły klik tracisz punkt!', 'Nie spiesz się – cel się nie ruszy']
  },
  double_click: {
    icon: '✌️', title: 'Podwójne kliknięcie!',
    desc: 'Klikaj na cele DWIE razy szybko. To tak jak "otwieranie" pliku! Jedno kliknięcie nie liczy się.',
    tips: ['Klik–klik w tym samym miejscu', 'Dwa szybkie uderzenia', 'Nie ruszaj myszy między kliknięciami', 'Jeden klik = brak punktu']
  },
  drag: {
    icon: '✋', title: 'Przeciąganie!',
    desc: 'Kliknij na kolorowy element, TRZYMAJ przycisk i przeciągnij go na pole z kropkami o tym samym kolorze.',
    tips: ['Klik → trzymaj → przeciągnij → puść', 'Dopasuj kolor do koloru pola', 'Nie spiesz się – cel nie zniknie', 'Touchpad: klik dwoma palcami = prawy przycisk']
  },
  maze: {
    icon: '🌀', title: 'Labirynt!',
    desc: 'Ruszaj myszą i prowadź niebieską kulkę od START do METY. Nie dotykaj czerwonych ścian!',
    tips: ['Rusz myszą – kulka podąża za kursorem', 'Powoli i precyzyjnie!', 'Dotknięcie ściany = reset do startu', 'Touchpad: spokojne przesunięcia palcem']
  },
  mixed: {
    icon: '🏆', title: 'Wyzwanie!',
    desc: 'Mieszane ćwiczenia. Różne koła wymagają różnych działań – czytaj komunikat!',
    tips: ['🟢 Zielone = jeden klik', '🔵 Niebieskie = podwójny klik', '🟡 Żółte = jedno kliknięcie precyzyjne', 'Czytaj kolor i działaj odpowiednio!']
  }
};

let pendingTutorialCallback = null;

export function showTutorial(type, callback) {
  const t = tutorials[type];
  if (!t) { callback(); return; }
  document.getElementById('tut-icon').textContent = t.icon || '🖱️';
  document.getElementById('tut-title').textContent = t.title || '';
  document.getElementById('tut-desc').textContent = t.desc || '';
  const ul = document.getElementById('tut-list');
  ul.innerHTML = (t.tips || []).map(tip => `<li>${tip}</li>`).join('');
  document.getElementById('tutorial').classList.remove('hidden');
  pendingTutorialCallback = callback;
}

export function closeTutorial() {
  document.getElementById('tutorial').classList.add('hidden');
  if (pendingTutorialCallback) {
    pendingTutorialCallback();
    pendingTutorialCallback = null;
  }
}

export function openInfoModal(initialTab = 'program') {
  document.getElementById('info-modal').classList.remove('hidden');
  setInfoTab(initialTab);
}

export function closeInfoModal() {
  document.getElementById('info-modal').classList.add('hidden');
}

export function setInfoTab(tabId) {
  const contents = document.querySelectorAll('.info-tab-content');
  contents.forEach(el => el.classList.add('hidden'));
  
  const tabs = document.querySelectorAll('.info-tab-btn');
  tabs.forEach(el => el.classList.remove('active'));
  
  const targetContent = document.getElementById(`content-${tabId}`);
  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetContent) targetContent.classList.remove('hidden');
  if (targetTab) targetTab.classList.add('active');
}

// Global attachment for inline HTML event handlers
window.closeTutorial = closeTutorial;
window.openInfoModal = openInfoModal;
window.closeInfoModal = closeInfoModal;
window.setInfoTab = setInfoTab;
