# Changelog

Zmeny projektu Grindoria. Používame sémantické verzie a sekciu `[Unreleased]` pre ďalšie vydanie. Záznamy 0.1.0–0.3.0 opisujú vývoj prototypu pred založením repozitára; nepredstavujú spätne vytvorené Git commity alebo tagy.

## [Unreleased]

### Added

### Changed

### Fixed

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

- Výber bojovníka, nindžu a šamana.
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

[Unreleased]: https://github.com/ndxnraw/Grindoria/compare/v0.11.0...HEAD
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
