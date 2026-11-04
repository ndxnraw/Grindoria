# Vizuálna identita predmetov

Od 0.15.0 zdieľajú ikony, korisť na zemi, portrét a postava rovnakú vektorovú geometriu. Hra používa existujúci Canvas 2D systém.

## Katalóg

Desať slotov má po tri odlišné siluety podľa rodiny existujúcich názvov. Deväť ďalších modelov tvorí tri varianty dvojdýk, lukov a vejárov; spolu 39 základných modelov. Päť samostatných modelov klasických zbraní rozširuje katalóg na 44; definície a získavanie sú v [ITEM_MODEL.md](ITEM_MODEL.md). Nové zbrane dostávajú typ podľa povolania a školy bez zmeny bojových pravidiel. Staré zbrane ostávajú mečmi.

Úroveň 1–99 mení kovanie v piatich stupňoch. Základný bonus pridáva rytiny. Vylepšenia +1 až +9 pridávajú kamene; od +6 aj svetelný lem vo svete. Identické kópie majú rovnaký vzhľad, nezávislý od ID, inventárnej pozície alebo opätovného načítania.

## Vrstvy postavy

Brnenie prekrýva trup, prilba hlavu, čižmy sledujú kroky. Štít je na vedľajšej ruke, zbraň sleduje smer a animáciu útoku v hlavnej ruke. Náramok, náhrdelník, náušnice, opasok a talizman majú vlastné ukotvenie. Malé šperky majú vo svete prirodzene menšiu veľkosť; detail vidno v portréte a inventári. Zmena vybavenia sa prejaví okamžite.

## Pridanie modelu

Geometria patrí do src/js/data/equipment-models.js. registerEquipmentModel(slot, id, geometry) registruje funkciu geometry(look), ktorá vracia časti cez modelPath(svgPath, fill, stroke, width). Priestor je 64 × 64, pri zbrani a talizmane 64 × 96.

Predmet môže uviesť voliteľné modelId existujúceho modelu pre svoj slot. Geometria sa nikdy neimportuje zo zálohy. weaponKind podporuje sword, daggers, bow a fan. Nový slot vyžaduje aj EQUIPMENT, WORN_EQUIPMENT a PORTRAIT_EQUIPMENT.

Resolver src/js/systems/appearance.js tvorí stabilný kľúč; SVG aj Canvas Path2D používajú rovnaké časti. Cache modelov a ikon má limit 256, cache ciest 4096. Kľúč koristi zahŕňa celý vzhľad.

Staré predmety nepotrebujú prepis: chýbajúci typ zbrane znamená pôvodný meč, model sa odvodí zo slotu a rarity. Štatistiky, ID aj inventár sa zachovajú. Import odmietne neznámy model a neplatný typ zbrane.

## Overenie

Osem testov v tests/appearance.test.cjs kontroluje odlišnosť siluet, všetky vrstvy postavy, okamžité nasadenie a odloženie, rovnaké cesty v Canvas a SVG, smerovanie, staré profily, generované zbrane, bezpečné rozšírenie registra a cache aktívnych predmetov.

Od 0.16.0 má šesť rarít vlastné materiály a farby. Uncommon pridáva zelené kovanie, Legendary zlaté a Mythic ružové koruny a runy. Náhodné bonusy majú vlastné drobné runové značky. Pozri [RARITIES.md](RARITIES.md).
