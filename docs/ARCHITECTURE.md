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
| `systems/career.js` | EXP ekonomika, migrácia, tréning, schopnosti, biológia, alchýmia, relikvie, špecializácia a expedície |
| `systems/farming.js` | Skupinové body, varianty, pevné spawn sloty, respawn, aggro, priestorová mriežka a Plášť statočnosti |
| `ui/` | Rozhranie, obchod, výbava, úlohy a kniha schopností |
| `render/` | Vektorové kreslenie prostredia, postáv, príšer a efektov |

`core/runtime.js` používa `requestAnimationFrame` a obmedzuje krok na 50 ms. Pri otvorení herného panelu je simulácia pozastavená. Respawn sa počíta iba počas aktívnej simulácie príslušnej mapy; pri opustení mapy sa jej časovače nezrýchľujú podľa času zariadenia.

## Uložený stav

`localStorage['jade-realm-save-v1']` obsahuje hráča, výbavu, splnené úlohy, školy a snímky navštívených máp. Chýbajúce polia starších verzií dostávajú predvolené hodnoty v `state.js`. `snapshotMap()` uchováva aj životy, zostávajúci čas respawnu a korisť; `loadMap()` snímku obnoví.

Pri načítaní sa postava presunie do útočiska aktuálnej mapy. Aktívne aury a rozletené strely sa cez cestovanie neprenášajú. Lokálny postup nie je zabezpečený proti úprave hráčom a hra zatiaľ nemá server, multiplayer ani cloudové účty.

`initializeCareer()` vykoná jednorazovú migráciu pred prvým načítaním mapy. Paralelné cesty sú uložené v `p.career`; ich bonusy agreguje `careerBonuses()`, ktorú používajú skutočné výpočty útoku, obrany, zdravia, many a kritických zásahov. Rozhranie sa nachádza v `ui/career.js`. Podrobnosti balansu a zdrojov sú v [PROGRESSION.md](PROGRESSION.md).

Endgame expedícia má vlastný identifikátor, ktorý bráni započítaniu obyčajného protivníka do cieľov výpravy. Pred vstupom sa zachová bežný chrám v `p.career.normalTemple`; aktívny stav sa ukladá štandardným snímkovaním a po ukončení sa pôvodný chrám obnoví.

Populácia má vlastné `spawnSchema` a trvalé identifikátory slotov. `hydrateSpawnPopulation()` obnovuje známe sloty alebo migruje riedku mapu bez oživenia mŕtvych protivníkov. `respawnEnemy()` zachová identitu objektu pre existujúce referencie, ale vyčistí staré stavy a znovu vyberie variant. Pre susedov používa pohyb jednoduchú priestorovú mriežku namiesto porovnávania každého protivníka so všetkými ostatnými. Minimapka sa prekresľuje najviac desaťkrát za sekundu.

Plášť je uložený ako stoh `p.braveryCapes`, podobne ako elixíry. Výzva nastaví časovač `taunt` iba živým pohyblivým cieľom v dosahu; bežná AI aj AI bossa ho rešpektujú. Kreslenie vlny, označenie variantov a oblastí patrí do `render/farming.js`. Pozri [FARMING.md](FARMING.md).

## Overovanie

`npm run check` overuje skripty a súlad verzie s changelogom. Herné testy používajú `node:vm` s malou náhradou DOM a Canvas API. Overujú logiku vrátane 48 schopností a migrácie postupu; vzhľad animácií treba kontrolovať v skutočnom prehliadači.

Zostavenie vytvorí `dist/Jade-Realm.html` a totožné `dist/index.html`. Obsah vloží cez náhradné funkcie, aby JavaScriptové znaky `$` nemenili text počas zostavovania. Vložený kód prejde syntaktickou kontrolou a výstup nesmie obsahovať externé runtime závislosti.
