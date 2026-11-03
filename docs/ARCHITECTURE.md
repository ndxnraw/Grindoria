# Architektúra Grindoria

## Zdroj a zostavenie

Hra používa HTML, CSS, Canvas 2D a klasické JavaScript skripty. Nevyžaduje knižnice ani balíčkovač. Jednotlivé súbory zdieľajú jeden herný kontext; nie sú to ES moduly. Toto vedomé obmedzenie umožňuje jednoduché zostavenie aj jediný HTML súbor otvoriteľný cez `file://`.

`src/index.html` určuje poradie runtime skriptov. Zostavenie, kontroly aj testovací pomocník čítajú rovnaký zoznam. Nový súbor preto nemusíš ručne pridávať do viacerých manifestov.

Poradie načítania je:

1. `data/`: povolania, šesť schopností každej školy a mapy.
2. `core/persistence.js`: rozpoznanie kompatibilného uloženého postupu, potom `core/state.js`: pripojenie k rozhraniu, herné premenné, načítanie a doplnenie uloženého hráča.
3. Funkcie `core/`, `systems/`, `ui/` a `render/`.
4. `main.js`: prvé načítanie mapy, nastavenie ovládania, HUD a animovanej slučky.

Funkcie môžu medzi súbormi volať zdieľané pomenované funkcie. Načítanie funkčných súborov má zostať bez vedľajších účinkov; spustenie patrí do `main.js`. Súčasné zdroje boli oddelené z prototypu; niektoré dlhé funkcie sú stále kompaktné a sú vhodným cieľom ďalšieho upratania.

## Zodpovednosti

| Priečinok | Obsah |
| --- | --- |
| `data/` | `CLASSES`, `SCHOOLS`, `MAPS`, `EQUIPMENT`, rozmery predmetov a herné hodnoty |
| `core/` | Stav, náhodný generátor, kamera, časovanie a aktualizácia sveta |
| `systems/combat.js` | Útoky, kúzla, mana, stavy, strely a AI bossa |
| `systems/progression.js` | Skúsenosti, výbava, vlastnosti a odmeny |
| `systems/world.js` | Generovanie, cestovanie, snímky máp a uloženie |
| `systems/career.js` | EXP ekonomika, migrácia, tréning, schopnosti, biológia, alchýmia, relikvie, špecializácia a expedície |
| `systems/farming.js` | Skupinové body, varianty, trvalé spawn sloty, respawn, potulovanie, pomoc skupiny, aggro, priestorová mriežka a Plášť statočnosti |
| `systems/inventory.js` | Rozloženie mriežky, migrácia, presun, nasadenie, bonusy a zásobníky |
| `systems/loot.js` | Fyzické dropy, migrácia starých zlatých kôpok a výslovné zbieranie |
| `ui/` | Rozhranie, obchod, výbava, úlohy a kniha schopností |
| `render/` | Vektorové kreslenie prostredia, postáv, príšer a efektov |

`core/runtime.js` používa `requestAnimationFrame` a obmedzuje krok na 50 ms. Pri otvorení herného panelu je simulácia pozastavená. Respawn sa počíta iba počas aktívnej simulácie príslušnej mapy; pri opustení mapy sa jej časovače nezrýchľujú podľa času zariadenia.

## Uložený stav

`localStorage['grindoria-save-v1']` obsahuje hráča, výbavu, splnené úlohy, školy a snímky navštívených máp. Chýbajúce polia starších verzií dostávajú predvolené hodnoty v `state.js`. `snapshotMap()` uchováva aj životy, zostávajúci čas respawnu a korisť; `loadMap()` snímku obnoví.

`core/persistence.js` najprv uprednostní platný aktuálny kľúč. Ak chýba, vyhľadá kompatibilné profily podľa formátu dát medzi kľúčmi končiacimi na `-save-v1`. Jediný profil skopíruje pod nový kľúč; pri viacerých hráč vyberá pred spustením hry. Pôvodné dáta ponechá nedotknuté. Prenos funguje iba v rovnakom úložisku prehliadača.

Pri načítaní sa postava presunie do útočiska aktuálnej mapy. Aktívne aury a rozletené strely sa cez cestovanie neprenášajú. Lokálny postup nie je zabezpečený proti úprave hráčom a hra zatiaľ nemá server, multiplayer ani cloudové účty.

`initializeCareer()` vykoná jednorazovú migráciu pred prvým načítaním mapy. Paralelné cesty sú uložené v `p.career`; ich bonusy agreguje `careerBonuses()`, ktorú používajú skutočné výpočty útoku, obrany, zdravia, many a kritických zásahov. Rozhranie sa nachádza v `ui/career.js`. Podrobnosti balansu a zdrojov sú v [PROGRESSION.md](PROGRESSION.md).

Endgame expedícia má vlastný identifikátor, ktorý bráni započítaniu obyčajného protivníka do cieľov výpravy. Pred vstupom sa zachová bežný chrám v `p.career.normalTemple`; aktívny stav sa ukladá štandardným snímkovaním a po ukončení sa pôvodný chrám obnoví.

Populácia má vlastné `spawnSchema` a trvalé identifikátory slotov. `hydrateSpawnPopulation()` obnovuje známe sloty alebo migruje riedku mapu bez oživenia mŕtvych protivníkov. `respawnEnemy()` zachová identitu objektu pre existujúce referencie, ale vyčistí staré stavy a znovu vyberie variant. Pre susedov používa pohyb jednoduchú priestorovú mriežku namiesto porovnávania každého protivníka so všetkými ostatnými. Minimapka sa prekresľuje najviac desaťkrát za sekundu.

Pokojový pohyb používa nezávislé ciele a prestávky; `wanderEnemy()` drží každého protivníka v okruhu domova. `provokeEnemyGroup()` reaguje na poškodenie a vyberá pomocníkov výlučne podľa `spawnPointId` s limitom piatich aktívnych členov vrátane obete; pomocníci sami ďalšiu pomoc nevyvolávajú. Identifikátory slotov aj populácia ostávajú kompatibilné, dočasný pohyb sa pri načítaní resetuje.

Plášť je uložený ako stoh `p.braveryCapes`, podobne ako elixíry. Výzva nastaví časovač `taunt` iba živým pohyblivým cieľom v dosahu; bežná AI aj AI bossa ho rešpektujú. Kreslenie vlny, označenie variantov a oblastí patrí do `render/farming.js`. Pozri [FARMING.md](FARMING.md).

`initializeInventory()` beží po migrácii kariéry a pred prvým načítaním mapy. Sloty definuje `data/items.js`; model pracuje s pôvodným batohom a číta množstvá zásob priamo z existujúcich počítadiel. `gearLayout()` najprv overí navrhnuté rozmiestnenie, až potom sa vykoná presun či výmena. `equipmentBonuses()` agreguje všetkých desať slotov do živých výpočtov štatistík. Vlastné SVG ikony sú v `ui/item-icons.js`, rozhranie v `ui/inventory.js`. Podrobnosti: [INVENTORY.md](INVENTORY.md).

Korisť z nepriateľov vytvára `spawnGroundDrop()`. Materiály, predmety a relikvie sa nepridávajú pri smrti nepriateľa do inventára; pridá ich až úspešný `pickUpGroundDrop()`. Aktualizácia sveta iba posúva animáciu dopadu a aktualizuje náhľad. `render/loot.js` zdieľa SVG ikony inventára cez obrazovú cache. `ui/loot.js` vypočíta rozdiely voči rovnakému slotu a bezpečnú polohu tooltipu. `main.js` smeruje primárny klik a Y na aktuálny hit test; schopnosti používajú Q R T V U O. Pozri [LOOT.md](LOOT.md).

## Overovanie

`npm run check` overuje skripty a súlad verzie s changelogom. Herné testy používajú `node:vm` s malou náhradou DOM a Canvas API. Overujú logiku vrátane 48 schopností a migrácie postupu; vzhľad animácií treba kontrolovať v skutočnom prehliadači.

`renderBuild()` pripraví deterministický obsah bez zápisu; testy a skúšobné vydanie nemenia publikované súbory. `check:dist` porovná commitnuté HTML so zdrojmi pred spustením testov v CI.

Zostavenie vytvorí `dist/Grindoria.html` a totožné `dist/index.html`; oba sa verzujú v repozitári. Pri zostavení sa odstránia zastarané HTML názvy v tomto priečinku. Obsah vloží cez náhradné funkcie, aby JavaScriptové znaky `$` nemenili text počas zostavovania. Vložený kód prejde syntaktickou kontrolou a výstup nesmie obsahovať externé runtime závislosti.
