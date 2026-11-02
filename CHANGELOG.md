# Changelog

Zmeny projektu Grindoria. Používame sémantické verzie a sekciu `[Unreleased]` pre ďalšie vydanie. Záznamy 0.1.0–0.3.0 opisujú vývoj prototypu pred založením repozitára; nepredstavujú spätne vytvorené Git commity alebo tagy.

## [Unreleased]

### Added

### Changed

### Fixed

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

[Unreleased]: https://github.com/ndxnraw/Grindoria/compare/v0.6.0...HEAD
[0.3.1]: https://github.com/ndxnraw/Grindoria/tree/v0.3.1
[0.3.0]: https://github.com/ndxnraw/Grindoria/blob/main/CHANGELOG.md#030---2026-11-02
[0.2.0]: https://github.com/ndxnraw/Grindoria/blob/main/CHANGELOG.md#020---2026-11-02
[0.1.0]: https://github.com/ndxnraw/Grindoria/blob/main/CHANGELOG.md#010---2026-11-02
[0.4.0]: https://github.com/ndxnraw/Grindoria/compare/v0.3.1...v0.4.0
[0.5.0]: https://github.com/ndxnraw/Grindoria/compare/v0.4.0...v0.5.0
[0.6.0]: https://github.com/ndxnraw/Grindoria/compare/v0.5.0...v0.6.0
