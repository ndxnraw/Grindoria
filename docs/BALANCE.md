# Vyváženie 0.30.0

## Tempo postupu

Pre rovnako silné obyčajné ciele bez plošných útokov rastie počet zabití na ďalší level približne z 26 na 181. Elity, vzácne ciele a bossovia tempo zrýchľujú. Ide o porovnanie odmien, nie sľub počtu hodín hrania.

| Level | Staré potrebné EXP | Nové potrebné EXP | Bežné EXP za rovnaký level | Zabitia po zmene |
|---|---:|---:|---:|---:|
| 1 | 600 | 154 | 6 | 26 |
| 5 | 21 006 | 1 216 | 38 | 32 |
| 10 | 103 822 | 3 360 | 84 | 40 |
| 20 | 554 828 | 10 528 | 188 | 56 |
| 35 | 2 317 765 | 28 560 | 357 | 80 |
| 60 | 9 879 880 | 79 800 | 665 | 120 |
| 98 | 39 259 783 | 211 356 | 1 169 | 181 |

Starý level a jeho pomerný EXP postup sa zachovajú. Zmena sa vykoná raz podľa `career.balanceVersion`; už uložená nová krivka sa znovu neprepočítava. Maximum zostáva 99.

## Mapy a sila

Každá bežná mapa pokrýva svoj uvedený rozsah. Najnižšia oblasť je pri vstupe, ostatné sú zoradené vzdialenosťou. Elitné a vzácne levelové bonusy neprekročia hornú hranicu. Boss má najvyšší level mapy; udalosti zostávajú v rovnakom rozsahu. Šuterland naďalej obsahuje 99 Metinov s pevnými úrovňami 1–99.

Bežná príšera úrovne L má `round(50 + 12L + 0,22L²)` HP a pred obranou spôsobí približne `round(8 + 2L + 0,012L²)` škody. Úroveň hráča už sama osebe neodpočítava ďalšie skryté poškodenie; platia jeho obrana, odolnosti a schopnosti.

| Level príšery | HP bežného variantu | Útok pred obranou |
|---|---:|---:|
| 1 | 62 | 10 |
| 10 | 192 | 29 |
| 20 | 378 | 53 |
| 35 | 740 | 93 |
| 60 | 1 562 | 171 |
| 98 | 3 339 | 319 |

Elita má 1,6× HP, 1,25× poškodenie a 1,8× EXP. Vzácny variant má 2,3× HP, 1,5× poškodenie a 3,2× EXP. Bežný boss používa 9× základné HP a 2,5× základný útok; vzácny eventový boss navyše 1,6× HP a 1,25× útok. Metiny a dungeony majú vlastné zobrazené obrany a násobky obtiažnosti.

Migrácia bežných máp zachová mŕtve sloty, zostávajúci respawn, pomer HP, existujúci variant a pri nezmenenom rozložení aj pozície. Dungeony zostávajú oddelenými výpravami so svojimi pravidlami a uloženým priebehom.

## Výbava a zdroje

Obyčajná generovaná výbava má požadovaný level zdroja, najviac 99. Už sa nezaokrúhľuje na päťlevelové pásma. Pomenované zbrane majú vlastné definované požiadavky; úloha Prvý strážca vždy dáva Epic alebo lepší predmet Lv.8. Rovnaká úroveň zdroja dáva rovnaký základ výbavy bez ohľadu na mapu.

Šanca výbavy z primeraného cieľa: bežný 6 %, elita 20 %, vzácny 60 %, privolaný obranca Metinu 2 %, boss 100 %. Bossovia nedávajú Common; Legendary je dostupná od zdroja Lv.50 a Mythic od Lv.75. Presné rozdelenie je v [RARITIES.md](RARITIES.md). Neprimerane slabé bežné ciele neposkytujú výbavu, liečivé elixíry ani progresné materiály; biologické vzorky a kľúče si zachovávajú svoje výnimky.

Nová zbraň +2 poskytuje začiatok bez preskočenia celej kováčskej krivky. Starý pôvodný štartovací kus +9 sa jednorazovo zmení na +2, zachová identitu aj povolanie. Ostatné vlastnené predmety sa nevyhadzujú ani neprehadzujú.

Vylepšenia majú vlastné jednotky podľa slotu. Talizman +9 pridáva 6,5 percentuálneho bodu kritického zásahu, nie 85. Zbraň +9 pridáva 40 útoku, brnenie 22 obrany a náramok 220 HP. Ceny, šance a 15 % riziko zničenia pri neskorom neúspechu: [FORGE.md](FORGE.md).

Výroba elixírov po 6 kusoch stojí 1 bylinu a 10 Yang. Desať plášťov stojí 1 kožu, 1 esenciu a 20 Yang. Pri základných cenách surovín to znamená 5 Yang za vyrobený elixír a 8 Yang za plášť; priamy nákup stojí približne 8,33 a 10 Yang. Zásoby, dopyt a remeselná prax naďalej ovplyvňujú rozhodnutie.

Trvalé posilnenie v Postave stojí 25 × ďalší stupeň úlomkov, spolu 31 875 za stupne 1–50. Prax schopností a postup M/G/P sú uvedené v [PROGRESSION.md](PROGRESSION.md). Liečivý elixír obnoví vyššiu z hodnôt 65 HP / 25 % maxima. Spoločný cooldown zostáva štyri sekundy.

## Boj, zbierky a uloženie

Pozastavený súboj nemožno využiť na bezpečné pitie alebo odvary; spotrebný predmet v otvorenom paneli vyžaduje ukončený boj. Mimo boja zostáva použitie cez inventár dostupné. Prepnutie postavy zachová zostávajúce cooldowny schopností, základného útoku, plášťa a cestovania.

Úplný prestížny bestiár zahŕňa 25 typov vrátane šiestich bossov nových máp. Odstránené relikvie sa pri načítaní alebo importe jednorazovo prevedú na Yang. Rozhranie receptov používa rovnaké definície ako výroba a bestiár zobrazuje skutočný pancier Metinu.

Lokálne úložisko balí profily a opakujúce sa polia populácií bez straty hodnôt. Neuchováva údaje obyčajnej AI, ktoré sa pri načítaní aj predtým resetovali. Zostávajúce HP, súradnice, smrť, respawn, poškodzujúce stavy, korisť, udalosti a dungeonové útoky sa zachovajú. Záloha je štandardný JSON pôvodného formátu v2; načítajú sa aj pôvodné nezbalené registre.

## Kontroly

`tests/balance-integration.test.cjs` preveruje všetky levely 1–98, všetky bežné mapy, šesť opravených bossov a obnovu poškodených registrov aj záloh, rozdielne miesta vyzdvihnutia úlohy, skutočné popisy receptov, bojové cooldowny a predmety, krivky kováča a uloženie ôsmich preskúmaných postáv. Súboje pokrývajú každú z ôsmich škôl na leveloch 1, 10, 35, 60 a 98 s deterministickou reprezentatívnou výbavou, teda 40 scenárov. Nie sú zárukou rovnakého výsledku pre ľubovoľný build či ľubovoľnú skupinu bossov.

Kontrola v Chromium používa skutočné klávesové ovládanie, offline zostavu, migráciu poškodeného registra, desktopový a mobilný panel a osem postáv s navštívenými mapami, exportom a novým načítaním. Dlhodobý hráčsky test môže ďalej spresniť požadované tempo a náročnosť.

## Kúzla a Metiny od 0.34.0

Metiny majú novú krivku HP podľa [METINS.md](METINS.md). Útočné schopnosti používajú menší vrodený príspevok levelu a STR, 1 bod magickej sily za INT a dvojnásobný príspevok útoku a mágie výbavy vrátane vylepšení. Ich celkový základný koeficient je 0,65; rast stupňa dosiahne 1,875× na P. Podrobné poradie výpočtu je v [COMBAT.md](COMBAT.md). Liečenie, podporné trvania, mana a cooldowny sa nemenia.

Rozdiel levelov hráča a cieľa nemení spôsobené poškodenie. Silnejší gear a jeho vylepšenie preto zachovávajú možnosť rýchlejšie expiť na vyšších cieľoch. Bežné príšery, EXP a loot pooly zostávajú na pôvodných krivkách.

`tests/gear-combat-balance.test.cjs` porovnáva všetkých osem škôl: rovnaké obrany cieľa na rôznych leveloch, rovnaký legálny gear +0/+3/+6/+9, slabú výbavu aj P, skutočné zabitie cieľa o 20 levelov vyššie s odmenou EXP, jed/oheň, odraz, liečenie a podporné trvania. Overuje všetkých 99 levelov Metinov a jednorazový prevod poškodených aj zničených kameňov zo schémy 2. Začiatočnícky Metin zostáva zvládnuteľný s konečnou zásobou elixírov.
