# Rarity a náhodné bonusy

Od 0.16.0 používa hra šesť rarít. Staré ID ostávajú platné: Common=0, Uncommon=3, Rare=1, Epic=2, Legendary=4, Mythic=5. Na poradie slúži rarityRank, nikdy samotné číslo. Existujúca výbava sa neprepisuje ani neprehodnocuje.

| Rarita | Farba | Počet bonusov | Násobok základu hodnoty |
|---|---|---:|---:|
| Common | sivá | 0 | 1 |
| Uncommon | zelená | 1 | 2 |
| Rare | modrá | 2 | 5 |
| Epic | fialová | 3 | 14 |
| Legendary | zlatá | 4 | 45 |
| Mythic | ružová | 5 | 180 |

## Drop

Požadovaná úroveň obyčajne generovanej výbavy zodpovedá úrovni nepriateľa, najviac 99. Výber rarity naďalej používa skutočnú úroveň zdroja. Pomenované zbrane a pevné odmeny si zachovávajú svoje požiadavky.

Šanca výbavy z primeraného cieľa: obyčajná príšera 12 %, elita 45 %, vzácna príšera a boss zaručene; Metiny majú vlastné šance. Potom samostatný vážený výber určí raritu podľa zdroja. Legendary padá od úrovne nepriateľa 50, Mythic od 75. Pod týmito hranicami sa šance ostatných rarít pomerne prepočítajú.

| Zdroj Lv.99 | Common | Uncommon | Rare | Epic | Legendary | Mythic |
|---|---:|---:|---:|---:|---:|---:|
| Obyčajný | 45 % | 35 % | 17,5 % | 2,2 % | 0,29 % | 0,01 % |
| Elita | 20 % | 35 % | 35 % | 9 % | 0,95 % | 0,05 % |
| Vzácny | 5 % | 20 % | 50 % | 22 % | 2,8 % | 0,2 % |
| Boss | 0 % | 5 % | 50 % | 36,5 % | 8 % | 0,5 % |

Metiny miešajú vlastnú základnú tabuľku s tabuľkou prémiových odmien podľa loot.epic svojho typu. Tento parameter je teraz podiel prémiovej tabuľky, nie výsledná šanca Epic. Aktuálne šance zobrazuje Atlas Metinov pre začiatok úrovňového pásma a sprievodca Rarity pre referenčný Metin skazy Lv.99. Explicitná prémiová odmena z úlohy cez makeItem(true) zostáva minimálne Epic.

## Bonusy

Generátor vyberá bez opakovania z 20 vlastností: útok, HP, MP, kritický a prenikavý zásah, rýchlosť útoku a pohybu, sedem typových odolností a šesť skupín bonusového poškodenia (vlci, škorpióny, yeti, démoni, Metiny, bossovia).

Každý bonus má uložený hod 0–100. Výsledok je (základ + úroveň × koeficient) × (1 + poradie rarity × 0,22) × (0,35 + 0,65 × hod / 100). Celočíselné vlastnosti sa zaokrúhlia na celé čísla, percentuálne na štyri desatinné miesta. Údaje sú v data/rarities.js; systém v systems/item-generation.js. Nové predmety majú generationVersion=1 a zoznam affixes; import overuje počet, jedinečnosť, rozsah hodov aj presný súlad so stats.

Kritický zásah používa pôvodný strop 80 %. Prenikavý má strop 50 % a pri zásahu ignoruje kladnú typovú odolnosť aj pancier a základnú ochranu Metinu; slabiny zachová. Rýchlosť základného útoku sa delí faktorom 1 + bonus, najviac +60 %, s minimálnym odstupom 0,16 sekundy. Cooldowny kúziel sa nemenia. Bonus proti skupine nepriateľa má strop +100 % a boss/Metin sa započítavajú iba do vlastnej kategórie. Typové odolnosti zachovávajú pôvodný strop 75 %.

## Hodnota

Základ = 12 + úroveň × 3. Odhad hodnoty = základ × násobok rarity × (1 + priemerný hod / 100 × 2) × (1 + počet hodov aspoň 95 × 0,35) × (1 + počet synergických väzieb × 0,25) × (1 + vylepšenie × 0,12).

Synergické väzby zahŕňajú útok s kritickým zásahom, prenikavým zásahom, rýchlosťou útoku alebo skupinovým poškodením; HP s fyzickou/ohnivou odolnosťou; MP s rýchlosťou útoku. Ideálna Rare kombinácia môže byť hodnotnejšia než slabý Epic. Obchodník vykupuje za 25 % odhadu, zaokrúhlené nadol. Odhad nie je hráčske trhovisko. Staré predmety si zachovávajú pôvodnú výkupnú cenu. Hodnota nových predmetov sa vypočítava zo skutočných bonusov aj po vylepšení.

## Rozhranie a kompatibilita

V inventári je tlačidlo Rarity. Tooltipy zobrazujú počet bonusov, kvalitu hodov, odhad a výkup. Šesť farieb sa používa v inventári, náhľadoch, postave aj koristi. Epic, Legendary a Mythic majú 10-minútový despawn; ostatná výbava 3-minútový. Modely používajú pôvodných 39 siluet s vlastnými materiálmi, kovaním a runami vyšších rarít.

Ukladanie aj export/import používajú existujúce profily postáv. Staré čísla rarít a stats sa zachovajú; nové metadáta nevynucujú prepis starých predmetov. Testy v tests/rarities.test.cjs kontrolujú generovanie, hranice pravdepodobností, bonusy v boji, predaj, triedenie, ukladanie a transakčné odmietnutie poškodených záloh.
