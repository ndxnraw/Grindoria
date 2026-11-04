# Predmety a loot pooly

## Spoločný model

Definície sú v src/js/data/item-catalog.js; rozhranie v systems/item-model.js. Nevzniká druhý inventár ani nový účet.

Výbava obsahuje itemSchema, instanceId (globálne ID kusu), uid (existujúci číselný odkaz inventára), definitionId, type, slot, rarity, tier, requiredLevel, bonus, baseStats, stats, affixes a modelId. Každé generovanie prideľuje nové ID. Presun medzi zemou, inventárom, výbavou a obchodom ID zachová; cloneItem vytvára nezávislú dátovú snímku rovnakého kusu.

createItem(definitionId, options) vytvorí kus cez existujúci generátor rarít a náhodných bonusov. Generická výbava zostáva kompatibilná. baseStats sú pevné bonusy typu, stats sú náhodné bonusy. itemBonuses ich započíta spolu s hlavným atribútom a vylepšením do skutočného boja.

Zásoby zostávajú v pôvodných počítadlách materiálov, elixírov, alchýmie a kameňov. stackItemView vracia spoločný pohľad s definíciou, typom, raritou, modelom a identitou zásobníka postavy. Jednotlivé jednotky stacku nemajú umelé samostatné ID. Fyzický drop má navyše vlastné ID udalosti na mape.

## Ukladanie

Zachované sú kľúče úložiska aj formát záloh v2. Migrácia doplní chýbajúce polia výbavy v batohu, slotoch, dropoch uložených máp a ponukách trhu. Pôvodný damage, bonusy, požiadavky a progres nemení. Séria sa posunie nad všetky použité ID. Kanonické kusy sa pri načítaní neopravujú potichu: neznáme definície, modely a duplicitné vlastníctvo validátor odmietne.

Importovanie kópie postavy s novým ID premapuje namespace instanceId; číselné uid a odkazy rozloženia zostávajú zachované. Bežný import zachová pôvodnú identitu. Vypredané ponuky nie sú ďalším vlastníkom predaného kusu.

## Rozširovanie

1. Definuj predmet cez registerItemDefinition; pri výbave pridaj slot, úroveň, zbraňový typ, povolania, školy, bonus a model.
2. Zaregistruj vlastnú geometriu cez registerEquipmentModel. Tá istá geometria sa používa na ikone, portréte aj postave.
3. Recept pridaj do CRAFT_RECIPES s output.definitionId a output.slot.
4. Ponuku pridaj do MARKET_GOODS a príslušného obchodníka; pri novom trvalom poli rozšír migráciu a validáciu trhu.
5. Drop nastav v LOOT_POOLS. Referencuj definíciu, nikdy vopred vytvorený mutable kus.

Súčasné konkrétne ponuky zbrojára majú vlastné perzistentné kusy; obnovujú sa spolu s trhom každých 600 s aktívnej hry. FMS stojí základne 100 000 Yang, Jedovatý meč 1 500 000 Yang; platí dynamický trhový faktor.

## Loot

data/loot-pools.js obsahuje registre pre každý skin príšery, bossa mapy, Metin a dungeon. systems/loot-pools.js vyberá pool podľa kontextu zabitého nepriateľa. Existujúce Metinové tabuľky sa používajú priamo odkazom. Bežné šance na výbavu, elixíry, zlato a plášte zostali zachované.

catalog obsahuje definitionId, minLevel a chance. Každá zbraň úrovne 30 má samostatnú šancu 1,5 %, Jedovatý meč 2 % od úrovne 75. Zdroje: mapoví a dungeonoví bossovia a Metiny s dostatočnou úrovňou. Platí existujúca podmienka primeraného nepriateľa. Posily Metinu tieto zbrane nedropujú. Bežné príšery ich nemajú v poole.

Biológia, materiály remesiel, eventy, relikvie, dungeonové záruky a prestíž zostávajú samostatné kontextové odmeny nad spoločným generátorom a drop API. Ich pravidlá a pity sa nemenia.

## Katalóg

| Zbraň | Úroveň | Základný útok | Pevný bonus | Remeslo |
|---|---:|---:|---|---:|
| Meč splnu (FMS) | 30 | 48 | rýchlosť útoku +5 % | 6 |
| Čepeľ červeného železa (RIB) | 30 | 60 | HP +30 | 6 |
| Dýky Čierny list | 30 | 44 | kritický zásah +2,5 % | 6 |
| Vejár jesenného vetra | 30 | 42 | sila kúziel +18 | 6 |
| Jedovatý meč | 75 | 110 | rýchlosť útoku +10 % | 10 |

Všetky kusy majú navyše bonusy podľa rarity a podporujú kováča +0 až +9. Povolené povolania a školy sú v definícii a overujú sa pri vybavení. Progresia → Predmety ukazuje požiadavky, pevné bonusy a získavanie; náklady receptu sú vo Výrobe.

Názvy a úrovne vychádzajú z oficiálnej wiki (odkazy v NOTICE.md). Hodnoty, recepty, šance a vektorové modely sú vlastné pre Grindoriu.
