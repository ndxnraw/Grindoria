# Dlhodobá progresia

Panel **Progres (P)** spája deväť ciest rozvoja. Všetky sú funkčné v sólo offline hre; priebežne sa ukladajú do existujúceho uloženého postupu. Nevyžadujú účet ani reálny denný časovač.

## EXP a levelovanie

Základné EXP bežného nepriateľa úrovne L sú `max(6, floor(6 × L^1.15))`. Ďalší level stojí `ceil(základné EXP × (24 + 1,6 × L))`.

| Úroveň | Potrebné EXP | EXP za rovnaký bežný cieľ | Takéto zabitia na ďalší level |
|---|---:|---:|---:|
| 1 | 154 | 6 | 26 |
| 5 | 1 216 | 38 | 32 |
| 10 | 3 360 | 84 | 40 |
| 20 | 10 528 | 188 | 56 |
| 35 | 28 560 | 357 | 80 |
| 60 | 79 800 | 665 | 120 |
| 98 | 211 356 | 1 169 | 181 |

Silnejší cieľ dáva najviac +50 % za rozdiel úrovní; slabší postupne menej a od rozdielu 8 nedáva EXP. Násobky: Metin 3×, boss 12×, elita 1,8×, vzácny variant 3,2×, obranca Metinu navyše 0,35×. Limit odmeny z jedného cieľa je 6 % potrebných EXP pri bežnej príšere, 8 % pri elite, 12 % pri vzácnej príšere alebo Metine a 35 % pri bossovi. Plošné útoky a varianty preto zrýchľujú reálne tempo oproti tabuľke.

Maximum je 99. Nový level dáva tri body atribútov a obnoví zdravie aj manu. Opakovateľný lov dáva Yang a pečať bez dodatočných EXP. Jednorazové úlohy naďalej dávajú 60 a 80 EXP; odmena Prvého strážcu má pevnú úroveň 8 bez ohľadu na miesto vyzdvihnutia.

Staré profily zachovajú level a pomer EXP k ďalšiemu levelu; migrácia sa vykoná raz. Nepripisuje spätne levely. Úrovne máp, sila protivníkov a testovanie sú v [BALANCE.md](BALANCE.md).

## Paralelné cesty

| Systém | Čo farmiť | Výsledok |
| --- | --- | --- |
| Level | Primeraných a silnejších protivníkov | Body vlastností, zdravie a mana |
| Tréning atribútov | Pečate z každého piateho primeraného zabitia, zlato | Až 20 dodatočných bodov každého atribútu bez zvýšenia levelu |
| Schopnosti | Zabitia po zásahu kúzlom alebo pri aktívnej aure, knihy z kameňov/bossov | Stupne 1–20, silnejšie útoky/liečenie alebo dlhšie aury a kratšia obnova |
| Biológ | Vzorky konkrétnych máp a primerané zabitia medzi odovzdaniami | Štyri trvalé bonusy za dokončený výskum |
| Vybavenie | Predmety zo silnejších nepriateľov, rudu, zlato a od +4 kamene vylepšenia | Bonus podľa sily zdroja a vylepšenie konkrétneho predmetu až na +9 |
| Alchýmia | Esenciu, rudu, prach a zlato | Tri súčasne aktívne kamene, výrobu a fúziu až na stupeň 5 |
| Relikvie | Bossov štyroch oblastí | Unikátne bonusy a setové odmeny; duplikáty sú prach |
| Špecializácia | Body za primeraných bossov a každé tri vylepšenia schopností | Trvalú voľbu z troch smerov, každý do stupňa 10 |
| Endgame | Kľúče z bossov a silnejúce expedície | Až 100 stupňov trhlín, úlomky a relikviár do stupňa 50 |

Primeraný cieľ je najviac o 5 úrovní slabší než hráč. Len taký poskytuje prax, esenciu, rudu, tréningové pečate, knihy a špecializačné body. Biologické vzorky, vzácne relikvie a kľúče zostávajú dostupné aj pri návrate do slabších oblastí, ale nedávajú náhradné EXP.

### Schopnosti

Každé kúzlo má vlastnú uloženú prax a stupeň. Jedna príšera poskytne prax danej schopnosti najviac raz, až po porážke; kúzlenie do prázdna ani opakovanie zásahov nepridáva ďalšiu prax. Boss dáva 4 jednotky praxe. Liečivé a podporné schopnosti môžu označiť blízkeho protivníka; aktivovaná aura sa započíta pri primeranom zabití.

Štúdium vyžaduje `ceil(10 × rank^1.15)` praxe, `ceil(rank/3)` kníh a `25 × rank²` zlata. Každý stupeň pridáva 4 % sily útočných/liečivých kúziel alebo trvania aury a skracuje obnovu o 1 %. Stupeň 10 je Majster, 20 Veľmajster. Odmeny sa nedajú opakovane získať zabitím už mŕtveho nepriateľa.

### Biologický výskum

Základná vzorka padá z každej 4., 6., 8. alebo 10. príšery podľa mapy. Biológ v Meste prijme jednu vzorku a poplatok naraz; ďalšie odovzdanie vyžaduje 10 nových primeraných zabití. Osem výskumov sa dokončuje postupne; pokročilé etapy Lv.40–85 pridávajú vzácne vzorky a časové intervaly 5–30 minút. Podrobné zdroje, šance, ceny a bonusy: [BIOLOGY.md](BIOLOGY.md). Pôvodné odmeny:

- Údolie, úroveň 1+: 10 vzoriek, +30 zdravie.
- Púšť, úroveň 5+: 12 vzoriek, +6 útok.
- Hory, úroveň 12+: 15 vzoriek, +5 obrana.
- Chrám, úroveň 25+: 20 vzoriek, +4 % kritický zásah a +30 mana.

### Výbava a alchýmia

Kováč v Meste vylepšuje nasadenú výbavu +0 až +9. Náklady rastú, neúspech môže znížiť stupeň alebo zničiť predmet; pomôcky menia šancu a ochranu. Tabuľky a ceny: [FORGE.md](FORGE.md). Bonus aj stupeň zostávajú s predmetom pri výmene.

Základný alchymistický kameň stojí 30 esencie, 3 rudy a 100 zlata. Prvý sa nasadí zo zásoby; ďalšia fúzia potrebuje `2^rank` základných kameňov, `5 × rank` prachu a `100 × rank²` zlata. Rubín pridáva útok, zafír manu a silu kúziel, jadeit zdravie a obranu.

### Relikvie a špecializácia

Boss má 8 % šancu na relikviu svojej mapy; najneskôr desiaty boss od posledného dropu ju zaručí. Duplikát pridá 10 prachu a neopakuje trvalý bonus. Dve rôzne relikvie poskytujú navyše +2 obranu; všetky štyri navyše +8 útok a +15 zdravie.

Od úrovne 10 a za 3 špecializačné body si hráč vedome zvolí trvalú cestu: Ničiteľ (útok/kritické zásahy), Ochranca (zdravie/obrana) alebo Mystik (sila kúziel/mana). Voľba sa v tejto verzii nedá resetovať. Ďalší stupeň stojí `rank+1` bodov.

### Trhliny

Vstup od úrovne 35 mimo boja stojí 3 kľúče; každý tretí boss zanechá kľúč. Expedícia používa oddelený stav chrámu. Treba poraziť 20 príšer a jedného bossa; odmena je `10 + tier × 3` úlomkov a odomknutie ďalšieho stupňa. Počas expedície sa nedá normálne cestovať; opustenie ju ukončí bez odmeny a bez vrátenia kľúčov.

Stupeň zvyšuje životy, poškodenie aj úroveň nepriateľov. Aktívna expedícia prežije uloženie a načítanie; po ukončení sa obnoví pôvodný stav bežného chrámu. Relikviár stojí `25 × nextRank` úlomkov a pridáva trvalo +2 útok a +5 zdravie za stupeň.

## Migrácia a limity overenia

Postup používa kľúč `grindoria-save-v1`. Pri prvom načítaní nového systému sa zachová level a percentuálny postup k ďalšiemu. Staré globálne kováčske bonusy sa prevedú na aktuálne nasadenú zbraň bez straty ich hodnoty. Uložené mapy dostanú nové úrovne a silu nepriateľov pri zachovaní pomeru životov a časovačov.

Automatické testy overujú krivku, ochranu pred opakovanými odmenami, zdroje a ceny jednotlivých ciest, skutočný účinok bonusov, migráciu a expedície. Čísla sú východiskové nastavenie pre dlhodobé farmenie; tempo celej ekonomiky ešte vyžaduje dlhšie hranie a spätnú väzbu. Hra je lokálna a uložený súbor si hráč môže upraviť; nejde o serverovú ochranu proti podvádzaniu.

## Boj od 0.10.0

Školy majú pasívne stupne na úrovniach 10, 25, 50 a 75. Nevyžadujú knihy ani aktívne body; prax a knihy naďalej zvyšujú aktívne schopnosti. Výbava môže dopĺňať typové odolnosti a kritický zásah. Pozri [COMBAT.md](COMBAT.md).

## Prestíž po úrovni 99

Prestíž I–V zachová level aj výbavu a odomkne nové výzvy, pasívy, odmeny a zdokonaľovanie Mythic bonusov. Podmienky, zdroje znakov, bestiár a endgame ciele: [PRESTIGE.md](PRESTIGE.md).
