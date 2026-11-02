# Dlhodobá progresia

Panel **Progres (P)** spája deväť ciest rozvoja. Všetky sú funkčné v sólo offline hre; priebežne sa ukladajú do existujúceho uloženého postupu. Nevyžadujú účet ani reálny denný časovač.

## EXP a levelovanie

Prechod z úrovne `L` na `L+1` vyžaduje:

```text
ceil(600 × L^2.15 × (1 + 0.025 × (L − 1)))
```

Základná odmena bežného nepriateľa je `floor(6 × enemyLevel^1.15)`, upravená rozdielom úrovní. Kamene majú násobok 3, bossovia 12. Celková odmena za jeden cieľ je obmedzená na 3 % aktuálne potrebných EXP pri príšere, 12 % pri kameni a 35 % pri bossovi. Silný boss preto nemôže preskočiť niekoľko levelov naraz.

| Aktuálna úroveň | Potrebné EXP na ďalší level | EXP za rovnako silnú bežnú príšeru | Zabitia pri tejto odmene |
| --- | ---: | ---: | ---: |
| 1 | 600 | 6 | 100 |
| 5 | 21 006 | 38 | 553 |
| 10 | 103 822 | 84 | 1 236 |
| 20 | 554 828 | 188 | 2 952 |
| 35 | 2 317 765 | 357 | 6 493 |
| 60 | 9 879 880 | 665 | 14 857 |
| 98 | 39 259 783 | 1 169 | 33 585 |

Tabuľka je matematický porovnávací príklad, nie odhad hodín hrania. Skutočné tempo ovplyvňuje zloženie nepriateľov, bossovia, výbava a plošné schopnosti. Od verzie 0.5 má údolie štyri oblasti bežných príšer úrovní 1–9; elitné a vzácne varianty môžu byť ešte silnejšie. Ich EXP násobky nemenia uvedené percentuálne limity ani odmenu za príliš slabé ciele. Podrobnosti sú v [FARMING.md](FARMING.md).

Slabší protivníci majú postupne nižšiu odmenu; pri rozdiele 8 levelov neposkytujú EXP. Silnejší cieľ môže dať najviac 50 % relatívny bonus pred uplatnením uvedeného limitu. Životy a poškodenie protivníkov rastú podľa mapy aj ich úrovne.

Maximum je 99. Nový level dáva 3 body vlastností, vyššie maximálne zdravie a manu, obnoví obe hodnoty a zobrazí odmenu. Základný útok z levelu rastie pomalšie než v prototype. Opakovateľný lov poskytuje zlato a tréningovú pečať, nie EXP; nemôže obísť penalizáciu slabých cieľov. Prvé príbehové odmeny sú jednorazové a znížené na 60 a 80 EXP.

## Paralelné cesty

| Systém | Čo farmiť | Výsledok |
| --- | --- | --- |
| Level | Primeraných a silnejších protivníkov | Body vlastností, zdravie a mana |
| Tréning atribútov | Pečate z každého piateho primeraného zabitia, zlato | Až 20 dodatočných bodov každého atribútu bez zvýšenia levelu |
| Schopnosti | Zabitia po zásahu kúzlom alebo pri aktívnej aure, knihy z kameňov/bossov | Stupne 1–20, silnejšie útoky/liečenie alebo dlhšie aury a kratšia obnova |
| Biológ | Vzorky konkrétnych máp a primerané zabitia medzi odovzdaniami | Štyri trvalé bonusy za dokončený výskum |
| Vybavenie | Predmety zo silnejších nepriateľov, rudu a zlato | Bonus podľa sily zdroja a vylepšenie konkrétneho predmetu až na +9 |
| Alchýmia | Esenciu, rudu, prach a zlato | Tri súčasne aktívne kamene, výrobu a fúziu až na stupeň 5 |
| Relikvie | Bossov štyroch oblastí | Unikátne bonusy a setové odmeny; duplikáty sú prach |
| Špecializácia | Body za primeraných bossov a každé tri vylepšenia schopností | Trvalú voľbu z troch smerov, každý do stupňa 10 |
| Endgame | Kľúče z bossov a silnejúce expedície | Až 100 stupňov trhlín, úlomky a relikviár do stupňa 50 |

Primeraný cieľ je najviac o 5 úrovní slabší než hráč. Len taký poskytuje prax, esenciu, rudu, tréningové pečate, knihy a špecializačné body. Biologické vzorky, vzácne relikvie a kľúče zostávajú dostupné aj pri návrate do slabších oblastí, ale nedávajú náhradné EXP.

### Schopnosti

Každé kúzlo má vlastnú uloženú prax a stupeň. Jedna príšera poskytne prax danej schopnosti najviac raz, až po porážke; kúzlenie do prázdna ani opakovanie zásahov nepridáva ďalšiu prax. Boss dáva 4 jednotky praxe. Liečivé a podporné schopnosti môžu označiť blízkeho protivníka; aktivovaná aura sa započíta pri primeranom zabití.

Štúdium vyžaduje `ceil(20 × rank^1.4)` praxe, `ceil(rank/3)` kníh a `25 × rank²` zlata. Každý stupeň pridáva 4 % sily útočných/liečivých kúziel alebo trvania aury a skracuje obnovu o 1 %. Stupeň 10 je Majster, 20 Veľmajster. Odmeny sa nedajú opakovane získať zabitím už mŕtveho nepriateľa.

### Biologický výskum

Vzorka padá z každého štvrtého bežného nepriateľa danej mapy. Biológ v útočisku prijme jednu vzorku a poplatok naraz; ďalšie odovzdanie vyžaduje 10 nových primeraných zabití. Výskumy sa dokončujú postupne:

- Údolie, úroveň 1+: 10 vzoriek, +30 zdravie.
- Púšť, úroveň 5+: 12 vzoriek, +6 útok.
- Hory, úroveň 12+: 15 vzoriek, +5 obrana.
- Chrám, úroveň 25+: 20 vzoriek, +4 % kritický zásah a +30 mana.

### Výbava a alchýmia

Vylepšenie predmetu je spoľahlivé a stojí `2 × nextRank²` rudy a `100 × nextRank²` zlata. Pridáva +3 útok alebo obranu za stupeň. Bonus zostáva s predmetom pri jeho výmene.

Základný alchymistický kameň stojí 30 esencie, 3 rudy a 100 zlata. Prvý sa nasadí zo zásoby; ďalšia fúzia potrebuje `2^rank` základných kameňov, `5 × rank` prachu a `100 × rank²` zlata. Rubín pridáva útok, zafír manu a silu kúziel, jadeit zdravie a obranu.

### Relikvie a špecializácia

Boss má 8 % šancu na relikviu svojej mapy; najneskôr desiaty boss od posledného dropu ju zaručí. Duplikát pridá 10 prachu a neopakuje trvalý bonus. Dve rôzne relikvie poskytujú navyše +2 obranu; všetky štyri navyše +8 útok a +15 zdravie.

Od úrovne 10 a za 3 špecializačné body si hráč vedome zvolí trvalú cestu: Ničiteľ (útok/kritické zásahy), Ochranca (zdravie/obrana) alebo Mystik (sila kúziel/mana). Voľba sa v tejto verzii nedá resetovať. Ďalší stupeň stojí `rank+1` bodov.

### Trhliny

Vstup od úrovne 35 v útočisku stojí 3 kľúče; každý tretí boss zanechá kľúč. Expedícia používa oddelený stav chrámu. Treba poraziť 20 príšer a jedného bossa; odmena je `10 + tier × 3` úlomkov a odomknutie ďalšieho stupňa. Počas expedície sa nedá normálne cestovať; opustenie ju ukončí bez odmeny a bez vrátenia kľúčov.

Stupeň zvyšuje životy, poškodenie aj úroveň nepriateľov. Aktívna expedícia prežije uloženie a načítanie; po ukončení sa obnoví pôvodný stav bežného chrámu. Relikviár stojí `25 × nextRank²` úlomkov a pridáva trvalo +2 útok a +5 zdravie za stupeň.

## Migrácia a limity overenia

Postup používa kľúč `grindoria-save-v1`. Pri prvom načítaní nového systému sa zachová level a percentuálny postup k ďalšiemu. Staré globálne kováčske bonusy sa prevedú na aktuálne nasadenú zbraň bez straty ich hodnoty. Uložené mapy dostanú nové úrovne a silu nepriateľov pri zachovaní pomeru životov a časovačov.

Automatické testy overujú krivku, ochranu pred opakovanými odmenami, zdroje a ceny jednotlivých ciest, skutočný účinok bonusov, migráciu a expedície. Čísla sú východiskové nastavenie pre dlhodobé farmenie; tempo celej ekonomiky ešte vyžaduje dlhšie hranie a spätnú väzbu. Hra je lokálna a uložený súbor si hráč môže upraviť; nejde o serverovú ochranu proti podvádzaniu.
