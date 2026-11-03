# Architektúra Grindoria

## Zdroj a zostavenie

Hra používa HTML, CSS, Canvas 2D a klasické JavaScript skripty. Nevyžaduje knižnice ani balíčkovač. Jednotlivé súbory zdieľajú jeden herný kontext; nie sú to ES moduly. Toto vedomé obmedzenie umožňuje jednoduché zostavenie aj jediný HTML súbor otvoriteľný cez `file://`.

`src/index.html` určuje poradie runtime skriptov. Zostavenie, kontroly aj testovací pomocník čítajú rovnaký zoznam. Nový súbor preto nemusíš ručne pridávať do viacerých manifestov.

Poradie načítania je:

1. `data/`: povolania, šesť schopností každej školy a mapy.
2. core/persistence.js rozpozná starý postup; core/character-store.js a core/character-validation.js spravujú register, migráciu, transakcie a validáciu. Potom core/state.js pripraví existujúci model aktuálneho hráča a herné premenné.
3. Funkcie `core/`, `systems/`, `ui/` a `render/`.
4. `main.js`: prvé načítanie mapy, nastavenie ovládania, HUD a animovanej slučky.

Funkcie môžu medzi súbormi volať zdieľané pomenované funkcie. Načítanie funkčných súborov má zostať bez vedľajších účinkov; spustenie patrí do `main.js`. Súčasné zdroje boli oddelené z prototypu; niektoré dlhé funkcie sú stále kompaktné a sú vhodným cieľom ďalšieho upratania.

## Zodpovednosti

| Priečinok | Obsah |
| --- | --- |
| `data/` | `CLASSES`, `SCHOOLS`, `MAPS`, `EQUIPMENT`, `METIN_TYPES`, rozmery predmetov a herné hodnoty |
| `core/` | Stav, náhodný generátor, kamera, časovanie a aktualizácia sveta |
| `systems/combat.js` | Zásahy, zdravie, mana, stavy a AI bossa |
| `systems/targeting.js` | Živý cieľ, kurzor, čelné výseky, klávesnicový pohyb a nasledovanie |
| `systems/battle.js` | Typové odolnosti, pasívne bonusy, kombá, súbežné stavy a pohyb striel |
| `systems/abilities.js` | Aktivácia 48 schopností, mana, cooldowny a smerový základný útok |
| `systems/progression.js` | Skúsenosti, výbava, vlastnosti a odmeny |
| `systems/forge.js` | Rizikové vylepšovanie, ochrana, talizmany, recepty a zdroje pomôcok |
| `systems/locations.js` | NPC služby, bezpečné zóny, cestovanie mimo boja a migrácia rozmerov máp |
| `systems/world.js` | Generovanie, cestovanie, snímky máp a uloženie |
| `systems/career.js` | EXP ekonomika, migrácia, tréning, schopnosti, biológia, alchýmia, relikvie, špecializácia a expedície |
| `systems/farming.js` | Skupinové body, varianty, trvalé spawn sloty, respawn, potulovanie, pomoc skupiny, aggro, priestorová mriežka a Plášť statočnosti |
| `systems/inventory.js` | Rozloženie mriežky, migrácia, presun, nasadenie, bonusy a zásobníky |
| `systems/loot.js` | Fyzické dropy, migrácia starých zlatých kôpok a automatické zásoby a hromadné zbieranie |
| `systems/metins.js` | 99 úrovní Šuterlandu, typy, obrana, vlny posíl, migrácia a loot pooly Metinov |
| `ui/` | Rozhranie, obchod, výbava, úlohy a kniha schopností |
| `render/` | Vektorové kreslenie prostredia, postáv, príšer a efektov |

`core/runtime.js` používa `requestAnimationFrame` a obmedzuje krok na 50 ms. Pri otvorení herného panelu je simulácia pozastavená. Respawn sa počíta iba počas aktívnej simulácie príslušnej mapy; pri opustení mapy sa jej časovače nezrýchľujú podľa času zariadenia.

## Uložený stav

Register localStorage[grindoria-characters-v1] oddeľuje globálne nastavenia, poradie, vybrané ID a profily podľa ID. Aktívne ID je v pamäti. Pôvodný hráč p je hlboká kópia aktivovaného profilu; herné systémy zostávajú zachované. save() deleguje na overený zápis aktívneho ID, identity a povolania. Každý profil obsahuje vlastné svety, inventár aj kariéru.

core/persistence.js je migračná čítačka starého postupu. Platný aktuálny starý profil má prednosť; inak sa kompatibilné staršie profily prevedú na samostatné postavy. Register sa uloží naraz a zdroje ostanú zálohou. Existujúci register, aj prázdny, má vždy prednosť.

playCharacter() obnoví vlastnú mapu a pozíciu; returnToCharacters() najprv uloží reláciu. Strely, aury, dočasné cooldowny, výber inventára a ciele sa medzi reláciami čistia. Zvuk je globálne nastavenie. Offline hra nemá cloudové účty ani serverové vynucovanie identity. Pozri [CHARACTERS.md](CHARACTERS.md).

`initializeCareer()` vykoná jednorazovú migráciu pred prvým načítaním mapy. Paralelné cesty sú uložené v `p.career`; ich bonusy agreguje `careerBonuses()`, ktorú používajú skutočné výpočty útoku, obrany, zdravia, many a kritických zásahov. Rozhranie sa nachádza v `ui/career.js`. Podrobnosti balansu a zdrojov sú v [PROGRESSION.md](PROGRESSION.md).

Endgame expedícia má vlastný identifikátor, ktorý bráni započítaniu obyčajného protivníka do cieľov výpravy. Pred vstupom sa zachová bežný chrám v `p.career.normalTemple`; aktívny stav sa ukladá štandardným snímkovaním a po ukončení sa pôvodný chrám obnoví.

Populácia má vlastné `spawnSchema` a trvalé identifikátory slotov. `hydrateSpawnPopulation()` obnovuje známe sloty alebo migruje riedku mapu bez oživenia mŕtvych protivníkov. `respawnEnemy()` zachová identitu objektu pre existujúce referencie, ale vyčistí staré stavy a znovu vyberie variant. Pre susedov používa pohyb jednoduchú priestorovú mriežku namiesto porovnávania každého protivníka so všetkými ostatnými. Minimapka sa prekresľuje najviac desaťkrát za sekundu.

Pokojový pohyb používa nezávislé ciele a prestávky; `wanderEnemy()` drží každého protivníka v okruhu domova. `provokeEnemyGroup()` reaguje na poškodenie a vyberá pomocníkov výlučne podľa `spawnPointId` s limitom piatich aktívnych členov vrátane obete; pomocníci sami ďalšiu pomoc nevyvolávajú. Identifikátory slotov aj populácia ostávajú kompatibilné, dočasný pohyb sa pri načítaní resetuje.

Plášť je uložený ako stoh `p.braveryCapes`, podobne ako elixíry. Výzva nastaví časovač `taunt` iba živým pohyblivým cieľom v dosahu; bežná AI aj AI bossa ho rešpektujú. Kreslenie vlny, označenie variantov a oblastí patrí do `render/farming.js`. Pozri [FARMING.md](FARMING.md).

`initializeInventory()` beží po migrácii kariéry a pred prvým načítaním mapy. Sloty definuje `data/items.js`; model pracuje s pôvodným batohom a číta množstvá zásob priamo z existujúcich počítadiel. `gearLayout()` najprv overí navrhnuté rozmiestnenie, až potom sa vykoná presun či výmena. `equipmentBonuses()` agreguje všetkých desať slotov do živých výpočtov štatistík. Vlastné SVG ikony sú v `ui/item-icons.js`, rozhranie v `ui/inventory.js`. Podrobnosti: [INVENTORY.md](INVENTORY.md).

Korisť z nepriateľov vytvára `spawnGroundDrop()`. Zlato a zásoby sa pripíšu okamžite cez existujúce počítadlá a malé súhrnné hlásenie. Výbavu a relikvie pridá až úspešný pickUpGroundDrop(); svet posúva ich dopad a aktualizuje náhľad. `render/loot.js` zdieľa SVG ikony inventára cez obrazovú cache. `ui/loot.js` vypočíta rozdiely voči rovnakému slotu a bezpečnú polohu tooltipu. `main.js` smeruje primárny klik na aktuálny hit test, ale Y na hromadné zbieranie v okolí postavy bez kurzora; schopnosti používajú Q R T V U O. Pozri [LOOT.md](LOOT.md).

`configureMetin()` nahradí generické kamene typovanými Metinmi. `restoreMetin()` migruje staré zdravie pomerne a ponechá časovače smrti. `updateMetins()` spravuje časy boja, vlny aj konečnú životnosť posíl; `restoreMetinGuards()` obnoví uložené posily bez nových identít. Posily neprechádzajú bežným respawnom. `metinDamage()` sa uplatní v skutočnom zásahu pred odpočtom zdravia a liečením Sury. `dropMetinLoot()` je jediný predmetový loot pool pri smrti kameňa; všeobecný materiálový drop z kariéry sa preň nepoužíva.

Šuterland generuje iba 99 pevných identít kameňov v štyroch úrovňových oblastiach. Pôvodné mapy ponechávajú svoje populácie. Modely má `render/metins.js`; Atlas `ui/metins.js`. Detailné pravidlá: [METINS.md](METINS.md).

## Overovanie

`npm run check` overuje skripty a súlad verzie s changelogom. Herné testy používajú `node:vm` s malou náhradou DOM a Canvas API. Overujú logiku vrátane 48 schopností a migrácie postupu; vzhľad animácií treba kontrolovať v skutočnom prehliadači.

`renderBuild()` pripraví deterministický obsah bez zápisu; testy a skúšobné vydanie nemenia publikované súbory. `check:dist` porovná commitnuté HTML so zdrojmi pred spustením testov v CI.

Zostavenie vytvorí `dist/Grindoria.html` a totožné `dist/index.html`; oba sa verzujú v repozitári. Pri zostavení sa odstránia zastarané HTML názvy v tomto priečinku. Obsah vloží cez náhradné funkcie, aby JavaScriptové znaky `$` nemenili text počas zostavovania. Vložený kód prejde syntaktickou kontrolou a výstup nesmie obsahovať externé runtime závislosti.

## Ovládanie a boj

`target` je referencia na živého nepriateľa z aktuálneho poľa `mobs`, nikdy bod na mape. Klávesnicový pohyb označenie zruší; prenasledovanie číta polohu cieľa každý krok. Klik najprv skúša korisť, potom nepriateľa, inak zruší označenie bez útoku. Smrť, zmena mapy a strata zamerania okna čistia dočasné zameranie. Žiadny bod kliknutia sa neukladá.

`data/battle.js` definuje sedem typov, profily odolností, metadáta schopností, osem pasívnych bonusov a osem komb. Animácie 48 aktivácií odlišuje `render/battle.js`; panel cieľa, knihu a manuál spravuje `ui/battle.js`. HUD prekresľuje detail cieľa iba pri zmene údajov.

Jed a oheň sú samostatné položky `dots`; staré `dot` sa importuje raz. Snímky svetov, obnova populácie a Metinov používajú hlbokú kópiu stavov. Pasívny stupeň sa odvodzuje od levelu, bez ďalšej migrácie kariéry. Zameranie, kombo, strely a animácie sú dočasné. Podrobnosti a poradie výpočtov: [COMBAT.md](COMBAT.md).

## Rozloženie, expirácie a fullscreen od 0.11.0

`systems/spawn-layout.js` vytvára nepravidelné body pomocou seedu mapy a odmietania nevhodných kandidátov. `layoutSchema` je oddelená od schémy populácie: migrácia mení pozície bez zmeny identít, zdravia a časovačov. Metiny pri respawne dostávajú nové bezpečné miesto.

Korisť nesie absolútny `expiresAt`. Čistenie aktívnych a uložených máp nepridáva odmeny. Hover má kandidáta a čas zastavenia; ukazovateľ mierenia nevytvára okamžité tooltipy.

`ui/fullscreen.js` riadi jeden herný shell. V prehliadači žiada Fullscreen API a reaguje na skutočný `fullscreenchange`; v Electron hoste používa iba `window.grindoriaDesktop.fullscreen`. Most poskytuje get/set/onChange. Native fullscreen CSS zaplní okno, bežný webový režim nemení. Podrobnosti: [DESKTOP.md](DESKTOP.md).

## Pomoc v boji a fokus od 0.12.0

`systems/combat-assist.js` vyberá najbližší vhodný cieľ a plánuje automatické volania existujúceho `castSkill`; nevytvára body pohybu ani ďalší výpočet poškodenia. `ui/combat-assist.js` aktualizuje nezávislé prepínače a vracia fokus po akcii hotbaru. Uložené sú iba booleany v `p.combatAssist`, časovač a rotácia ostávajú dočasné. `main.js` spravuje jednotný handler klávesnice, odlišuje textové polia od herných tlačidiel a pozastavuje asistenciu pri strate zamerania.

## Výber postáv od 0.13.0

data/characters.js centralizuje konfiguráciu. ui/characters.js riadi tvorbu, výber, potvrdené vymazanie, informácie a zálohy. ui/character-art.js kreslí 2D náhľad podľa povolania a výbavy. Import validuje profily pred úpravou kópie registra; finálny setItem je jeden. Export aktívneho progresu používa tú istú snímku bez požiadavky úspešného zápisu.

## Modely výbavy

Register data/equipment-models.js a resolver systems/appearance.js zdieľajú geometriu medzi SVG a Canvas Path2D. Výbava sa vrství na postave aj v portrétoch. Pozri [APPEARANCE.md](APPEARANCE.md).

## Generátor predmetov

Data/rarities.js definuje stabilné ID a poradie šiestich rarít, váhy zdrojov a bonusy. Systems/item-generation.js generuje a overuje hody aj stats a počíta hodnotu. Všetky prirodzené dropy používajú rovnaké tabuľky. Nové bojové bonusy používa hurtMob a attack; existujúce profiles zostávajú jediným úložiskom. Pozri [RARITIES.md](RARITIES.md).

## Výber a nasledovanie od 0.17.0

Target zostáva referencia na vybraného nepriateľa. Dočasný combatSelection.following povoľuje pohyb a automatické útoky až po dvojkliku. Prvý klik iba zobrazí údaje, SPACE označí skutočne zasiahnutý živý cieľ. Pri zmene mapy, postavy, smrti, pohybe alebo strate fokusu sa stav zruší. Žiadne nové dáta sa neukladajú do profilu.


## Výroba a alchýmia od 0.19.0

`data/crafting.js` registruje materiály, produkty a 47 receptov. `systems/crafting.js` kontroluje NPC, úroveň, cenu a kapacitu pred výrobou; zdieľa generátor výbavy, materiálové počítadlá, kováčske ceny a alchymistické kamene. `ui/crafting.js` zobrazuje recepty, zásoby a progres. Účinky alchýmie vstupujú cez `careerBonuses()` do existujúcich bojových výpočtov; `updateAlchemy()` beží iba pri aktívnej simulácii. `validateCraftingProfile()` dopĺňa validáciu záloh, migrácia zachováva pôvodné polia. Pozri [CRAFTING.md](CRAFTING.md).

## NPC ekonomika od 0.20.0

Data/economy.js definuje tovar a obchodníkov. Systems/economy.js spravuje p.economy, čas simulácie, zásoby, deterministické ponuky a ceny. UI/economy.js poskytuje nákup a výkup. Pôvodný shop(), buyBraveryCapes() a sellItem() delegujú na spoločnú logiku. Profily sa migrujú pri inicializácii; zálohy validuje validateEconomyProfile(). Pozri [ECONOMY.md](ECONOMY.md).

## Jednotné rozhranie od 0.21.0

UI/common.js obsahuje riadky požiadaviek, identitu panelu, obnovu fokusu a stavy hotbaru. Modal() zachováva posunutie pri rovnakej identite; každý nový panel ho resetuje. Systems/inventory-drop.js vykonáva potvrdený presun inventára na zem cez existujúci spawnGroundDrop(). Korisť s manualPickup sa nezbiera automaticky; používa existujúce ručné zbieranie, snímky a expiráciu. Pozri [UI.md](UI.md).

## Dungeony od 0.22.0

Data/dungeons.js registruje lokality, obtiažnosti, unikáty a vyhradený inštančný slot MAPS.dungeon. Systems/dungeons.js používa existujúce mapové snímky, nepriateľov, hit(), takeDamage(), dropy a generátor výbavy. Bežné AI pohybu ostáva v farming.js; bossova AI sa deleguje z updateBoss(). Render/dungeons.js zobrazuje vlastné modely a rovnaké geometrie útokov ako kolízie. UI/dungeons.js poskytuje vstup, ciele, odmeny a návrat. Pôvodné trhliny sa nemenia a aktívne výpravy sa navzájom vylučujú. Pozri [DUNGEONS.md](DUNGEONS.md).
