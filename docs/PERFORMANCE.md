# Výkon

## Aktualizácia a renderovanie

- Vzdialené zdravé neaktívne príšery mimo dohľadu a ďalej než 1 200 jednotiek plánujú potulovanie po 0,2 s. Práca je rozložená do 12 fáz a zahŕňa skutočný uplynutý čas.
- Označený cieľ, aggro, návrat domov, zranenie, stun, slow, DOT, posily Metinu a dungeonové príšery zostávajú v plnej frekvencii. Cooldowny, respawn, efekty, bossovia, hráč, strely a útoky sa aktualizujú každý herný snímok.
- Mriežka lokálnej separácie znovu používa svoje bunky. Index spawnovacích bodov a mapy väzieb Metin–posily odstraňujú opakované lineárne hľadanie pri respawnoch a obnove vĺn.
- Neviditeľné príšery a dekorácie sa vyradia pred triedením podľa hĺbky. Poradie viditeľných objektov zostáva zachované; front a záznamy sa znovu používajú.
- Ustálená korisť používa cached vzhľad. SVG sa raz rastruje na bitmapu 64 × 96, ak je dostupný OffscreenCanvas; ostatné prehliadače použijú existujúci SVG obrázok. Cache drží najviac 256 ikon a za snímok vznikne najviac 8 nových obrázkov a 8 bitmáp.
- Korisť ďalej než 360 jednotiek má farebnú značku rarity. V blízkosti alebo pod kurzorom sa zobrazí jej vlastná ikona. Tooltipy, názvy, zbieranie, dosahy a expirácie zostávajú rovnaké.
- Expirácia veľkého množstva dropov a odobratie automatických zásob používajú lineárnu kompakciu v pôvodnom poradí.
- Výber najbližšieho cieľa a zásah kurzorom používajú jeden priechod bez triedenia. Zhody vzdialeností aj prekrývanie zachovávajú pôvodné poradie.
- Statický HUD úloh sa neprestavuje opakovane; rovnaké maximá HP/MP sa v jednom obnovení nevypočítavajú viackrát. Výber postavy a skutočne pozastavená simulácia vykresľujú pozadie najviac 10-krát za sekundu; aktívna hra vrátane otvorených vrstiev každý snímok.

Nastavenia výkonu sú v systems/performance.js. Cache a plánovače sú prechodné; neukladajú sa do postáv ani mapových snímok a nevyžadujú migráciu. Mapové načítanie vyčistí AI cache. Mechanické limity populácie, loot, odmeny, šance, cooldowny, AI aggro a uložený progres sa nemenia.

## Opakovateľné meranie

Node.js 22+, bez balíčkov:

```sh
node scripts/benchmark.mjs
node scripts/benchmark-browser.mjs cesta-k-povodnej-Grindoria.html
```

CPU harness používa 1 000 nepriateľov, 5 000 dropov, 30 zahrievacích snímkov a päť meraných dávok. Výsledkom je medián priemerného času snímku v dávke. Canvas a Image sú náhrady bez grafického backendu; toto číslo **nie je FPS** a nemeria layout, dekódovanie SVG ani GPU.

Prehliadač: otvor http://127.0.0.1:4174/before a potom /after. Server poskytuje dodanú pôvodnú HTML zostavu a aktuálny dist. Každá meria 30 zahrievacích a 180 meraných snímkov pri rovnakých 1 000 príšerách a 5 000 predmetoch. Meranie beží na samostatnom porte s vlastným úložiskom; nezasahuje do uložených postáv bežného náhľadu. Testovací kód nie je súčasťou dist. Server zastaví Ctrl+C.

## Výsledky 4. 11. 2026

Porovnanie 0.26.0 a 0.27.0 na tom istom Windows prostredí, Node 24.22.1:

| CPU scenár | Pred (ms) | Po (ms) |
|---|---:|---:|
| AI: 1000 neutral enemies | 2.673 | 2.394 |
| Metins: 100 parents / 300 guards | 0.067 | 0.034 |
| Ground loot: 5000 items | 36.865 | 1.778 |
| Scene: 1000 enemies | 4.948 | 3.341 |
| Full update: 1000 enemies / 5000 items | 7.278 | 3.387 |

Reálny in-app prehliadač, viewport hry 1161,8 × 548, DPR 1, rovnaká záťaž:

| Metrika | 0.26.0 | 0.27.0 |
|---|---:|---:|
| Priemerné FPS | 15,2 | 57,2 |
| Medián CPU snímku | 15,4 ms | 3,8 ms |
| 95. percentil CPU | 21,8 ms | 4,7 ms |
| 95. percentil intervalu snímkov | 76,4 ms | 20,9 ms |

Ide o konkrétne lokálne meranie, nie záruku FPS na každom zariadení. Závisí aj od rozlíšenia, DPR, prehliadača, GPU a ostatných aplikácií. Extrémny scenár zámerne prekračuje bežné množstvo koristi pri normálnych dropoch a expirácii.

## Regresie

tests/performance.test.cjs overuje 16 scenárov: poradie cieľov a scény, časovanie vzdialenej AI, okamžité prebudenie pri boji, respawn, obnovu indexov máp, limity a invalidáciu cache, rasterizáciu, detail koristi, hromadnú expiráciu, hit-test počas pádu, frekvenciu menu a neprítomnosť cache v uložených dátach. Celá sada: 332 testov.
