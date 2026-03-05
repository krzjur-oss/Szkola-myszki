# 🖱️ Szkoła Myszki

Interaktywna aplikacja edukacyjna do nauki obsługi myszy i touchpada dla uczniów szkół podstawowych.  
Działa jako **PWA** — można ją zainstalować na telefonie, tablecie i komputerze jak prawdziwą aplikację.

🔗 **[► Uruchom grę](https://krzjur-oss.github.io/Szkola-myszki/)**

---

## 🎮 Ćwiczenia

| Moduł | Umiejętność | Poziomy |
|---|---|---|
| 👆 **Kliknij cel!** | Podstawowe klikanie lewym przyciskiem | Łatwy / Średni / Trudny |
| 🎯 **Precyzja** | Klikanie tylko właściwego kształtu lub koloru | Łatwy / Średni / Trudny |
| ✌️ **Podwójne kliknięcie** | Szybki podwójny klik (jak otwieranie pliku) | Łatwy / Średni / Trudny |
| ✋ **Przeciąganie** | Chwyć → przeciągnij → upuść na właściwe miejsce | Łatwy / Średni / Trudny |
| 🌀 **Labirynt** | Precyzyjny ruch myszą bez dotykania ścian | Łatwy / Średni / Trudny |
| 🏆 **Wyzwanie!** | Mix wszystkich typów w jednej grze | Łatwy / Średni / Trudny |

---

## 📱 Instalacja jako aplikacja (PWA)

Uczniowie mogą zainstalować grę na swoim urządzeniu bez sklepu z aplikacjami:

**Na komputerze (Chrome / Edge):**
1. Otwórz stronę gry
2. W pasku adresu kliknij ikonę **⊕ Zainstaluj**
3. Kliknij **Zainstaluj** — gra pojawi się na pulpicie

**Na tablecie / telefonie (Android):**
1. Otwórz stronę w Chrome
2. Dotknij menu **⋮** → **Dodaj do ekranu głównego**
3. Potwierdź — ikona pojawi się jak zwykła aplikacja

**Na iPhone / iPad (Safari):**
1. Otwórz stronę w Safari
2. Dotknij ikony **Udostępnij** (kwadrat ze strzałką)
3. Wybierz **Dodaj do ekranu głównego**

> Po instalacji gra działa **offline** — bez połączenia z internetem.

---

## ✨ Funkcje

- 📚 Samouczek przed każdą nową grą z poradami
- ⭐ System gwiazdek i punktów zapisywany lokalnie
- 📊 Statystyki: dokładność, trafienia, pudła
- 📱 Pełna obsługa dotyku — tablety i ekrany dotykowe
- 🌐 Działa offline po pierwszym załadowaniu (PWA)
- 🔗 Nawigacja URL — każda gra ma własny adres (np. `#game/maze/2`)
- 🚫 Zero instalacji, zero reklam, zero danych do sieci

---

## 📁 Struktura plików

```
index.html              ← główna powłoka aplikacji (router, CSS, start)
manifest.json           ← konfiguracja PWA
sw.js                   ← Service Worker (cache offline)
icon-192.png            ← ikona aplikacji 192×192
icon-512.png            ← ikona aplikacji 512×512
README.md               ← ten plik
│
├── core/               ← silnik aplikacji
│   ├── engine.js       ← timer, punkty, efekty, resize
│   ├── router.js       ← nawigacja hash-based (#menu, #game/maze/2)
│   ├── state.js        ← localStorage, statystyki, gwiazdki
│   └── ui.js           ← ekrany: menu, wybór poziomu, wyniki, tutorial
│
└── games/              ← moduły gier (każda gra = osobny plik)
    ├── click-basic.js  ← Kliknij cel!
    ├── precision.js    ← Precyzja
    ├── double-click.js ← Podwójne kliknięcie
    ├── drag.js         ← Przeciąganie
    ├── maze.js         ← Labirynt
    └── mixed.js        ← Wyzwanie!
```

---

## 🏫 Dla nauczycieli

Udostępnij uczniom link do strony. Każdy uczeń ma własne statystyki zapisywane lokalnie na jego urządzeniu — nic nie jest wysyłane do sieci.

Możesz linkować bezpośrednio do konkretnej gry i poziomu, np.:
- `https://krzjur-oss.github.io/Szkola-myszki/#game/maze/1` — Labirynt poziom Łatwy
- `https://krzjur-oss.github.io/Szkola-myszki/#level/drag` — wybór poziomu Przeciągania

**Zalecane przeglądarki:** Chrome, Edge (najlepsza wydajność)

---

## 🔧 Rozbudowa

Aby dodać nową grę wystarczy:
1. Stworzyć plik `games/nowa-gra.js` z funkcją `export function init(level) {...}`
2. Dodać wpis w `core/ui.js` w obiekcie `GAMES`
3. Dodać wpis w `index.html` w obiekcie `GAME_MODULES`

---

## 📄 Licencja

Projekt edukacyjny — możesz swobodnie używać, kopiować i modyfikować na potrzeby szkolne.
