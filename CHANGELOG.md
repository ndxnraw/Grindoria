# Changelog

Zmeny projektu Grindoria. Používame sémantické verzie a sekciu `[Unreleased]` pre ďalšie vydanie. Záznamy 0.1.0–0.3.0 opisujú vývoj prototypu pred založením repozitára; nepredstavujú spätne vytvorené Git commity alebo tagy.

## [Unreleased]

### Added

### Changed

### Fixed

## [0.17.0] - 2026-11-03

### Added
- Trvalé pravidlá stručných herných textov v AGENTS.md a integračné testy panelov, ovládania a priamej koristi.

### Changed
- Korektúra menu, návodu, manuálu, schopností, progresie, atlasu a tooltipov; približne 31 % menej slov v kontrolovaných paneloch.
- Praktický výber a tvorba postáv, stručné README, zachované názvy, hodnoty, chybové a bezpečnostné hlásenia.
- Úroveň a údaje nepriateľa sú v paneli cieľa; nad modelom ostáva meno. Povolanie sa nezobrazuje pri mene hráča v hernom svete.

### Fixed
- Prvý klik označí cieľ; dvojklik spustí nasledovanie a automatický útok. SPACE označí úspešne zasiahnutého živého nepriateľa.
- Zlato a zásoby sa okamžite pripíšu bez pádu na zem; prijaté predmety oznamuje malý súhrnný text.
- Dvojklik na korisť nespustí útok cez práve zdvihnutý predmet.
- Bojové hodnoty, náklady, pravdepodobnosti, progresia a formát uloženia zostali zachované.

## [0.16.0] - 2026-11-03

### Added
- Šesť rarít Common, Uncommon, Rare, Epic, Legendary a Mythic s vlastnými farbami, pravdepodobnosťami a hodnotou.
- Generátor 20 náhodných bonusov bez opakovania, s uloženými hodmi a rastom podľa úrovne a rarity.
- Prenikavé zásahy, rýchlosť útoku a bonusové poškodenie proti šiestim skupinám nepriateľov priamo v boji.
- Trhový odhad podľa kvality a synergie, výkup obchodníka za 25 % odhadu a sprievodca Rarity.
- Dvanásť testov rarít, generovania, ekonomiky, boja, kompatibility a importu.

### Changed
- Dropy používajú tabuľky podľa zdroja; Legendary od Lv.50, Mythic od Lv.75, bez zvýšenia množstva výbavy na zemi.
- Materiály a kovanie rozlišujú šesť rarít; vyššie rarity majú runy náhodných bonusov.
- Staré Rare/Epic ID, bonusy a ceny zostávajú zachované.

### Fixed
- Triedenie používa poradie rarity, import overuje integritu náhodných bonusov.
- Atlas uvádza výsledné šance šiestich rarít; Epic a vyššie majú dlhší despawn.

## [0.15.0] - 2026-11-03

### Added
- Modulárny register 39 odlišných vektorových modelov: desať slotov, meče, dvojdýky, luky a vejáre.
- Viditeľná nasadená výbava vo svete, inventári aj výbere postáv vrátane šperkov a talizmanu.
- Úrovňové kovanie, rytiny sily, kamene vylepšenia a svetelný lem od +6.
- Odlišné tvary alchymistických kameňov a štyroch relikvií.
- Dokumentácia registra a osem testov modelov a kompatibility.

### Changed
- Nové zbrane dostávajú typ a názov podľa povolania a školy bez zmeny bojových pravidiel.
- SVG ikony a Canvas postava zdieľajú geometriu; staré predmety získajú vzhľad bez prepisu dát.

### Fixed
- Cache koristi rozlišuje model, úroveň a vylepšenie.
- Import odmietne neznáme modely a neplatné typy zbraní.

## [0.14.0] - 2026-11-03

### Added
- Autoelixíry pod 45 % HP: 65 HP zo zásob, spoločný 4-sekundový cooldown s ručným použitím, uložený samostatne pre každú postavu.
- Sedem regresných testov automatického boja, elixírov a zatvárania panelov.

### Changed
- Voľný útok pomocou SPACE; kliknutie do prázdna iba zruší cieľ. Prenasledovanie kliknutého nepriateľa zostáva zachované.

### Fixed
- Autospell vyžaduje boj s označenou príšerou alebo Metinom; nečaruje v pokoji.
- Automierenie sa uplatňuje iba pri útočení, v pokoji ostáva orientácia podľa kurzora.
- Všetky panely možno zavrieť primárnym kliknutím mimo karty bez útoku cez pozadie.

## [0.13.0] - 2026-11-03

### Added
- Sieň hrdinov s výberom samostatných postáv, tvorbou mena a povolania, animovaným 2D náhľadom výbavy a informáciami o progrese.
- Register podľa stabilných ID, globálne nastavenia a izolované relácie s vlastným inventárom, mapami, úlohami, schopnosťami, biológiou, bestiárom a úspechmi.
- Kompletný export všetkých postáv a validovaný transakčný import s pridaním alebo nahradením, riešením mien, premapovaním ID a bezpečnostnou zálohou.
- Vymazanie vyžadujúce celé meno a validácia mien.
- Export neuloženého progresu aj pri plnom úložisku a ochrana pred zastaranými zápismi.
- Testy tvorby, izolácie, mazania, importov, chýb úložiska, migrácií a obnovy postáv.

### Changed
- Jeden charakter má jedno nemenné povolanie; zobrazovaný názov Ninja používa stabilný identifikátor ninja.
- Existujúci spoločný postup sa prevedie na pomenovaný profil; obnovenie hry začína výberom postavy.
- Hrať obnoví vlastnú mapu a pozíciu; Postavy a ♙ v minimape bezpečne ukončia reláciu aj vo fullscreene.

### Fixed
- Medzi postavami sa neprenášajú strely, aury, dočasné cooldowny ani presúvanie predmetov.
- Povolanie existujúceho ID nemožno zmeniť ani nahradením importovanou zálohou.
- Pri zmene rozloženia sa znovu vypočíta veľkosť Canvasu a mierenie.

## [0.12.0] - 2026-11-03

### Added
- Nezávislé prepínače Automierenie a Autospell nad hotbarom s uložením nastavenia.
- Mierenie na najbližšieho živého nepriateľa do 500 jednotiek bez automatickej chôdze; označený cieľ má prednosť.
- Automatická rotácia dostupných schopností s manou, cooldownmi, dosahom, podporou komb a liečením pri nízkom zdraví.
- Osem regresných testov hotbaru, klávesnice, mierenia, automatického zosielania, pauzy a uloženia prepínačov.

### Changed
- Esc v hre vypne oba automatické režimy; pauza, útočisko a neaktívne okno pozastavia asistenciu.

### Fixed
- Kliknutie na schopnosť, útok, elixír alebo plášť vráti fokus hernej ploche a neblokuje ďalší útok medzerníkom.
- Zamerané herné tlačidlo neprehltne medzerník; textové polia a dialógy pri pauze si zachovajú vlastné ovládanie.

## [0.11.0] - 2026-11-03

### Added
- Skutočný fullscreen hernej plochy tlačidlom v minimape alebo F10, synchronizovaný s prehliadačom a návratom do okna.
- Pripravený Electron host s izolovaným preload mostom a potvrdením natívnych fullscreen udalostí; dokumentácia DESKTOP.md.
- Despawn koristi: 3 minúty pre bežné dropy, 10 minút pre epickú výbavu a relikvie, zachovaný cez uloženie, pauzu a neaktívne mapy.
- Testy oneskoreného náhľadu, expirácie, náhodných spawnov, migrácie a browserového aj natívneho fullscreen rozhrania.

### Changed
- Výbava z obyčajných príšer padá s 3 % šancou namiesto 32 %, z elít s 20 % namiesto 75 %.
- Náhodné body skupín, hliadok a Metinov bez radov a stĺpcov; príšery vznikajú v širšom okruhu, Metiny pri respawne menia miesto vo svojej oblasti.
- Náhľad koristi vyžaduje zastavenie kurzora na 0,55 s; pohyb pri mierení ho ihneď skryje.

### Fixed
- Odstránená šípka smeru útoku pri postave; označenie vybraného cieľa ostáva.
- Staré pravidelné spawny migrujú bez resetu zdravia, časovačov smrti, odmien či identity.

## [0.10.0] - 2026-11-03

### Added
- Sedem typov poškodenia, odolnosti a slabiny príšer aj Metinov, percentuálne bonusy novej vzácnej výbavy.
- Osem pasívnych schopností s úrovňovými stupňami, osem kombinácií schopností a Bojový rytmus.
- Vlastné animácie 48 aktívnych schopností, panel živého cieľa, smerový indikátor, kombo HUD a bojový manuál C.
- 15 testov ovládania a bojových mechaník, dokumentácia COMBAT.md.

### Changed
- Pohyb iba klávesnicou; kliknutie do prázdna útočí v smere kurzora bez presunu postavy.
- Kliknutý nepriateľ alebo Metin sa označí, priebežne nasleduje a automaticky napáda v dosahu; smrť, pohyb klávesnicou alebo Esc nasledovanie zrušia.
- Základný útok používa čelný výsek, šípy priamu trajektóriu, vybrané magické strely sledovanie cieľa. Schopnosti možno zosielať aj bez označenia.

### Fixed
- Prechod z knihy schopností do bojového manuálu otvorí obsah od začiatku.
- Jed a popálenie pôsobia súbežne; uložené snímky máp nezdieľajú meniteľné stavy poškodenia.
- Nasledovanie sa po respawne cieľa samo neobnoví; korisť má pri kliknutí prednosť pred útokom.

## [0.9.0] - 2026-11-03

### Added

- Osem typov Metinov s vlastnými modelmi, viditeľnou úrovňou, obtiažnosťou a odolnosťou.
- Šuterland: 99 Metinov, jeden pre každú úroveň 1–99; bez voľných príšer alebo bossa.
- Časté agresívne vlny obrancov podľa úrovne kameňa, s limitmi populácie a konečnou životnosťou.
- Individuálne loot pooly: Yang, ruda, knihy, alchymistické materiály, kamene vylepšenia, výbava a vzácne relikvie.
- Atlas Metinov prístupný cez Mapy (M) s presnými šancami a množstvami.
- Kamene vylepšenia s vlastnou ikonou a reálnou spotrebou u kováča od +4.
- Testy všetkých úrovní, modelov, odolnosti, vĺn, loot poolov, ukladania a migrácie starých kameňov.

### Changed

- Životy, pancier a odolnosť Metinov rastú podľa úrovne a typu; miestne kamene zostávajú na pôvodných mapách.
- Privolaní obrancovia dávajú 35 % bežných EXP a samostatne sa neobnovujú.
- Dropy Metinov sa riadia ich vlastnou tabuľkou a rešpektujú obmedzenie príliš slabých cieľov.

### Fixed

- Sura sa lieči zo skutočného poškodenia po zohľadnení odolnosti kameňa.
- Kliknutie na telo nového modelu správne zameria Metin. Staré kamene migrujú pri zachovaní pomeru života, smrti, časovačov aj koristi.

## [0.8.1] - 2026-11-03

### Added

### Changed

- Zlato a všetky zásoby sa po dopade zbierajú automaticky v dosahu 180 jednotiek.
- Y pozbiera všetky dostupné predmety v okolí postavy bez kurzora; ľavé kliknutie na konkrétny predmet zostáva dostupné.
- Hromadné zbieranie uloží stav a aktualizuje HUD raz za celú dávku.

### Fixed

- Plná mriežka neblokuje automatické zlato a zásoby. Predmet, ktorý sa nezmestí, zostáva na zemi a nebráni zbieraniu ďalšej koristi.
- Testy pokrývajú hranice dosahu, dopad, pauzu, smrť, zbieranie bez hoveru a pokračovanie pri plnom inventári.

## [0.8.0] - 2026-11-03

### Added

- Fyzický dopad všetkej koristi z nepriateľov a kameňov: výbava, zlato, zásoby, materiály, vzorky, kľúče aj relikvie.
- Ručné zbieranie ľavým kliknutím alebo klávesom Y s kurzorom nad predmetom; dosah 180 jednotiek.
- Tooltip s ikonou, požadovanou úrovňou, raritou, atribútmi, bonusmi, špeciálnymi vlastnosťami a možnosťou vybavenia.
- Automatické porovnanie použiteľnej výbavy s rovnakým slotom: zelené zvýšenia, červené zníženia a číselné rozdiely.
- Preklápanie tooltipu pri okrajoch obrazovky a odstup od kurzora, aj pri scrollovaní a pohybe kamery.
- Testy manuálnych vstupov, dopadu, nulového automatického zbierania, plného inventára, porovnávania a zachovania koristi.

### Changed

- Odstránené priťahovanie zlata a všetky automatické prevody predmetových odmien pri zabití do inventára.
- Štvrtá schopnosť je na V; Y je vyhradené zbieraniu. Označenia ovládania sú zjednotené.
- Nová výbava kontroluje požadovanú úroveň pri nasadení; existujúce predmety zostávajú použiteľné.

### Fixed

- Plný inventár ponechá predmet na zemi bez predaja. Uloženie, cestovanie a ukončenie trhliny zachovajú nepozbieranú korisť bez duplikácie.

## [0.7.0] - 2026-11-03

### Added

- Klasicky ladený inventár s bronzovým rámom, vlastnými SVG ikonami a dvoma mriežkovými stranami 5 × 9.
- Rozmery predmetov, presúvanie a výmena myšou, dotykový výber cieľa, tooltipy, detail a triedenie.
- Prilba, štít, obuv, náramok, náhrdelník, náušnice, opasok a talizman popri zbrani a brnení.
- Samostatná mriežka zásob so stackovaním elixírov, plášťov, materiálov a vyrobených kameňov.
- Použitie predmetov z inventára, zloženie výbavy a odstraňovanie s potvrdením a voľbou počtu kusov.
- Testy rozmerov, kolízií, plného batohu, všetkých slotov, zásobníkov, potvrdenia odstránenia a migrácie.

### Changed

- Všetky sloty padajú z koristi, možno ich vylepšovať a okamžite ovplyvňujú skutočné štatistiky postavy.
- Kapacitu výbavy určujú obsadené políčka; staré väčšie batohy dostávajú potrebné dodatočné strany bez straty predmetov.

### Fixed

- Neplatné presuny a zloženie do plného batohu nemenia predmety. Výmena predmetov neposkytuje bezplatné liečenie.
- Responzívne okno inventára nepreteká za šírku mobilného displeja.

## [0.6.1] - 2026-11-03

### Added

- Nezávislé pokojové potulovanie príšer v okruhu 85 jednotiek s prirodzenými prestávkami.
- Pomoc vlastnej skupiny po zásahu: najviac päť živých členov vrátane obete, bez reťazenia na susedné skupiny.
- Testy pohybu na všetkých mapách, skupinového limitu, smrteľného zásahu, úteku a kompatibility ukladania.

### Changed

- Nepravidelné centrá skupín a náhodné pozície pri spawne aj respawne pri zachovaní identifikátorov a hustoty.

### Fixed

- Príšery už nestoja v pevných rozostupoch. Po ukončení prenasledovania sa vrátia domov a pokračujú v potulovaní.

## [0.6.0] - 2026-11-02

### Added

- Publikované offline súbory `dist/Grindoria.html` a `dist/index.html` priamo v repozitári.
- Kontrola zhody publikovaného zostavenia so zdrojmi v CI.
- Prenos kompatibilného uloženého postupu pod nový kľúč; výber postavy pri viacerých profiloch.

### Changed

- Názov hry Grindoria a slogan „Definitely not Metin“ v rozhraní, dokumentácii a zostavení.
- Odkazy a názvy súborov zjednotené s repozitárom `ndxnraw/Grindoria`.
- Bežné, elitné a vzácne príšery sú neutrálne, kým ich hráč nezasiahne alebo neprivolá plášťom. Bossovia si zachovávajú automatické aggro.

### Fixed

- Zostavenie odstraňuje zastarané názvy HTML výstupov a skúšobné vydanie nemení publikovaný dist.

## [0.5.0] - 2026-11-02

### Added

- Husté skupinové spawny v štyroch úrovňových oblastiach každej mapy: 148–196 pohyblivých príšer, osem kameňov a boss.
- Elitné a vzácne varianty, samostatné vzácne hliadky a lepšie odmeny pri zachovaní limitov EXP.
- Spotrebný Plášť statočnosti (B), uložená zásoba, predaj a dopĺňanie z koristi, vlna použitia a aktívne hromadné prenasledovanie.
- Trvalé spawn sloty, migrácia starých populácií a kompatibilita už rozbehnutých trhlín.
- Testy hustoty, variantov, pohybu, presného dosahu, spotreby, respawnu, migrácie a trhlín.

### Changed

- AI skupín používa priestorovú mriežku, rozostupy a obchádzanie útočiska; minimapka sa prekresľuje desaťkrát za sekundu.
- Respawn podľa typu: 5 s bežné príšery, 8 s elity, 20 s náhodné vzácne varianty a 75 s vzácne hliadky.

### Fixed

- Útočné schopnosti a základný útok nemožno používať na bezpečné farmenie zvnútra útočiska; liečenie a aury ostávajú dostupné.
- Škálovanie novej trhliny zachováva silu elitných a vzácnych variantov.

## [0.4.0] - 2026-11-02

### Added

- Panel Progres (P) s tréningom atribútov, stupňami schopností, biologickým výskumom, alchýmiou, relikviami, špecializáciou a endgame expedíciami.
- Prax schopností za skutočné zabitia, knihy, materiály a náklady jednotlivých ciest rozvoja.
- Vylepšovanie konkrétnych predmetov do +9, tri alchymistické sloty a vzácne relikvie s garantovaným dropom po sérii neúspechov.
- Trhliny od úrovne 35 s vlastným postupom, menou a permanentným relikviárom.
- Migrácia starších postáv vrátane percentuálneho EXP postupu a starých kováčskych bonusov.
- Testy paralelných systémov, ochrany odmien, migrácie a stavu expedícií; dokumentácia ekonomiky a EXP tabuľka.

### Changed

- Výrazne pomalšia EXP krivka, odmeny podľa úrovne nepriateľa a penalizácia príliš slabých cieľov.
- Znížený vplyv samotného levelu na útok a vyšší význam ostatných ciest rozvoja.
- Úrovne a sila nepriateľov v jednotlivých mapách; odporúčané úrovne oblastí 1, 8, 18 a 35.
- Opakovateľný lov odmeňuje primerané zabitia tréningom a zlatom, nie EXP.

### Fixed

- Testy nástrojov vydávania už nie sú viazané na konkrétne číslo verzie.

## [0.3.1] - 2026-11-02

### Added

- Štruktúra projektu s oddelenými dátami, hernými systémami, vykresľovaním a rozhraním.
- Lokálny server a reprodukovateľné zostavenie samostatného offline HTML bez externých závislostí.
- Testy herných mechaník a nástrojov vrátane prípravy vydania.
- Dokumentácia architektúry, ovládania, prispievania a vydávania verzií.
- Automatické kontroly pre Windows a Linux cez GitHub Actions.
- Príkaz na vydanie verzie so zosúladením package.json, označenia hry a changelogu.

### Fixed

- Pripojenie tlačidla „Ako hrať“ k sprievodcovi.

## [0.3.0] - 2026-11-02

### Added

- Sura, osem škôl a 48 adaptovaných klasických schopností.
- Mana, inteligencia, strely, jedy, popálenie, omráčenie a podporné aury.
- Púštna, zasnežená a ohnivá mapa s vlastnými protivníkmi a bossmi.
- Cestovanie a samostatne uložený stav jednotlivých máp.
- Odlišné vektorové postavy, zbrane a efekty schopností.

### Changed

- Respawn príšer na 5 sekúnd, kameňov na 18 sekúnd a bossov na 40 sekúnd.

### Fixed

- Zostavenie offline štýlov pri odstraňovaní externého fontu.

## [0.2.0] - 2026-11-02

### Added

- Povolania: Bojovník, Ninja a Šaman.
- Body vlastností, kritické zásahy a odlišné schopnosti povolaní.
- Batoh, tri vzácnosti výbavy, nasadzovanie a predaj.
- Lesný boss s varovaním pred úderom a možnosťou úhybu.
- Denník úloh, odmena za bossa a opakovateľný lov.

## [0.1.0] - 2026-11-02

### Added

- Údolie s pohybom postavy, vlkmi, kameňmi osudu a súbojmi.
- Skúsenosti, úrovne, zlato, korisť a liečivé elixíry.
- Obchodník, vylepšovanie meča a úvodná úloha.
- Minimapka, dotykové ovládanie, voliteľný zvuk a automatické ukladanie.
- Samostatný HTML súbor hrateľný bez internetu.

[Unreleased]: https://github.com/ndxnraw/Grindoria/compare/v0.17.0...HEAD
[0.3.1]: https://github.com/ndxnraw/Grindoria/tree/v0.3.1
[0.3.0]: https://github.com/ndxnraw/Grindoria/blob/main/CHANGELOG.md#030---2026-11-02
[0.2.0]: https://github.com/ndxnraw/Grindoria/blob/main/CHANGELOG.md#020---2026-11-02
[0.1.0]: https://github.com/ndxnraw/Grindoria/blob/main/CHANGELOG.md#010---2026-11-02
[0.4.0]: https://github.com/ndxnraw/Grindoria/compare/v0.3.1...v0.4.0
[0.5.0]: https://github.com/ndxnraw/Grindoria/compare/v0.4.0...v0.5.0
[0.6.0]: https://github.com/ndxnraw/Grindoria/compare/v0.5.0...v0.6.0
[0.6.1]: https://github.com/ndxnraw/Grindoria/compare/v0.6.0...v0.6.1
[0.7.0]: https://github.com/ndxnraw/Grindoria/compare/v0.6.1...v0.7.0
[0.8.0]: https://github.com/ndxnraw/Grindoria/compare/v0.7.0...v0.8.0
[0.8.1]: https://github.com/ndxnraw/Grindoria/compare/v0.8.0...v0.8.1
[0.9.0]: https://github.com/ndxnraw/Grindoria/compare/v0.8.1...v0.9.0
[0.10.0]: https://github.com/ndxnraw/Grindoria/compare/v0.9.0...v0.10.0
[0.11.0]: https://github.com/ndxnraw/Grindoria/compare/v0.10.0...v0.11.0
[0.12.0]: https://github.com/ndxnraw/Grindoria/compare/v0.11.0...v0.12.0
[0.13.0]: https://github.com/ndxnraw/Grindoria/compare/v0.12.0...v0.13.0
[0.14.0]: https://github.com/ndxnraw/Grindoria/compare/v0.13.0...v0.14.0
[0.15.0]: https://github.com/ndxnraw/Grindoria/compare/v0.14.0...v0.15.0
[0.16.0]: https://github.com/ndxnraw/Grindoria/compare/v0.15.0...v0.16.0
[0.17.0]: https://github.com/ndxnraw/Grindoria/compare/v0.16.0...v0.17.0
