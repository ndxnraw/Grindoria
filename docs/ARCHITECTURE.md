# Architektúra JadeRealm

## Zdroj a zostavenie

Hra používa HTML, CSS, Canvas 2D a klasické JavaScript skripty. Nevyžaduje knižnice ani balíčkovač. Jednotlivé súbory zdieľajú jeden herný kontext; nie sú to ES moduly. Toto vedomé obmedzenie umožňuje jednoduché zostavenie aj jediný HTML súbor otvoriteľný cez `file://`.

`src/index.html` určuje poradie runtime skriptov. Zostavenie, kontroly aj testovací pomocník čítajú rovnaký zoznam. Nový súbor preto nemusíš ručne pridávať do viacerých manifestov.

Poradie načítania je:

1. `data/`: povolania, šesť schopností každej školy a mapy.
2. `core/state.js`: pripojenie k rozhraniu, herné premenné, načítanie a doplnenie uloženého hráča.
3. Funkcie `core/`, `systems/`, `ui/` a `render/`.
4. `main.js`: prvé načítanie mapy, nastavenie ovládania, HUD a animovanej slučky.

Funkcie môžu medzi súbormi volať zdieľané pomenované funkcie. Načítanie funkčných súborov má zostať bez vedľajších účinkov; spustenie patrí do `main.js`. Súčasné zdroje boli oddelené z prototypu; niektoré dlhé funkcie sú stále kompaktné a sú vhodným cieľom ďalšieho upratania.

## Zodpovednosti

| Priečinok | Obsah |
| --- | --- |
| `data/` | `CLASSES`, `SCHOOLS`, `MAPS` a herné hodnoty |
| `core/` | Stav, náhodný generátor, kamera, časovanie a aktualizácia sveta |
| `systems/combat.js` | Útoky, kúzla, mana, stavy, strely a AI bossa |
| `systems/progression.js` | Skúsenosti, výbava, vlastnosti a odmeny |
| `systems/world.js` | Generovanie, cestovanie, snímky máp a uloženie |
| `ui/` | Rozhranie, obchod, výbava, úlohy a kniha schopností |
| `render/` | Vektorové kreslenie prostredia, postáv, príšer a efektov |

`core/runtime.js` používa `requestAnimationFrame` a obmedzuje krok na 50 ms. Pri otvorení herného panelu je simulácia pozastavená. Respawn sa počíta iba počas aktívnej simulácie príslušnej mapy; pri opustení mapy sa jej časovače nezrýchľujú podľa času zariadenia.

## Uložený stav

`localStorage['jade-realm-save-v1']` obsahuje hráča, výbavu, splnené úlohy, školy a snímky navštívených máp. Chýbajúce polia starších verzií dostávajú predvolené hodnoty v `state.js`. `snapshotMap()` uchováva aj životy, zostávajúci čas respawnu a korisť; `loadMap()` snímku obnoví.

Pri načítaní sa postava presunie do útočiska aktuálnej mapy. Aktívne aury a rozletené strely sa cez cestovanie neprenášajú. Lokálny postup nie je zabezpečený proti úprave hráčom a hra zatiaľ nemá server, multiplayer ani cloudové účty.

## Overovanie

`npm run check` overuje skripty a súlad verzie s changelogom. Herné testy používajú `node:vm` s malou náhradou DOM a Canvas API. Overujú logiku vrátane 48 schopností a migrácie postupu; vzhľad animácií treba kontrolovať v skutočnom prehliadači.

Zostavenie vytvorí `dist/Jade-Realm.html` a totožné `dist/index.html`. Obsah vloží cez náhradné funkcie, aby JavaScriptové znaky `$` nemenili text počas zostavovania. Vložený kód prejde syntaktickou kontrolou a výstup nesmie obsahovať externé runtime závislosti.
