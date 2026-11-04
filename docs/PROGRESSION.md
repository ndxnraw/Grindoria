# Progresia a schopnosti

Prehľad P obsahuje prehľad, bestiár a Atlas Metinov. Prideľovanie bodov, špecializácia a prestíž sú v Postave C. Schopnosti sa študujú priamo v knihe V. Kováč a Dungeon Majster otvárajú svoje služby až po interakcii v Meste.

## Levely a atribúty

Maximum je 99. Potrebné EXP = `ceil(baseEnemyXP(L) × (24 + 1,6L))`, základ obyčajnej príšery = `max(6, floor(6L^1,15))`. Primeraný level vychádza približne na 26–181 obyčajných protivníkov. Typ, varianta a rozdiel levelov menia odmenu; slabý cieľ o 8 úrovní nedáva EXP. Viac v [BALANCE.md](BALANCE.md).

Každý level dáva tri voľné body. Postava C prideľuje body do sily, vitality, obratnosti a inteligencie. Platený tréning za pečate a Yang bol odstránený; predtým získané atribúty zostávajú zachované. Za každý piaty primeraný kill padnú dve rudy. Nové dropy tréningových pečatí nahradili užitočné materiály.

## Jedna kniha schopností

| Stupeň | Číselný rozsah uloženého ranku | Označenie |
| --- | --- | --- |
| Normál | 1–20 | 1–20 |
| Majster | 21–30 | M1–M10 |
| Veľmajster | 31–40 | G1–G10 |
| Perfektný majster | 41 | P |

Kniha V ukazuje účinok, manu, aktuálny cooldown, kombo, prax, cenu a tlačidlo vylepšenia. Samostatné okno Schopnosti v Progresii neexistuje. P je konečné a ďalšie pokusy nič nespotrebujú.

Prax sa pripíše pri primeranom zabití, najviac raz za danú schopnosť a nepriateľa; boss dáva 4 jednotky. Aktívne aury sa započítajú, kúzlenie do prázdna nie. Požadovaná prax pri ranku r: Normál `10 + 2r`, Majster `50 + 4(r − 20)`, Veľmajster `90 + 8(r − 30)`. Požiadavky neklesnú pri prechode medzi stupňami.

Pred M1 stojí tréning `20r` Yang. Prechod 20 → M1 a štúdium Majstra používajú knihy: `1 + floor((r − 20)/2)` a `500 + 250(r − 20)` Yang. Od prechodu M10 → G1 sa používajú kamene duše: `1 + floor((r − 30)/2)` a `2500(r − 29)` Yang. Prax sa spotrebuje iba pri úspešnom štúdiu. Knihy pochádzajú z primeraných bossov a Metinov. Kamene duše: boss Lv.35+ 20 %, Metin Lv.35+ 8 %; platí primeranosť cieľa.

Od 0.34.0 rastie násobok útočnej sily stupňa od 1× po 1,875× na P; liečenie a podporné trvania zostávajú 1× až 2,4×. Základ útočných schopností viac závisí od výbavy, pozri [COMBAT.md](COMBAT.md). Obnova sa skracuje najviac o 35 %; mana sa nemení. Stupne, prax a cooldowny zostávajú samostatné pre každú postavu a školu. Každé tretie úspešné štúdium naďalej dáva bod špecializácie.

## Biológ a výpravy

N → Biológ → Podrobnosti výskumu je iba informácia o aktuálnej etape. Odovzdanie je výlučne v samostatnej službe po kliknutí na Biológa alebo F pri NPC. Zdroje, odmeny a intervaly sú v [BIOLOGY.md](BIOLOGY.md).

Vylepšovanie a výrobu ponúkne Kováč v malom výbere služby. Dungeony, prestížne výpravy a trhliny ponúka Dungeon Majster. Aktívna výprava má vlastný stavový panel na dokončenie či odchod. Samostatné okno Endgame neexistuje. Trvalé posilnenie za úlomky trhlín je v Postave C → Prestíž, dostupné od Lv.35. [DUNGEONS.md](DUNGEONS.md), [PRESTIGE.md](PRESTIGE.md).

## Odstránené systémy a staré postavy

Alchýmia, Alchymista a zbierka relikvií sú odstránené z hry vrátane produktov, bonusov a dropov. Kováčsky prach zostáva materiálom výroby; liečivé elixíry vyrába Kováč. Samostatné alchymistické remeslo, odvary, drahokamy ani ich fúzie neexistujú.

Migrácia označená `career.systemsVersion = 1` spracuje aj neaktívne profily a prenosné zálohy. Zachová level, výbavu, voľné body, atribúty, výskum, špecializáciu, prestíž a výpravy. Prax odstráneného remesla pripočíta k výrobe, najviac po jej limit 4500. Odstránené zásoby premení raz na Yang: kameň 100 za kus, nasadený stupeň podľa investovaných `2^stupeň − 1` kameňov; mana 70, odvar sily 40, odolnosti 50, vitality 75, koncentrát 400, extrakt 45 a vlastnená relikvia 150. Stará relikvia na zemi sa zmení na 150 Yang so zachovanou expiráciou. Celkové Yang rešpektuje existujúci limit 10¹².

Staré schopnosti 1–9 prejdú na Normál `2r − 1`, 10–19 na M1–M10 a starý rank 20 na G1. Migrácia sa neopakuje. Výbava ani level sa pri tejto zmene neresetujú.

## Lovec

Za každých desať primeraných cieľov možno vyzdvihnúť jednu odmenu; prebytočné zabitia sa prenášajú do nasledujúcej úlohy a počítadlo zobrazuje skutočný počet aj po splnení. Pre level L pri vyzdvihnutí: `100 + 25L + L²` Yang a `2 + floor(L/10)` rudy. Každé piate odovzdanie navyše dá `1 + floor(L/30)` kníh, každé desiate aj `1 + floor(L/40)` kameňov vylepšenia. Náhľad zobrazuje presne ďalšiu odmenu. Bez náhradných EXP za slabé ciele. Napríklad Lv.50: 3850 Yang + 7 rudy, každé piate odovzdanie +2 knihy a každé desiate aj +2 kamene.
