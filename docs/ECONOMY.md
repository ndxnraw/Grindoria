# Ekonomika a NPC trh

Yang je hlavná mena; existujúce uložené `gold` zostáva tým istým počítadlom. Trh otvoríš cez F alebo klik pri NPC v Meste. Obchodník predáva základné zásoby, Zbrojár materiály a vzácnu výbavu. Recepty a vylepšovanie otvára Kováč vlastným výberom služby.

## Ponuka

| NPC | Tovar | Počiatočná cena / zásoba balení |
| --- | --- | --- |
| Obchodník | 3 liečivé elixíry | 25 Yang / 20 |
| Obchodník | 10 plášťov | 100 Yang / 5 |
| Obchodník, Zbrojár | 5 rúd | 100 Yang / 12 u každého |
| Obchodník | 3 kože | 90 Yang / 8 |
| Obchodník | 5 esencií | 150 Yang / 8 |
| Obchodník | 5 bylín | 100 Yang / 10 |
| Obchodník | 3 kováčske prachy | 240 Yang / 5 |
| Zbrojár | 2 kryštály od Lv.20 | 500 Yang / 3 |
| Zbrojár | Kováčske jadro od Lv.35 | 6000 Yang / 1 |
| Zbrojár | 2 kusy vzácnej výbavy | 1 kus každej ponuky |

Vzácna výbava používa rovnaký generátor, modely a bonusy ako korisť. Úroveň predmetu vychádza z úrovne postavy pri vzniku ponuky. Prvá ponuka je Rare; druhá je Rare pod Lv.35, potom Epic. Typ slotu a náhodné bonusy sa vyberajú deterministicky podľa postavy a cyklu. Ponuku nemožno zmeniť opätovným otvorením, načítaním alebo prechodom na inú mapu. Legendary a Mythic sa na trhu nepredávajú.

Nákupná cena výbavy je `ceil(max(1000, trhový odhad × 4) × cenový faktor)`. Pri výrobe nových ponúk sa nespotrebúva náhodný generátor boja ani koristi.

## Dopyt, ceny a obnova

Trh má tri skupiny: zásoby, materiály a výbava. Dopyt každej skupiny je celé číslo od −10 do +10. Nákup pridá 1 bod, predaj výbavy odoberie 1 bod; predaj materiálov odoberie najviac 3 body za transakciu. Nákupy spotrebujú konečné zásoby. Predané veci sa automaticky nevracajú do predajnej ponuky.

Cena používa `clamp(1 + dopyt × 0,04 + trend, 0,65, 1,6)`. Prvý cyklus nemá trend; v ďalších sa pohybuje deterministicky od −10 % do +10 %. Nákupné ceny sa zaokrúhľujú nahor, výkupné nadol. Dopyt sa znižuje predajom, preto opakovaný predaj rovnakého typu zhoršuje výkup.

Obnova nastáva každých 600 sekúnd aktívnej simulácie: doplnia sa zásoby, vznikne nová vzácna ponuka a dopyt sa zníži na polovicu smerom k nule. Otvorené vrstvy čas nezastavia; počas výberu postáv a vypnutej hry čas neplynie. Hodiny zariadenia nemajú na obnovu vplyv. Ponuka a zostávajúci čas sú uložené samostatne pre každú postavu.

## Výkup a význam farmenia

Obaja obchodníci vykupujú výbavu z batohu. Nasadenú výbavu treba najprv zložiť. Základný výkup generovaných predmetov zostáva 25 % odhadu podľa rarity, úrovne, kvality hodov, synergií a vylepšenia. Staré predmety používajú pôvodnú základnú cenu. Na výsledok pôsobí cenový faktor; Zbrojár navyše platí +10 %. Výkup v inventári funguje len v dosahu obchodníka, aktuálna cena je na tlačidle.

Materiály vykupované trhom: ruda, koža, byliny, esencia, prach, kryštál a kováčske jadro. Základný výkup je 25 % jednotkovej základnej nákupnej ceny. Panely umožňujú predať 1 alebo 10 kusov a ukazujú skutočnú cenu.

Kľúče, jadrá trhlín, úlomky trhlín, tréningové pečate, biologické vzorky a knihy sa nedajú kupovať ani premeniť na Yang cez tento trh. Obmedzené zásoby kryštálov a kováčskych jadier dopĺňajú lov; nenahrádzajú dlhodobé farmenie. Bežné nákupy slúžia ako Yang sink. Nákup a okamžitý spätný predaj pri trhových cenách vždy stráca Yang.

## Bezpečnosť a uloženie

`p.economy` obsahuje verziu, aktívny čas, cyklus, dopyt, zásoby obchodníkov a dva snímky vzácnych ponúk. Starým profilom sa doplní počiatočný trh bez zmeny peňazí, inventára či progresie. Export a import zachovávajú celý stav. Validácia odmietne neplatné počty, cykly, dopyt, neznáme ponuky a poškodené predmety.

Pred nákupom sa overí živá postava, NPC, cena, cyklus, úroveň, zásoba, Yang a kapacita. Zastaraná cenová ponuka sa odmietne. Neúspešná transakcia nemení peniaze ani predmety. Výbava sa predáva podľa stabilného UID; rovnaký kus nemožno predať dvakrát. Trh využíva pôvodné zásobníky, generátor predmetov, inventár aj ukladanie.

Pravidlá sú v `data/economy.js`, logika v `systems/economy.js`, panely v `ui/economy.js`. Regresie sú v `tests/economy.test.cjs`. Balans cien a desaťminútovej obnovy treba ďalej vyhodnocovať pri hraní.

## Ceny ikonických zbraní od 0.30.0

FMS: základná cena 3 500 Yang, požadovaný level 30. Jedovatý meč: 35 000 Yang, level 75. Ich výroba stojí 1 500 / 15 000 Yang plus pôvodné suroviny. Ceny bežnej náhodnej výbavy a trhový dopyt zostávajú odvodené od generátora. Bežné zlato z nepriateľa používa jeho skutočný level: `round((8 + 1,2 × level) × násobok bossa/variantu/obrancu)`, nie skrytý násobok mapy.
