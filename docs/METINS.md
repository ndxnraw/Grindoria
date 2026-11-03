# Metiny a Šuterland

## Typy a úrovne

Grindoria má osem pôvodných vektorových modelov Metinov: prasknutý obelisk, dvojicu klov, stupňovitú pyramídu s okom, ľadové kryštály, sopečný kameň, rozštiepené búrkové piliere, levitujúci kryštál a korunu skazy. Každý model má vlastnú siluetu, farby a efekty. Názov, úroveň a obtiažnosť sú viditeľné nad kameňom; pri boji sa zobrazí zdravie, odolnosť a čas ďalšej vlny.

| Typ | Úrovne v Šuterlande | Obtiažnosť | Obrancovia vo vlne | Interval |
| --- | --- | --- | ---: | ---: |
| Metin praskliny | 1–9 | Ľahký | 2 | 4,8 s |
| Metin šeliem | 10–19 | Ľahký | 2 | 4,4 s |
| Metin púšte | 20–34 | Stredný | 3 | 4 s |
| Metin mrazu | 35–49 | Stredný | 3 | 3,6 s |
| Metin plameňa | 50–64 | Ťažký | 4 | 3,2 s |
| Metin búrky | 65–79 | Ťažký | 4 | 2,9 s |
| Metin prázdnoty | 80–94 | Veľmi ťažký | 5 | 2,6 s |
| Metin skazy | 95–99 | Legendárny | 5 | 2,3 s |

Štyri pôvodné bojové mapy si ponechávajú osem kameňov na mapu. Údolie používa prasklinu a šelmy, púšť pieskový typ a šelmy, hory mráz a búrku, chrám plameň a prázdnotu. Ich úrovne naďalej vychádzajú z miestnej oblasti. Rozsahy v tabuľke určujú rozdelenie typov v Šuterlande, neobmedzujú miestne varianty na ostatných mapách.

## Šuterland

Mapa je dostupná cez **M → Šuterland** z útočiska. Má **99 Metinov, presne jeden pre každú úroveň 1 až 99**. Nemá bežné voľne spawnované príšery ani bossa. Obrancovia sa objavia počas útoku na Metin. Stred zostáva chráneným útočiskom s cestovaním a obchodníkom.

- Južné loviská: úrovne 1–25.
- Východné tábory: 26–50.
- Severné hliadky: 51–75.
- Územie strážcu: 76–99.

Všetky kamene sú mimo útočiska. Obnovujú sa po 18 sekundách aktívnej simulácie mapy a zachovávajú svoj typ aj úroveň. Neaktívna mapa ich časovače pozastaví.

## Životy a odolnosť

Pri úrovni L a koeficiente typu H:

- Zdravie = zaokrúhlenie((180 + 28 × L + 0,6 × L²) × H).
- Pancier = podlaha(0,3 × L + 20 × A).
- Odolnosť = minimum(50 %, 4 % + 0,25 % × L + A), kde A je typový príspevok v rozsahu 0 až 11 %.
- Skutočné poškodenie = maximum(1, zaokrúhlenie(maximum(1, vstupné poškodenie − pancier) × (1 − odolnosť))).

Typový násobok zdravia rastie od 1 pri praskline po 1,8 pri skaze. Zvyšujúca sa úroveň a vyššie typy teda vyžadujú lepšiu výbavu aj dlhší boj. Odolnosť platí pre priame aj priebežné poškodenie; Sura sa lieči iba zo skutočne spôsobeného poškodenia. Trhliny navyše používajú existujúce škálovanie výprav a obranu podľa výslednej úrovne.

## Obrancovia

Úspešný zásah aktivuje Metin na šesť sekúnd; každý ďalší zásah tento čas obnoví. Prvá vlna príde po 0,2 sekundy, ďalšie podľa tabuľky. Vlny sa prerušia pri zničení kameňa, uplynutí boja, pobyte hráča v útočisku, maskovaní alebo vzdialení nad 850 jednotiek. Pauza zastaví simuláciu.

| Úroveň Metinu | Typ obrancov |
| --- | --- |
| 1–14 | Metinoví vlci |
| 15–34 | Pieskoví obrancovia – škorpióny |
| 35–59 | Ľadoví obrancovia – yeti |
| 60+ | Démonickí obrancovia |

Úroveň každého obrancu je najviac o jednu nižšia alebo vyššia než Metin. Jeho sila vychádza z tejto úrovne aj v Šuterlande. Obrancovia sa hneď zamerajú na hráča a pri aktívnom boji ho prenasledujú. Bežné pasívne skupiny príšer si zachovávajú pôvodné pravidlá aggra.

Limity sú **8 živých obrancov na jednu generáciu kameňa a 60 na mape**. Zabité posily sa samostatne neobnovujú; ďalšie vytvorí iba nová vlna. Neporažené posily po 45 sekundách aktívneho času zmiznú bez odmeny. Už privolaní obrancovia môžu dokončiť boj aj po rozbití kameňa. Poskytujú 35 % bežných EXP pri rovnakej úrovni a upravené zlato, aby neobchádzali pomalú progresiu.

## Vlastné loot pooly

Každý typ má samostatné šance, množstvá, výber slotov výbavy, doplnkový materiál a vzácnu relikviu. Hodnoty sú v definícii dát a aj priamo v hre: **M → Atlas Metinov**. Každá kategória sa losuje samostatne. Yang padá vždy; ostatné odmeny iba z primeraného Metinu, najviac päť úrovní pod postavou.

V bunkách materiálov je šanca / počet kusov. Množstvo Yang = základ z tabuľky × (1 + 0,12 × úroveň), zaokrúhlené. Yang používa rovnakú peňaženku ako zlato.

| Typ | Yang – základ | Ruda | Knihy | Esencia | Prach | Kamene vylepšenia | Výbava | Podiel prémiovej tabuľky | Relikvia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Metin praskliny | 18–32 | 100 % / 1–2 | 35 % / 1–1 | 55 % / 1–3 | 20 % / 1–2 | 5 % / 1–1 | 45 % | 2,5 % | 1,5 % |
| Metin šeliem | 25–42 | 85 % / 2–3 | 42 % / 1–1 | 60 % / 2–4 | 25 % / 1–2 | 8 % / 1–1 | 50 % | 4 % | 2 % |
| Metin púšte | 40–65 | 90 % / 2–4 | 48 % / 1–2 | 70 % / 2–5 | 35 % / 2–3 | 12 % / 1–1 | 55 % | 6 % | 2,5 % |
| Metin mrazu | 65–95 | 92 % / 3–5 | 55 % / 1–2 | 75 % / 3–6 | 50 % / 2–4 | 16 % / 1–2 | 60 % | 8 % | 3,5 % |
| Metin plameňa | 95–145 | 95 % / 3–6 | 60 % / 1–3 | 80 % / 4–7 | 58 % / 3–5 | 20 % / 1–2 | 65 % | 11 % | 4,5 % |
| Metin búrky | 140–210 | 96 % / 4–7 | 66 % / 2–3 | 85 % / 4–8 | 65 % / 3–6 | 25 % / 1–3 | 70 % | 14 % | 5,5 % |
| Metin prázdnoty | 200–290 | 98 % / 5–8 | 72 % / 2–4 | 90 % / 5–10 | 75 % / 4–8 | 30 % / 2–3 | 78 % | 20 % | 7 % |
| Metin skazy | 280–420 | 100 % / 6–10 | 80 % / 3–5 | 95 % / 6–12 | 85 % / 5–10 | 40 % / 2–4 | 90 % | 30 % | 10 % |

Relikvie využívajú existujúcu trvalú zbierku; opakovaný exemplár sa po zdvihnutí spracuje podľa pravidiel zbierky. Typy navyše môžu poskytnúť vlčie tkanivo, tréningové pečate, vak jedu, ľadové jadro, démonický popol, úlomky relikvie alebo kľúče. Presný výber a šance ukazuje Atlas.

**Kamene vylepšenia** sú nová stackovateľná zásoba s vlastnou ikonou. Kováč ich od stupňa +4 vyžaduje spolu s rudou a zlatom. Počet pri cieľovom stupni R je strop((R − 3) / 2): +4 a +5 stoja jeden kameň, +6 a +7 dva, +8 a +9 tri.

Yang a zásoby sa pripíšu priamo. Výbava a relikvie dopadnú na zem a zbierajú sa pomocou Y alebo kliknutia podľa [LOOT.md](LOOT.md). Zničenie jednej identity kameňa poskytne odmeny iba raz.

## Uloženie a migrácia

Staré kamene získajú typ, nový maximálny počet životov a odolnosť pri zachovaní pomeru zostávajúceho zdravia, smrti a času do respawnu. Existujúca korisť a ostatní nepriatelia sa nemnožia. Nový počítadlový materiál sa doplní nulou bez resetu kariéry alebo EXP.

Aktuálne Metiny ukladajú stav boja, interval vlny, generáciu, poradové číslo posily, typ a zdravie. Privolaní obrancovia ukladajú zostávajúci životný čas a príslušnosť ku kameňu. Načítanie nevytvára druhé kópie posíl. Staršie rozbehnuté riedke trhliny si zachovávajú populáciu do konca výpravy.

Zdrojom nastavení je src/js/data/metins.js, logikou src/js/systems/metins.js, modelmi src/js/render/metins.js a herným Atlasom src/js/ui/metins.js.

## Boj od 0.10.0

Po pancieri a základnej odolnosti sa uplatní typová odolnosť alebo slabina. Osem profilov definuje METIN_RESISTS; Atlas aj panel označeného cieľa ich zobrazujú. Napríklad mráz dostáva o 20 % viac ohnivého poškodenia, žeravý Metin má 50 % odolnosť voči ohňu. Pozri [COMBAT.md](COMBAT.md).

## Náhodné rozmiestnenie od 0.11.0

Šuterland zachováva 99 identít a úrovne 1–99 v štyroch oblastiach. Súradnice vznikajú náhodným vzorkovaním s rozostupom približne 90 jednotiek, bez mriežky. Pôvodné mapy používajú rovnaký princíp pre svoje kamene aj skupiny. Pri respawne sa Metin premiestni vo svojej oblasti; typ, level a identita zostávajú zachované. Staré snímky sa prenesú bez oživenia mŕtvych alebo vytvorenia duplicitnej koristi.

Od 0.16.0 stĺpec prémiovej tabuľky určuje miešanie šiestich rarít, nie výslednú šancu Epic. Reálne šance zobrazuje Atlas; podrobnosti sú v [RARITIES.md](RARITIES.md).
