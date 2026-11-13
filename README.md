# Grindoria

**Definitely not Metin**

Sólo RPG v prehliadači. Vlastník: [@ndxnraw](https://github.com/ndxnraw).

## Hranie

[Stiahnuť Grindoria.html](https://github.com/ndxnraw/Grindoria/raw/refs/heads/main/dist/Grindoria.html) a otvoriť uložený súbor. Hra nepotrebuje server ani pripojenie. dist/index.html obsahuje rovnakú zostavu pre statický hosting.

Vytvor postavu, vyber povolanie a školu. Dostaneš obyčajnú zbraň +2 pre svoju školu. Povolanie je nemenné. Každá postava má vlastný progres a inventár; predvolený limit je 8 postáv. Mená: 3–16 znakov, písmená, čísla, _ a -, prvý znak písmeno.

Postavy sa ukladajú automaticky. Tlačidlo Postavy uloží reláciu a otvorí výber. Export obsahuje všetky postavy. Import umožňuje pridať alebo nahradiť zoznam; pred nahradením vznikne bezpečnostná záloha. Vymazanie je nezvratné a vyžaduje celé meno. [Správa postáv](docs/CHARACTERS.md).

## Ovládanie

| Vstup | Akcia |
|---|---|
| WASD / šípky | Pohyb, zrušenie nasledovania |
| SPACE | Útok; zásah označí nepriateľa |
| Klik na nepriateľa / Metin | Označiť a zobraziť údaje |
| Druhý klik na rovnaký cieľ | Nasledovať a automaticky útočiť |
| Klik na zem | Chôdza na miesto, zrušenie cieľa |
| 1–6 / F1–F6 | Schopnosti školy |
| Y / klik na korisť | Zdvihnúť výbavu |
| 7 / F7 · 8 / F8 | Elixír · Plášť statočnosti |
| C / I / V | Postava / inventár / schopnosti |
| N / M / F | Úlohy / veľká mapa / blízke NPC v Meste |
| P / K / H | Progresia / automatický boj / pomoc |
| Alt (podržať) | Červené mená a úrovne nepriateľov |
| F10 / ⛶ | Celá obrazovka |
| Esc | Zrušiť potvrdenie / zavrieť vrchné okno; bez okien zastaviť automatiku a otvoriť menu |

Veľká mapa (M) funguje aj počas boja; cestovanie tlačidlom vedľa minimapy je dostupné mimo boja. F otvorí blízke NPC v Meste; na bojových mapách sú malé bezpečné zóny.

Zlato a zásoby sa pripíšu priamo, bez predmetu na zemi. Výbava zostáva na zemi do zdvihnutia alebo expirácie. Okná sa otvárajú súčasne nad hrou a presúvajú za záhlavie cez Interact.js. − minimalizuje, × zatvorí. Hra pod nimi pokračuje. [Rozhranie](docs/UI.md).

## Začiatok a loviská

Údolie má pri vstupe bežné príšery Lv.1–2 a nízke Metiny. Ďalšie loviská postupne pokrývajú levely 5–99. Základné útoky zasahujú aj blízke skupiny; výbava zodpovedá skutočnej úrovni nepriateľa. [Vyváženie začiatku](docs/BEGINNER_BALANCE.md).

## Herné systémy

- Štyri povolania, osem škôl, 48 schopností, pasívne bonusy a kombá. [Boj](docs/COMBAT.md).
- Mesto s NPC a jedenásť bojových máp vrátane Šuterlandu s Metinmi 1–99. [Lokality](docs/LOCATIONS.md). [Metiny](docs/METINS.md), [príšery a farmenie](docs/FARMING.md).
- Desať slotov výbavy, mriežkový inventár a 44 vektorových modelov. [Inventár](docs/INVENTORY.md), [modely](docs/APPEARANCE.md).
- Kováč v Meste: +0 až +9, materiály, šance, riziko a ochrana. Žiara zbraní od +5. [Vylepšovanie](docs/FORGE.md).
- Spoločný katalóg a stabilné ID predmetov od dropu po výbavu. FMS, Jedovatý meč, RIB, Dýky Čierny list a Vejár jesenného vetra: výroba, dropy a vybrané ponuky zbrojára. [Predmetový model a loot pooly](docs/ITEM_MODEL.md).
- Šesť rarít, 20 náhodných bonusov a hodnotenie predmetov. [Rarity](docs/RARITIES.md).
- Atribúty, špecializácia a prestíž v Postave C; schopnosti 1–20/M1–M10/G1–G10/P v knihe V; osem výskumov u Biológa a výpravy u Dungeon Majstra. [Biológ](docs/BIOLOGY.md). [Progresia](docs/PROGRESSION.md).
- Automierenie pri útoku, Autospell v boji s označeným cieľom a Autoelixíry pri chýbajúcom zdraví každé 2 s, ručne bez cooldownu. Podrobnosti v knihe schopností.

- Prestíž I–V od úrovne 99: nové výzvy, pasívne bonusy, emblémy a zdokonaľovanie Mythic bonusov bez resetu postavy. [Prestíž a endgame](docs/PRESTIGE.md).

- Náhodné udalosti, vzácni bossovia a Metiny, elitné skupiny, dočasné ruiny a drop eventy. [Živý svet](docs/WORLD_EVENTS.md).

## Výkon

Vzdialená neaktívna AI má odstupňované aktualizácie; aktívny boj zostáva priebežný. Vykresľovanie vynecháva neviditeľné objekty a využíva bitmapovú cache koristi. [Merania a opakovanie testu](docs/PERFORMANCE.md).

## Vývoj

Zostavenie vyžaduje Node.js 22+.

```sh
npm start
npm run check
npm test
npm run build
npm run check:dist
```

Náhľad: [http://127.0.0.1:4173](http://127.0.0.1:4173). Zdrojové súbory sú v src/, nástroje v scripts/, testy v tests/. GitHub Actions overuje Windows a Linux.

Zmeny patria do sekcie Unreleased v [changelogu](CHANGELOG.md). Postup vydania: [RELEASING.md](docs/RELEASING.md). Ďalšie pravidlá: [AGENTS.md](AGENTS.md), [architektúra](docs/ARCHITECTURE.md), [prispievanie](CONTRIBUTING.md).

## Pôvod a práva

Hra nepoužíva originálne assety Metin2. Názvy klasických schopností vychádzajú z [Metin2 Wiki](https://en-wiki.metin2.gameforge.com/index.php/Category:Skills). Podrobnosti: [NOTICE.md](NOTICE.md). Licenciu na ďalšie šírenie zdrojov zatiaľ vlastník nezvolil.


## Výroba u kováča

Klikni na Kováča v Meste a vyber Vylepšovanie alebo Výrobu. Remeslo má vlastnú prax, úrovne 1–10 a recepty z materiálov lovu, Metinov a trhlín. [Recepty a pravidlá](docs/CRAFTING.md).

## NPC trh

Obchodník a Zbrojár v Meste majú konečné zásoby, meniace sa ceny a výkup. Ponuka sa obnovuje každých 10 minút aktívnej hry. [Ekonomika a obchod](docs/ECONOMY.md).

## Ovládanie rozhrania

Panely zachovávajú pozíciu pri nákupe a predaji. Náklady ukazujú Máš / Potrebuješ. Predmet môžeš vyhodiť vytiahnutím mimo inventára alebo tlačidlom Vyhodiť… a potvrdením; na zemi ho znova zdvihneš kliknutím alebo Y. [Rozhranie](docs/UI.md).

## Dungeony

Klik na Dungeon Majstra v Meste otvorí ponuku dungeonov a trhlín. Tri lokality, tri obtiažnosti, vlastné mechaniky bossov a unikátna korisť. Endgame Priepasť ponúka Legendary a Mythic výbavu so zárukou po sérii úspechov. [Pravidlá a odmeny](docs/DUNGEONS.md).

## Bestiár a objavovanie

Progres (P) → Bestiár a zbierky: objavení nepriatelia, bossové trofeje, skryté lokality a dlhodobé ciele s trvalými odmenami. [Pravidlá](docs/DISCOVERY.md). Cieľová platforma: PC prehliadač.

Od 0.32.0: inventár má päť strán po 45 políčok, porovnanie je v náhľade predmetu a vyhodenie potvrdzuje malé stredové okno aj kláves Enter. Dokončené úlohy sú v N → Splnené. [Aktuálne rozdelenie systémov a prevod starých postáv](docs/PROGRESSION.md).
