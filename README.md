# Grindoria

**Definitely not Metin**

Sólo RPG v prehliadači. Vlastník: [@ndxnraw](https://github.com/ndxnraw).

## Hranie

[Stiahnuť Grindoria.html](https://github.com/ndxnraw/Grindoria/raw/refs/heads/main/dist/Grindoria.html) a otvoriť uložený súbor. Hra nepotrebuje server ani pripojenie. dist/index.html obsahuje rovnakú zostavu pre statický hosting.

Vytvor postavu, vyber povolanie a školu. Dostaneš obyčajnú zbraň +9 pre svoju školu. Povolanie je nemenné. Každá postava má vlastný progres a inventár; predvolený limit je 8 postáv. Mená: 3–16 znakov, písmená, čísla, _ a -, prvý znak písmeno.

Postavy sa ukladajú automaticky. Tlačidlo Postavy uloží reláciu a otvorí výber. Export obsahuje všetky postavy. Import umožňuje pridať alebo nahradiť zoznam; pred nahradením vznikne bezpečnostná záloha. Vymazanie je nezvratné a vyžaduje celé meno. [Správa postáv](docs/CHARACTERS.md).

## Ovládanie

| Vstup | Akcia |
|---|---|
| WASD / šípky | Pohyb, zrušenie nasledovania |
| SPACE | Útok; zásah označí nepriateľa |
| Klik na nepriateľa / Metin | Označiť a zobraziť údaje |
| Druhý klik na rovnaký cieľ | Nasledovať a automaticky útočiť |
| Klik do prázdna | Zrušiť cieľ |
| Q R T V U O | Schopnosti školy |
| Y / klik na korisť | Zdvihnúť výbavu a relikvie |
| E / B | Elixír / Plášť statočnosti |
| I / K / P | Inventár / schopnosti / progresia |
| J / M / F | Úlohy / mapy / NPC v Meste |
| C / ? | Bojový manuál / ovládanie |
| F10 / ⛶ | Celá obrazovka |
| Esc | Zavrieť panel; v hre zrušiť cieľ a automatiku |

Cestovanie (M) je dostupné kdekoľvek mimo boja. F otvorí blízke NPC v Meste; na bojových mapách sú malé bezpečné zóny.

Zlato a zásoby sa pripíšu priamo, bez predmetu na zemi. Výbava a relikvie zostávajú na zemi do zdvihnutia alebo expirácie. Okná možno zatvoriť kliknutím mimo nich.

## Začiatok a loviská

Údolie má pri vstupe bežné príšery Lv.1–2 a nízke Metiny. Ďalšie loviská postupne pokrývajú levely 5–99. Základné útoky zasahujú aj blízke skupiny; obyčajná výbava padá v päťlevelových pásmach. [Vyváženie začiatku](docs/BEGINNER_BALANCE.md).

## Herné systémy

- Štyri povolania, osem škôl, 48 schopností, pasívne bonusy a kombá. [Boj](docs/COMBAT.md).
- Mesto s NPC a jedenásť bojových máp vrátane Šuterlandu s Metinmi 1–99. [Lokality](docs/LOCATIONS.md). [Metiny](docs/METINS.md), [príšery a farmenie](docs/FARMING.md).
- Desať slotov výbavy, mriežkový inventár a 44 vektorových modelov. [Inventár](docs/INVENTORY.md), [modely](docs/APPEARANCE.md).
- Kováč v Meste: +0 až +9, materiály, šance, riziko a ochrana. Žiara zbraní od +5. [Vylepšovanie](docs/FORGE.md).
- Spoločný katalóg a stabilné ID predmetov od dropu po výbavu. FMS, Jedovatý meč, RIB, Dýky Čierny list a Vejár jesenného vetra: výroba, dropy a vybrané ponuky zbrojára. [Predmetový model a loot pooly](docs/ITEM_MODEL.md).
- Šesť rarít, 20 náhodných bonusov a hodnotenie predmetov. [Rarity](docs/RARITIES.md).
- Tréning, schopnosti, osem biologických výskumov, alchýmia, relikvie, špecializácia a trhliny. [Biológ](docs/BIOLOGY.md). [Progresia](docs/PROGRESSION.md).
- Automierenie pri útoku, Autospell v boji s označeným cieľom a Autoelixíry pod 45 % HP. Podrobnosti v bojovom manuáli.

- Prestíž I–V od úrovne 99: nové výzvy, pasívne bonusy, emblémy a zdokonaľovanie Mythic bonusov bez resetu postavy. [Prestíž a endgame](docs/PRESTIGE.md).

- Náhodné udalosti, vzácni bossovia a Metiny, elitné skupiny, dočasné ruiny a drop eventy. [Živý svet](docs/WORLD_EVENTS.md).

## Výkon

Vzdialená neaktívna AI má odstupňované aktualizácie; aktívny boj zostáva priebežný. Vykresľovanie vynecháva neviditeľné objekty a využíva bitmapovú cache koristi. [Merania a opakovanie testu](docs/PERFORMANCE.md).

## Vývoj

Node.js 22+; bez externých balíčkov.

```sh
npm start
npm run check
npm test
npm run build
npm run check:dist
```

Náhľad: [http://127.0.0.1:4173](http://127.0.0.1:4173). Zdrojové súbory sú v src/, Electron host v desktop/, nástroje v scripts/, testy v tests/. GitHub Actions overuje Windows a Linux.

Zmeny patria do sekcie Unreleased v [changelogu](CHANGELOG.md). Postup vydania: [RELEASING.md](docs/RELEASING.md). Ďalšie pravidlá: [AGENTS.md](AGENTS.md), [architektúra](docs/ARCHITECTURE.md), [prispievanie](CONTRIBUTING.md), [Electron](docs/DESKTOP.md).

## Pôvod a práva

Hra nepoužíva originálne assety Metin2. Názvy klasických schopností vychádzajú z [Metin2 Wiki](https://en-wiki.metin2.gameforge.com/index.php/Category:Skills). Podrobnosti: [NOTICE.md](NOTICE.md). Licenciu na ďalšie šírenie zdrojov zatiaľ vlastník nezvolil.


## Výroba a alchýmia

V Progrese (P) otvor Výrobu pri kováčovi alebo Alchýmiu pri alchymistovi v Meste. Obe remeslá majú vlastnú prax, úrovne 1–10 a recepty z materiálov lovu, Metinov a trhlín. [Recepty a pravidlá](docs/CRAFTING.md).

## NPC trh

Obchodník, Zbrojár a alchymista v Meste majú konečné zásoby, meniace sa ceny a výkup. Ponuka sa obnovuje každých 10 minút aktívnej hry. [Ekonomika a obchod](docs/ECONOMY.md).

## Ovládanie rozhrania

Panely zachovávajú pozíciu pri nákupe a predaji. Náklady ukazujú Máš / Potrebuješ. Predmet môžeš vyhodiť vytiahnutím mimo inventára alebo tlačidlom Vyhodiť… a potvrdením; na zemi ho znova zdvihneš kliknutím alebo Y. [Rozhranie](docs/UI.md).

## Dungeony

Mapy (M) → Dungeony alebo Progres (P) → Dungeony. Tri lokality, tri obtiažnosti, vlastné mechaniky bossov a unikátna korisť. Endgame Priepasť ponúka Legendary a Mythic výbavu so zárukou po sérii úspechov. [Pravidlá a odmeny](docs/DUNGEONS.md).

## Bestiár a objavovanie

Progres (P) → Bestiár a zbierky: objavení nepriatelia, bossové trofeje, skryté lokality a dlhodobé ciele s trvalými odmenami. [Pravidlá](docs/DISCOVERY.md). Cieľová platforma: PC prehliadač a existujúci Electron obal.
