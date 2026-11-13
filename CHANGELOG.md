# Changelog

Zmeny projektu Grindoria. Používame sémantické verzie a sekciu `[Unreleased]` pre ďalšie vydanie. Záznamy 0.1.0–0.3.0 opisujú vývoj prototypu pred založením repozitára; nepredstavujú spätne vytvorené Git commity alebo tagy.

## [Unreleased]

### Added

### Changed

### Fixed

## [0.39.1] - 2026-11-13

### Added

### Changed
- Distribúcia a vydávanie používajú offline HTML a webový prehliadač.

### Fixed

## [0.39.0] - 2026-11-05

### Added
- Cestovanie do oblastí podľa prehľadu Metin2 s lokálnymi súpiskami príšer, ich úrovňami, agresivitou a základným EXP.
- Štyri diely EXP, body vlastností za štvrtiny, body schopností za úroveň, prsteň tajomstva a kombinovateľné bonusy EXP.

### Changed
- Normálne úrovne používajú tabuľku Metin2 až do úrovne 120. EXP z protivníka zohľadňuje rozdiel úrovní a limit 10 %.
- Odmeny a výbava už nepoužívajú rarity. Pevné úrovne predmetov a existujúce bonusy zostávajú.

### Fixed
- Nové oblasti ukladajú kompaktné súpisky, aby osem prejdených profilov vošlo do úložiska prehliadača.

## [0.38.1] - 2026-11-05

### Added

### Changed

### Fixed
- Bežná výbava a dungeonové unikáty majú pevnú požadovanú úroveň. Oprava sa použije aj na rozpoznanú výbavu v starších uloženiach.

## [0.38.0] - 2026-11-05

### Added
- Katalóg 147 zbraní a 88 brnení so základnými atribútmi a pevnými úrovňami pre štyri povolania.
- Obchodník predáva Zosilniť predmet a Začarovať predmet. Zásoby sa používajú potiahnutím na výbavu.

### Changed
- Nová výbava začína so základnými atribútmi. Dodatočné bonusy sa pridávajú a menia v inventári.
- Korisť zbraní a brnení vyberá katalógové položky podľa úrovne zdroja a povolania.

### Fixed
- Staršie profily dostanú zásoby a ponuky pre nové predmety bez prepisu existujúcej výbavy.

## [0.37.2] - 2026-11-05

### Added

### Changed

### Fixed
- Pohyb odoberie zameranie herným tlačidlám vrátane zatvárania okien. Kliknutia a otváranie okien zachovajú držané pohybové klávesy.

## [0.37.1] - 2026-11-05

### Added

### Changed

### Fixed
- Kliknutie na predmet myšou už nevytvára výber a práca v inventári neruší držané klávesy pohybu.

## [0.37.0] - 2026-11-05

### Added
- Predaj výbavy a obchodovateľných materiálov pretiahnutím z inventára do obchodu. Samostatné potvrdenie uprostred obrazovky s cenou, výberom množstva, Enter a Esc.
- Regresie zrušenia predaja, neplatných alebo zmenených ponúk, jednorazovej platby a rozloženia všetkých ponúk oboch NPC na malých obrazovkách.

### Changed
- Obchodníci zobrazujú iba ponuku a cenu predmetu; odstránený hráčov zostatok, jeho porovnanie s cenou a záložky výkupu výbavy a materiálov.
- Kompaktná mriežka obchodov sa prispôsobuje obrazovke bez scrollovania.

### Fixed
- Predaj cez obchod sa nezamení za vyhodenie na zem; neobchodovateľné predmety a nasadená výbava sa odmietnu.

## [0.36.3] - 2026-11-05

### Added

### Changed

### Fixed
- Pohyb postavy cez WASD a šípky ruší výber inventárového predmetu a vracia zameranie z inventára na hernú plochu. Pohyb už nezapína zlatý rámik klávesového zamerania na políčkach.

## [0.36.2] - 2026-11-05

### Added

### Changed

### Fixed
- Výber predmetu sa čistí aj po odmietnutom alebo prerušenom dragu a pri zatvorení inventára. Opakovaný klik na vybraný predmet výber zruší; rámik sa neobnoví po opätovnom otvorení inventára.

## [0.36.1] - 2026-11-05

### Added

### Changed

### Fixed
- Zrušenie vyhodenia cez Zrušiť, Esc alebo zatváracie tlačidlo odstráni aj výber predmetu v inventári. Následný klik na prázdne políčko ho už omylom nepresunie.

## [0.36.0] - 2026-11-05

### Added
- Spoločná grafická mriežka pre obchody, výkup výbavy a materiálov, vylepšovanie a recepty. Dvojpolíčkové zbrane a brnenia používajú rozmery batohu.
- Prehliadačové kontroly grafického nákupu, predaja, výroby, vylepšovania, stránkovania, nedostatočného levelu a malých obrazoviek.

### Changed
- Textové zoznamy obchodov a kováča nahrádzajú ikony s výberom predmetu a jedným detailom. Suroviny majú vlastné políčka s počtom máš / potrebuješ; nesplnené požiadavky sú červené.
- Obchod má záložky Ponuka, Výkup výbavy a Materiály; výroba zachováva kategórie receptov a pridáva stránky mriežky. Kováč ukazuje grafický náhľad pred a po vylepšení.

### Fixed
- Po spotrebovaní posledného talizmanu či ochranného zvitku možno zapnutú voľbu odškrtnúť a pokračovať bez nej.

## [0.35.2] - 2026-11-05

### Added
- Prehliadačová regresia nemennej veľkosti inventára pri ťahaní okna a červeného náhľadu pri neplatnom presune vo fullscreene.

### Changed

### Fixed
- Presúvanie inventárového okna už nemení jeho rozmery ani veľkosť políčok; veľkosť určuje dostupná plocha obrazovky.
- Červený náhľad odmietnutého presunu predmetu je viditeľný aj vo fullscreene.

## [0.35.1] - 2026-11-05

### Added

### Changed
- Presun predmetu na obsadené políčka sa odmietne bez výmeny pozícií. Ťahaný predmet má pri neplatnom umiestnení červený náhľad; kontrola platí aj pre zásoby a celý dvojpolíčkový predmet.
- Batoh vypĺňa celú šírku inventára. Zbrane a brnenia majú rozmery 1 × 2, ostatné predmety 1 × 1; staré predmety aj platné pozície zostávajú zachované.
- Úzky zvislý inventár podľa Metinu2: vybavenie nad batohom, menšie ikony predmetov, päť strán a Yang v spodnom riadku. Presúvanie, vyhadzovanie, porovnanie aj dvojklik zostávajú zachované.
- Rozmiestnenie vybavenia podľa Metinu2: zbraň vľavo, prilba nad brnením, štít a náramok vpravo od brnenia, šperky na pravom okraji, talizman a opasok dole a obuv pod postavou.
- Inventár prispôsobuje veľkosť políčok dostupnej výške okna; výbava, Yang, ovládanie a všetkých 45 políčok aktuálnej strany sú viditeľné bez scrollovania.

### Fixed
- Odstránené duplicitné záhlavie inventára a nadbytočné rozostupy. Rozloženie sa prepočíta pri otvorení, presune a zmene veľkosti obrazovky.

## [0.35.0] - 2026-11-05

### Added
- Škálované série Lovca s cieľom a odmenou uzamknutou pri začiatku série; prevod uložených nárokov, importov a neaktívnych postáv.
- Regresie opakovaného odovzdávania biológovi, zvyšovania cieľov, prebytku zabití, level-upu, odmien a atómového importu.

### Changed
- Lovec začína na 10 cieľoch, rastie podľa dokončení a levelu do 200; odmeny rastú úmerne dĺžke série.
- Biológ už nevyžaduje zabitia medzi odovzdaniami. Pokročilé časové cooldowny, vzorky, Yang, levely a odmeny zostávajú.
- Návody a pravidlá systémov sú sústredené v Ako hrať; ostatné okná majú len relevantné údaje, podmienky, stav a akcie.

### Fixed
- Mená NPC bez prípony F, Yang pod vybavením v inventári a obchodník bez nesúvisiaceho tlačidla Kováča.
- Biológ neukazuje rovnakú blokujúcu podmienku dvakrát. Rozpracovaná séria Lovca sa nezmení po level-upe ani načítaní.

## [0.34.1] - 2026-11-05

### Added

### Changed
- Vlny obrancov Metinov majú približne o 10 % kratší interval, s pôvodnou veľkosťou a limitmi.
- Šanca na výbavu z príšer: bežná 6 %, elita 20 %, vzácna 60 %, privolaný obranca Metinu 2 %. Bossovia zostávajú zaručeným zdrojom; dropy samotných Metinov, materiálov, meny a rarity zostávajú zachované.

### Fixed

## [0.34.0] - 2026-11-05

### Added
- Integračné porovnanie všetkých ôsmich škôl so slabou a vylepšenou výbavou, vyššími cieľmi a prevodom Metinov zo schémy 2.

### Changed
- Metiny majú približne 2,5× až 3,1× viac HP než v 0.33.1; na Lv.99 260 420 HP. Prevod zachová percento života, zničenie, obrancov aj násobky výprav a udalostí.
- Útočné schopnosti menej čerpajú z vrodeného útoku a INT, dvojnásobne z útoku a mágie výbavy vrátane vylepšení. Základný koeficient 0,65 a útočný stupeň maximálne 1,875× na P platia aj pre jed, oheň a Ducha plameňa.
- Kniha schopností a Postava zobrazujú upravenú útočnú silu a bonus stupňa. Liečenie, podporné trvania, mana a cooldowny zostávajú zachované.

### Fixed
- Kvalita a vylepšenie výbavy majú podstatný vplyv na poškodenie kúziel. Žiadne oslabenie podľa rozdielu levelov; vybavený hráč naďalej môže porážať vyššie ciele a získavať EXP.

## [0.33.1] - 2026-11-05

### Added

### Changed

### Fixed
- Horná navigácia zostáva iba v Prehľade; Bestiár a zbierky aj Atlas Metinov zobrazujú vlastný obsah bez opakovaných preklikov.

## [0.33.0] - 2026-11-05

### Added
- Regresie rozložení klávesnice, automatického liečenia, odmien Lovca a prevodu zdravia uložených Metinov.

### Changed
- Hotbar podľa fyzických pozícií 1–8 vrátane slovenskej klávesnice, Tab pre cestovanie a prepínač všetkej automatiky.
- Automatické elixíry pri chýbajúcom zdraví každé 2 s; ručné použitie bez cooldownu, aj pri zapnutej automatike.
- Atlas Metinov v P, biologické informácie iba cez N; odstránený katalóg predmetov, platený tréning atribútov, spodné inventárové akcie a nadbytočné prekliky.
- Lovec zobrazuje skutočný počet zabití a dáva Yang a rudu podľa levelu, knihy za každé piate a kamene za každé desiate odovzdanie.
- Zdravie Metinov násobené 1,8 + 0,035 × level; staré kamene zachovávajú percento života, zničenie a obrancov.

### Fixed
- Inventárový náhľad používa farby porovnania ako dropy vrátane nesplneného požadovaného levelu.

## [0.32.0] - 2026-11-04

### Added
- Dungeon Majster v Meste, samostatné ponuky NPC a kompaktné potvrdenie vyhodenia s Enter.
- Stupne schopností Normál 1–20, M1–M10, G1–G10 a P vrátane kníh, kameňov duše a jednotného škálovania.
- Migračné a integračné regresie odstránených systémov, úloh, NPC, inventára a zachytenia Esc.

### Changed
- Atribúty, tréning, špecializácia a prestíž patria do Postavy; štúdium schopností priamo do knihy V.
- Biologický prehľad ukazuje iba aktuálnu etapu; odovzdávanie je v osobitnej službe Biológa. Odmeny, mapy zdrojov, ceny a intervaly zodpovedajú požadovaným úrovniam.
- Progresia bez duplicít a služieb NPC. Výroba a vylepšovanie cez výber Kováča; dungeony a trhliny u Dungeon Majstra.
- Inventár s piatimi stranami, porovnaním pri náhľade a kompaktnými akciami. Splnené úlohy sa presunú do histórie a HUD vyberie ďalšiu.
- Splniteľné akcie sú zelené, cestovanie je pri minimape a bežný Esc neukončuje podporovaný fullscreen; F10 zostáva dostupné aj pri čakaní na oprávnenie.

### Removed
- Alchýmia, Alchymista, odvary, drahokamy a celý systém relikvií. Stará prax a zásoby sa jednorazovo prevedú bez resetu postavy.
- Samostatné okná Atribúty, Schopnosti, Udalosti a Endgame v Progresii; udalosti naďalej prebiehajú.

### Fixed
- Zámena účelu informačných panelov a služieb, neprimerané zdroje pokročilého výskumu a nejednoznačné potvrdenia inventára.

## [0.31.0] - 2026-11-04

### Added
- Nezávislé herné vrstvy s presúvaním cez lokálny Interact.js 1.10.27, minimalizáciou, poradím a zapamätaním polohy; rovnaká správa pre NPC služby.
- Samostatná Postava C, veľká mapa M, ovládanie automatického boja K a hlavné menu Esc.
- Regresie súčasných vrstiev, klávesnice a skutočného browserového presúvania vrátane inventára a mobilu.

### Changed
- Zlatohnedé rámy, kruhová minimapa, kompaktný HUD a osem rýchlych pozícií; schopnosti 1–6/F1–F6, elixír 7/F7 a plášť 8/F8.
- Klávesy N pre úlohy, H pre pomoc a V pre schopnosti; Alt zobrazí červené mená nepriateľov. Klik na zem vedie postavu na miesto.
- Vrstvy nepozastavujú hru. Otvorené panely zachovávajú vlastný obsah, posunutie, filtre a obsluhy.

### Fixed
- Izolácia akcií obchodníka, inventára a progresie pri súčasnom otvorení, samostatné ID a bezpečné formuláre bez aktivácie bojových skratiek.

## [0.30.0] - 2026-11-04

### Added
- Integračné kontroly tempa levelov 1–99, všetkých máp a ôsmich škôl na piatich úrovniach; kontrola ôsmich plne preskúmaných postáv vrátane záloh a obnovy.

### Changed
- EXP krivka na približne 26–181 primeraných bežných protivníkov na level; jednorazová migrácia zachová level aj pomerný postup.
- Sila, zlato a úroveň bežnej výbavy podľa skutočného levelu nepriateľa; oblasti a bossovia pokrývajú uvedené rozsahy máp, udalosti ich neprekračujú.
- Výbava z primeraných bežných cieľov 12 %, elít 45 %; lepšie rarity bossov, elít a vzácnych cieľov. Slabé ciele nedávajú rozvojovú výbavu ani liečivé elixíry.
- Štartovacia zbraň +2, samostatné krivky vylepšení pre jednotlivé atribúty, miernejšie ceny a riziko kováča; dostupnejšie ikonické zbrane a výhodnejšie dávky spotrebných receptov.
- Rýchlejšia prax schopností, lineárne náklady relikviára a škálovanie liečivého/mana elixíra. Úplný prestížny bestiár zahŕňa všetkých 25 druhov.
- Bezstratovo zbalené lokálne profily a populácie, cache nezmenených postáv a širší limit prenosných JSON záloh; ukladanie neuchováva resetované dočasné údaje obyčajnej AI.

### Fixed
- Neplatné relikvie šiestich nových bossov a obnova už poškodených registrov a záloh bez straty výbavy.
- Nesplniteľná Žatva materiálov v Šuterlande, úlohová odmena závislá od miesta vyzdvihnutia, nesprávne úrovne a rarity ikonických receptov a nulový pancier Metinov v bestiári.
- Resetovanie cooldownov prepínaním postavy a použitie spotrebných predmetov v pozastavenom boji.

## [0.29.0] - 2026-11-04

### Added
- Kontrola stabilných GitHub Releases pri štarte, ručné stiahnutie a uloženie aktívnej postavy pred inštaláciou a reštartom.
- Offline pokračovanie, priebeh sťahovania, kontrola integrity a úzko obmedzené aktualizačné IPC.
- Desať regresií aktualizácií a test skutočného zabaleného hosta s oddeleným profilom.

### Changed
- Stabilný desktopový origin a používateľský profil nezávislý od verzie; existujúce HTML zostáva samostatne hrateľné.
- Release postup aktualizuje aj package-lock.json.

### Fixed
- Pri chybe ukladania sa inštalácia aktualizácie nespustí; sieťový problém neblokuje hranie.

## [0.28.0] - 2026-11-04

### Added
- Štartovacie Common zbrane +9 podľa povolania a školy; jednorazové doplnenie neozbrojeným starým postavám Lv.1.
- Šesť lovísk: Vlčia lúka, Jedovaté močiare, Zabudnutý lom, Búrkové vrchy, Démonické ruiny a Pustatina skazy, vrátane príšer Lv.99.
- Blízke plošné základné útoky a zmenšené plošné poškodenie pri dopade základného šípu.
- Šestnásť integračných testov začiatku, progresie, AoE, máp a migrácie.

### Changed
- Najnižšie levely oblastí sú vždy pri vstupe mapy. Údolie má prvé skupiny Lv.1–2, nízke Metiny a bossa Lv.8.
- Obyčajné dropy výbavy používajú päťlevelové pásma; pomenované zbrane a pevné odmeny zachovávajú požiadavky.
- Mapy zobrazujú odporúčané pásma a sú zoradené podľa úrovne; typy Metinov rešpektujú svoje levely.

### Fixed
- Tooltipy nevypisujú neexistujúce nulové bonusy ani nulové hodnotenie predmetu bez bonusov.
- Bezpečný prepočet starých spawnov zachováva poškodenie, smrť a respawn bez straty koristi alebo progresu.

## [0.27.0] - 2026-11-04

### Added
- Odstupňovaná a rozložená aktualizácia vzdialenej neaktívnej AI pri zachovaní plnej frekvencie boja, efektov a respawnov.
- Opakovateľný CPU benchmark, lokálne porovnanie HTML zostáv v prehliadači a 16 výkonových regresií.

### Changed
- Culling pred triedením scény, znovupoužitie renderovacích záznamov, separačných buniek a gradientu.
- Bitmapová cache koristi s limitom počtu ikon aj práce na snímok; vzdialená korisť používa značku rarity, blízka a označená vlastnú ikonu.
- Vyhľadávanie cieľov bez triedenia, index spawnov a lineárne mapovanie Metinov na posily.
- Hromadná expirácia koristi bez opakovaného posúvania poľa, menej duplicitných výpočtov HUD a vykresľovanie pozadia menu na 10 Hz.

### Fixed
- Zbytočné generovanie geometrie a dekódovanie SVG ikon pri každom snímku s veľkým množstvom koristi.

## [0.26.0] - 2026-11-04

### Added
- Spoločný katalóg predmetov, stabilné ID jednotlivých kusov a validácia identity naprieč inventárom, výbavou, trhom a mapami.
- FMS, Jedovatý meč, RIB, Dýky Čierny list a Vejár jesenného vetra: päť vlastných modelov, základné bonusy, výroba a vzácne dropy; FMS a Jedovatý meč aj u zbrojára.
- Konfigurovateľné loot pooly podľa druhu nepriateľa, mapového bossa, typu Metinu a dungeonu; katalóg s požiadavkami a získavaním v Progresii.
- Štrnásť integračných testov identity, presunov, bonusov, migrácie, neplatných dát a samostatného načítania skriptov v prehliadači.

### Changed
- Zásoby používajú spoločné definície pri zachovaní existujúcich počítadiel a ukladania. Základné bonusy predmetov vstupujú do bojových štatistík aj porovnania.

### Fixed
- Zdrojový náhľad načítava uložené postavy až po registrácii všetkých modulov, rovnako ako offline zostava.
- Zdvihnutie predmetu zachová jeho pôvodné ID. Snímky koristi hlboko kopírujú vnorené štatistiky a bonusy.

## [0.25.0] - 2026-11-04

### Added
- Sedem náhodných udalostí: elitná hliadka, prepad lovcov, žatva materiálov, prastarý boss, vzácny Metin, skryté ruiny a démonický sprievod.
- Časové limity, rozdielne pravdepodobnosti vrátane 1 % sprievodu, priebežný HUD, detail cieľa a odmien v Progresii a denníku.
- Viacerí aktívni bossovia, vzácne modelové označenia, nové dočasné lokality a záznamy objavov.
- Obnova udalostí, časovačov, nepriateľov a náhody v existujúcich snímkach máp; izolácia postáv a validácia záloh.
- Dvadsať integračných testov plánovania, odmien, expirácie, migrácie a ukladania.

### Changed

### Fixed
- Cieľový panel a modely rešpektujú vlastné mená vzácnych bossov a Metinov.

## [0.24.0] - 2026-11-04

### Added
- Prestíž I–V po úrovni 99 bez resetu levelu, výbavy alebo progresu; rôznorodé podmienky postupu a jednorazové odmeny.
- Prestížne dungeony s nepriateľmi Lv.99, vzácnymi bossmi, vyššou odolnosťou, odmenami a novými prstencovými a pásovými mechanikami.
- Znaky prestíže, tri pasívne tréningy, deväť endgame cieľov a deterministické zdokonaľovanie Mythic bonusov od prestíže III.
- Farebné emblémy a označenia postavy v hernom svete, HUD aj výbere postáv.
- Kompatibilné ukladanie, validácia a prenos prestíže v zálohách; 18 integračných testov.

### Changed

### Fixed

## [0.23.0] - 2026-11-04

### Added
- Štyri pokročilé biologické výskumy Lv.40–85, vlastné vzorky a ikony, zdroje z elít, vzácnych príšer a bossov, šance a zaručené dropy.
- Trvalé bonusy zdravia, obrany, útoku, sily kúziel a rýchlosti pohybu.
- Uložené intervaly odovzdávania 5–30 minút s odpočtom aj v otvorenom okne, biologický výskum v denníku a 13 integračných testov.
- Bestiár objavených nepriateľov s pôvodnými modelmi, atribútmi, výskytom, známymi dropmi a počtami porazených.
- Bossové trofeje, štyri rarity výbavy, tri skryté lokality a sedem jednorazových zbierkových odmien s trvalými bonusmi.
- Oddelený postup postáv, spätná kompatibilita uloženia a validácia objavovania pri importe.

### Changed
- Základné biologické vzorky každá 4./6./8./10. príšera podľa mapy; zachované pôvodné etapy, odmeny, poplatky a progres.
- Aditívne rozšírenie existujúceho ukladania a záloh o vzácne vzorky, čas odovzdania a čítač zaručeného dropu.

### Fixed

## [0.22.0] - 2026-11-03

### Added
- Tri opakovateľné dungeony: Hrobka jedovatého kráľa, Ľadová pevnosť a Priepasť zabudnutých, každá v troch obtiažnostiach s vlastnou lokalitou, rozložením a nepriateľmi.
- Tri unikátne modely bossov, pečate, kruhové útoky, výpady, rázové vlny, mrazivé spomalenie, posily a fázy boja.
- Zaručené unikáty, Legendary a Mythic endgame korisť s ochranou pred zlou sériou, počty dokončení a uloženie rozbehnutých výprav.
- Vstup cez Mapy a Progres, HUD cieľov, bezpečný návrat koristi do Mesta a 17 regresných testov dungeonov.

### Changed
- Existujúci boj, inventár, fyzická korisť a mapové snímky podporujú oddelené dungeonové výpravy bez zmeny pôvodných trhlín.

### Fixed
- Zabitie bossa vyplatí odmeny len raz; mŕtvi nepriatelia v dungeone sa neobnovujú.
- Načítanie zachová poškodenie, dokončené ciele, fázy, polia a pripravovaný útok bez znásobenia populácie.

## [0.21.0] - 2026-11-03

### Added
- Potvrdené vyhodenie výbavy a časti zásob potiahnutím mimo inventára alebo tlačidlom; ručné zdvihnutie zo zeme a zachovanie pri uložení.
- Spoločné prehľady Máš / Potrebuješ, textové označenie chýbajúcich zdrojov a aktuálny stav hotbaru.
- Integračné regresie panelov, vyhodenia, ručnej koristi, klávesnice a hotbaru; dokumentácia UI.md.

### Changed
- Jednotný vzhľad obchodov, kúziel, úloh, progresie a inventára: písmo, povrchy, tlačidlá, záložky, fokus a mobilné rozloženie.
- Úlohy oddeľujú ciele od odmien, kniha schopností odkazuje priamo na zlepšovanie.

### Fixed
- Nákup, predaj a opakované akcie zachovávajú pozíciu panela a fokus; hlavné okná nemenia výšku podľa obsahu.
- Zásoby vyhodené hráčom sa nevracajú automaticky do inventára. Zrušenie alebo opakované potvrdenie nevytvára duplikáty.
- Použitie alchymistického produktu v inventári má správny názov akcie; Tab ostáva v dialógu a Esc najprv zruší rozpracované potvrdenie.

## [0.20.0] - 2026-11-03

### Added
- Simulovaný NPC trh s konečnými zásobami, dynamickým dopytom, cenovými trendmi a obnovou každých 10 minút aktívnej hry.
- Zbrojár v Meste, exkluzívne ponuky obchodníkov, nákup materiálov a dve obmedzené vzácne ponuky výbavy.
- Výkup výbavy a materiálov s bonusmi špecialistov, prehľadom cien, zásob a obnovy.
- Izolovaný uložený trh každej postavy, migrácia, validácia záloh a 13 regresných testov ekonomiky.

### Changed
- Yang ako hlavné označenie meny v obchodných paneloch a peňaženke.
- Nákup elixírov a plášťov používa trhové zásoby a ceny; výkup v inventári vyžaduje blízkeho obchodníka.

### Fixed
- Neplatný nákup, zastaraná cena, plný batoh alebo nedostatok Yang nemenia peniaze ani predmety.

## [0.19.0] - 2026-11-03

### Added
- Samostatná výroba a alchýmia s úrovňami 1–10, 47 receptami, alchymistom v Meste a filtrami receptov.
- Výroba všetkých desiatich slotov výbavy v troch stupňoch, spotrebných a špeciálnych predmetov, spracovanie surovín a kombinovanie vzácnych materiálov.
- Suroviny z primeraných príšer, Metinov a bossov trhlín; päť alchymistických produktov, vylepšenie odvaru, skutočné dočasné bonusy a trvalý bonus many za majstrovstvo.
- Regresné testy výroby, kapacity, koristi, produktov, importu, migrácií a izolácie postáv; dokumentácia CRAFTING.md.

### Changed
- Pôvodná výroba kameňov a pomôcok používa spoločný receptový systém a príslušné NPC; kováčske pomôcky vyžadujú remeselnú úroveň. Nasadené kamene a ich fúzie sa zachovávajú.

### Fixed
- Offline HTML zostavy obnovené z presných zdrojov repozitára; odstránený nesúlad oddeľovacích prázdnych riadkov zachytený v CI.
- Neúspešná výroba pri chýbajúcich zdrojoch, nesplnených podmienkach alebo plnom inventári nič nespotrebuje.
- Panely výroby a alchýmie sa na úzkej obrazovke neorezávajú; overené v Chromium pri 1440 × 1080 a 390 × 844 vrátane výroby a použitia elixíra many.

## [0.18.0] - 2026-11-03

### Added
- Kováč v Meste: pokusy +0 až +9, rastúce ceny, šance, riziko zníženia a zničenia; talizmany, ochranné zvitky a recepty.
- Nová lokalita Mesto pre obchodníka, kováča a biológa; spoločný register NPC a služieb.
- Stupňujúce sa efekty zbraní +5 až +9 v hernom modeli, ikonách aj portrétoch.
- Integračné testy kováča, ochrany, migrácií, Mesta, cestovania a ovládania.

### Changed
- Bojové mapy rozšírené na 3200 × 3200 s väčšími nepravidelnými loviskami; malá bezpečná zóna na odlišnom mieste každej mapy.
- Cestovanie cez M kdekoľvek mimo boja, bez portálov a centrálneho útočiska; NPC presunuté do Mesta.
- Častejšie vlny Metinov; po zničení kameňa zomrú jeho obrancovia s obvyklými odmenami.
- Respawn bežných príšer 8 s, elít 12 s, vzácnych 60 s a hliadok 180 s; vzácne varianty skupín 0,3 %.
- Staré pozície, korisť, zdravie, inventár a stupne vylepšenia sa zachovávajú; staré profily a zálohy doplnia nové počítadlá materiálov.

### Fixed
- Druhý klik na ten istý označený cieľ spustí nasledovanie a útok aj bez natívneho dvojkliku.
- Ukončenie trhliny bezprostredne po boji bezpečne vráti postavu do Mesta.

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

[Unreleased]: https://github.com/ndxnraw/Grindoria/compare/v0.39.1...HEAD
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
[0.18.0]: https://github.com/ndxnraw/Grindoria/compare/v0.17.0...v0.18.0
[0.19.0]: https://github.com/ndxnraw/Grindoria/compare/v0.18.0...v0.19.0
[0.20.0]: https://github.com/ndxnraw/Grindoria/compare/v0.19.0...v0.20.0
[0.21.0]: https://github.com/ndxnraw/Grindoria/compare/v0.20.0...v0.21.0
[0.22.0]: https://github.com/ndxnraw/Grindoria/compare/v0.21.0...v0.22.0
[0.23.0]: https://github.com/ndxnraw/Grindoria/compare/v0.22.0...v0.23.0
[0.24.0]: https://github.com/ndxnraw/Grindoria/compare/v0.23.0...v0.24.0
[0.25.0]: https://github.com/ndxnraw/Grindoria/compare/v0.24.0...v0.25.0
[0.26.0]: https://github.com/ndxnraw/Grindoria/compare/v0.25.0...v0.26.0
[0.27.0]: https://github.com/ndxnraw/Grindoria/compare/v0.26.0...v0.27.0
[0.28.0]: https://github.com/ndxnraw/Grindoria/compare/v0.27.0...v0.28.0
[0.29.0]: https://github.com/ndxnraw/Grindoria/compare/v0.28.0...v0.29.0
[0.30.0]: https://github.com/ndxnraw/Grindoria/compare/v0.29.0...v0.30.0
[0.31.0]: https://github.com/ndxnraw/Grindoria/compare/v0.30.0...v0.31.0
[0.32.0]: https://github.com/ndxnraw/Grindoria/compare/v0.31.0...v0.32.0
[0.33.0]: https://github.com/ndxnraw/Grindoria/compare/v0.32.0...v0.33.0
[0.33.1]: https://github.com/ndxnraw/Grindoria/compare/v0.33.0...v0.33.1
[0.34.0]: https://github.com/ndxnraw/Grindoria/compare/v0.33.1...v0.34.0
[0.34.1]: https://github.com/ndxnraw/Grindoria/compare/v0.34.0...v0.34.1
[0.35.0]: https://github.com/ndxnraw/Grindoria/compare/v0.34.1...v0.35.0
[0.35.1]: https://github.com/ndxnraw/Grindoria/compare/v0.35.0...v0.35.1
[0.35.2]: https://github.com/ndxnraw/Grindoria/compare/v0.35.1...v0.35.2
[0.36.0]: https://github.com/ndxnraw/Grindoria/compare/v0.35.2...v0.36.0
[0.36.1]: https://github.com/ndxnraw/Grindoria/compare/v0.36.0...v0.36.1
[0.36.2]: https://github.com/ndxnraw/Grindoria/compare/v0.36.1...v0.36.2
[0.36.3]: https://github.com/ndxnraw/Grindoria/compare/v0.36.2...v0.36.3
[0.37.0]: https://github.com/ndxnraw/Grindoria/compare/v0.36.3...v0.37.0
[0.37.1]: https://github.com/ndxnraw/Grindoria/compare/v0.37.0...v0.37.1
[0.37.2]: https://github.com/ndxnraw/Grindoria/compare/v0.37.1...v0.37.2
[0.38.0]: https://github.com/ndxnraw/Grindoria/compare/v0.37.2...v0.38.0
[0.38.1]: https://github.com/ndxnraw/Grindoria/compare/v0.38.0...v0.38.1
[0.39.0]: https://github.com/ndxnraw/Grindoria/compare/v0.38.1...v0.39.0
[0.39.1]: https://github.com/ndxnraw/Grindoria/compare/v0.39.0...v0.39.1
