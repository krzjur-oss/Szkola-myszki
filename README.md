# 🖱️ Szkoła Myszki

Interaktywna aplikacja edukacyjna do nauki obsługi myszy i touchpada dla uczniów szkół podstawowych (zwłaszcza klas 1-3), przedszkolaków oraz osób starszych i wszystkich rozpoczynających naukę korzystania z komputera.  

**Autor projektu:** mgr Krzysztof Jureczek  
Działa jako **PWA (Progressive Web App)** — można ją zainstalować na telefonie, tablecie i komputerze i korzystać w pełni offline!

🔗 **[► Uruchom grę](https://krzjur-oss.github.io/Szkola-myszki/)**

---

## 📋 Spis dokumentów prawno-informacyjnych
Przed rozpoczęciem wdrażania lub użytkowania programu zapoznaj się z poniższymi dokumentami:
* 📄 **[Warunki Licencyjne (LICENSE.md)](./LICENSE.md)** – szczegółowe zasady licencjonowania aplikacji.
* 📋 **[Regulamin i Prywatność (REGULAMIN.md)](./REGULAMIN.md)** – regulamin korzystania oraz polityka prywatności (pamięć lokalna).

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

Gra została skonsolidowana do formy jedno-plikowej, co pozwala na błyskawiczne wczytywanie, brak konieczności budowania (build step) oraz niezwykle prostą instalację i hosting na GitHub Pages.

```
index.html              ← główny plik aplikacji (zawiera style CSS, router, silnik gier i logikę poziomów)
manifest.json           ← konfiguracja PWA (nazwa, ikony, kolory startowe)
sw.js                   ← Service Worker (odpowiada za pełne działanie offline)
icon-192.png            ← ikona aplikacji 192×192 px
icon-512.png            ← ikona aplikacji 512×512 px
README.md               ← ten plik
```

---

## 🚀 Jak włączyć publikację na GitHub Pages (PWA)

Projekt jest w 100% gotowy do automatycznej publikacji za pomocą **GitHub Pages** jako progresywna aplikacja internetowa (PWA). Nie wymaga żadnego serwera ani kompilacji!

Aby uruchomić grę pod własnym adresem:
1. Wgraj pliki projektu na swoje repozytorium w serwisie GitHub.
2. Wejdź w **Settings** (Ustawienia) swojego repozytorium.
3. W menu po lewej stronie wybierz zakładkę **Pages**.
4. W sekcji **Build and deployment > Source** upewnij się, że wybrane jest **Deploy from a branch**.
5. W polu **Branch** wybierz swoją główną gałąź (zazwyczaj `main` lub `master`) oraz folder `/ (root)` i kliknij **Save**.
6. Po około minucie Twoja gra będzie dostępna publicznie pod adresem:  
   `https://<twój-login-github>.github.io/<nazwa-repozytorium>/`

Aplikacja automatycznie wykryje ścieżkę podkatalogu i zainstaluje Service Workera, dzięki czemu uczniowie będą mogli pobrać ją na swoje urządzenia jednym kliknięciem!

---

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

## 📄 Licencja i Regulamin

Program **Szkoła Myszki** jest aplikacją darmową przeznaczoną wyłącznie do użytku **edukacyjnego oraz rozrywkowego**. 

Zabrania się:
- Kopiowania lub powielania kodu źródłowego aplikacji bez pisemnej zgody autora.
- Komercjalizacji, pobierania opłat za dostęp lub dystrybuowania programu w celach zarobkowych.
- Modyfikowania kodu, grafik, dźwięków lub logotypów bez pisemnej zgody autora.

Pełne, szczegółowe zapisy prawne oraz regulacje dotyczące prywatności i ochrony danych znajdują się w osobnych plikach:
* 📄 **[Pełne Warunki Licencyjne (LICENSE.md)](./LICENSE.md)**
* 📋 **[Regulamin i Prywatność (REGULAMIN.md)](./REGULAMIN.md)**

---

**Copyright © 2026 Krzysztof Jureczek. Wszelkie prawa zastrzeżone.**

