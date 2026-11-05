# Rozhranie a ovládanie

## Rozloženie a vrstvy

Rozhranie používa tmavé hnedé povrchy, mosadzné rámy a kompaktnú spodnú lištu podľa vzoru Metin2. HP, mana, úroveň a EXP sú vľavo hore, kruhová minimapa vpravo hore. Osem rýchlych pozícií uprostred spodnej lišty používa fyzické klávesy 1–8, numerický blok a F1–F8. Fungujú aj slovenské +, ľ, š, č, ť, ž, ý, á; označenie zostáva 1–8. Útok SPACE a inventár I sú na jej okrajoch. Existujúce sólo systémy zostávajú zachované.

Postava C, inventár I, schopnosti V, úlohy N, mapa M, automatický boj K, progresia P a pomoc H sú samostatné vrstvy v hernej ploche. Rovnaký správca obsluhuje každého obchodníka, biológa, kováča, Dungeon Majstra, výrobné recepty aj ostatné systémy progresie. Otvorenie ďalšej vrstvy nezatvorí predchádzajúce a nepozastaví svet. Klik do sveta medzi oknami ovláda postavu.

Záhlavie presúva okno cez lokálne pribalený **Interact.js 1.10.27**. − minimalizuje na záhlavie, × zatvorí. Rovnaká skratka obnoví minimalizované okno alebo zatvorí otvorené. Kliknuté okno sa dostane navrch; Esc zavrie vrchnú vrstvu. Pozície sa ukladajú oddelene od postáv do `grindoria-ui-windows-v1`. Resize aj fullscreen udržia záhlavia v dosahu. Menu Esc obsahuje obnovenie polôh.

Tab otvára a zatvára Cestovanie; Shift+Tab zachováva spätný pohyb fokusu. Zamerané záhlavie možno presúvať šípkami po 20 px; Enter minimalizuje. Polia na písanie a výber zachovajú natívne klávesy. Ctrl/Meta/Alt kombinácie neaktivujú boj. Medzerník pri práci vo vrstve neútočí. Rozpracované vyhodenie zruší Esc pred zatvorením inventára.

## Rozdelenie systémov od 0.33.0

- C: atribúty, špecializácia, prestíž a trvalé posilnenie; bez plateného tréningu a odkazov na iné okná.
- V: jediná kniha schopností vrátane štúdia Normál 1–20, M1–M10, G1–G10 a P.
- P: prehľad, bestiár a Atlas Metinov. Horné prekliky sú iba v Prehľade; otvorený bestiár ani atlas ich neopakujú. Biologický výskum je v N → Podrobnosti výskumu.
- Biológ: po interakcii samostatné okno odovzdávania iba aktuálnej etapy.
- Kováč: malé menu Vylepšovanie / Výroba; služby nie sú v P.
- Dungeon Majster: dungeony, prestížne výpravy a trhliny. Aktívna výprava má stavový panel; samostatné okno Endgame neexistuje.
- N: Aktívne / Splnené. HUD vyberá nasledujúcu úlohu. Udalosti pokračujú v hre bez vlastného okna; cieľ je v HUD a aktívnom denníku.
- I: päť strán výbavy, zásoby a kompaktné akcie výberu. Náhľad pri myši porovnáva s vybavením. Vyhodenie používa samostatné stredové okno s Enter.

Splniteľné odovzdania, odmeny a vylepšenia majú zelené tlačidlo. Neaktívne tlačidlo zohľadňuje všetky podmienky vrátane vzdialenosti NPC.

Fullscreen v hre vypína F10. Natívna aplikácia na Esc nemení fullscreen; webová verzia žiada `navigator.keyboard.lock(['Escape'])`. Bežný Esc bol overený v Chromiu pri zachovanom fullscreen. Podpora a udelenie oprávnenia závisia od prehliadača; [Chrome ponecháva núdzové podržanie Esc](https://developer.chrome.com/docs/capabilities/web-apis/keyboard-lock#security-considerations). Čakanie na oprávnenie neblokuje F10.

## Stabilné panely

`ui/windows.js` vlastní register `gameWindows`, poradie vrstiev, presúvanie a životný cyklus. `modal(html, {key, refresh})` obnoví konkrétne okno; zachová polohu, scroll, otvorené detaily a identifikovateľný fokus. Každá záložka progresie aj obchodník majú vlastný kľúč. Obsluha událostí vyhľadáva prvky iba v danom obsahu; ID a väzby labelov dostávajú prefix konkrétneho okna. Pri zatvorení sa uvoľní Interact inštancia.

Otvorené údaje sa obnovujú raz za sekundu; počas písania a držania ukazovateľa sa obsah neprestavuje. Obnova nemení držané pohybové klávesy ani poradie vrstiev. Biológ navyše priebežne obnovuje odpočítavanie vo vlastnom kontexte. Obchod mimo dosahu ukáže neaktívne akcie; pri samotnom nákupe/predaji sa vzdialenosť, cena aj cyklus trhu znova kontrolujú.

Náklady používajú **Máš / Potrebuješ**, text „Splnené“ alebo počet chýbajúcich kusov. Potvrdenia trvalej straty zostávajú zachované. Postava C zobrazuje bojové hodnoty a prideľuje pôvodné body atribútov; inventár sa sústreďuje na výbavu, batoh a zásoby. Veľká mapa zobrazuje polohu, NPC, príšery, Metiny a objavené udalosti. Minimapka zobrazuje okolie do 560 jednotiek, obe mapy sa obnovujú najviac 10-krát za sekundu.

## Závislosť a offline zostava

`src/js/vendor/interact.min.js` je oficiálna distribúcia Interact.js 1.10.27, bez lokálnych úprav knižnice. Pred jej obsahom je vložená úplná MIT licencia z `INTERACT-LICENSE.txt`, preto ju nesú aj oba samostatné HTML výstupy. Žiadne CDN, fonty ani sieťové zdroje sa počas hrania nenačítavajú. Vzhľad tvoria lokálne CSS a vlastné SVG ikony.

## Vyhodenie z inventára

Potiahni predmet z batohu alebo zo zásob mimo okna inventára, ale do herného okna. Zobrazí sa potvrdenie s názvom, množstvom a časom do zmiznutia koristi. Rovnakú akciu poskytuje tlačidlo **Vyhodiť…**, použiteľné aj klávesnicou a dotykom. Nasadenú výbavu najprv zlož do batohu. Zrušenie ani Esc nič nespotrebujú.

Až potvrdenie prenesie predmet alebo zvolený počet zásob na zem pri postave. Vyhodené zásoby sa nezbierajú automaticky; kliknutie alebo Y ich zdvihne. Výbava aj zásoby zachovávajú štandardnú expiráciu koristi a uložia sa so svetom. Vyhodenie možno potvrdiť len pre aktuálnu postavu, mapu, existujúci predmet a platný počet. Zaplnený limit pozemnej koristi operáciu zablokuje. Po predaji, strate predmetu alebo zmene postavy nemôže staré potvrdenie vytvoriť duplikát.

Pôvodné **Odstrániť…** naďalej znamená trvalé zmazanie a vyžaduje vlastné potvrdenie. Vyhodenie túto akciu nenahrádza.

## Overenie

`tests/system-simplification.test.cjs` preveruje migráciu, odstránené systémy, NPC, stupne schopností, úlohy a Enter. `tests/window-controls.test.cjs` preveruje vrstvy, minimalizáciu, skratky, formuláre, súbežné obnovovanie, zmenu postavy a Esc. `tests/ui-standard.test.cjs` zachováva kontroly nákladov, scrollu, potvrdení, vyhodenia a ochrany pred duplikovaním.

`node scripts/ui-smoke.cjs` používa skutočný Chromium a Interact.js z offline zostavy. Vyžaduje Playwright (štandardne modul `playwright`); `PLAYWRIGHT_MODULE` a `BROWSER_EXECUTABLE` môžu ukázať na existujúcu inštaláciu. `UI_SMOKE_OUTPUT` určuje priečinok výsledkov, predvolene `work/ui-smoke`. Test overí presúvanie okna i predmetov, nákup pri súčasne otvorenom biológovi a inventári, filtre receptov, samostatné ID, zachovanie pozícií, formuláre a viewport 390 × 844. Uloží screenshoty a JSON s výsledkami; vyžaduje nulu chýb aj sieťových požiadaviek.

Od 0.35.0 sú návody k ovládaniu a systémom v H → Ako hrať, po rozbaľovacích témach. Herné a servisné okná ponechávajú hodnoty, požiadavky, akcie, priebežný stav a varovania pri strate. Yang v inventári je pod vybavením postavy, nie pod batohom. Mená NPC nemajú príponu F; kláves F je naďalej dostupný. Obchodník neobsahuje odkaz ku Kováčovi.
