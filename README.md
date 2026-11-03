# Grindoria

**Definitely not Metin**

Sólo RPG v prehliadači. Vlastník: [@ndxnraw](https://github.com/ndxnraw).

## Hranie

[Stiahnuť Grindoria.html](https://github.com/ndxnraw/Grindoria/raw/refs/heads/main/dist/Grindoria.html) a otvoriť uložený súbor. Hra nepotrebuje server ani pripojenie. dist/index.html obsahuje rovnakú zostavu pre statický hosting.

Vytvor postavu, vyber povolanie a školu. Povolanie je nemenné. Každá postava má vlastný progres a inventár; predvolený limit je 8 postáv. Mená: 3–16 znakov, písmená, čísla, _ a -, prvý znak písmeno.

Postavy sa ukladajú automaticky. Tlačidlo Postavy uloží reláciu a otvorí výber. Export obsahuje všetky postavy. Import umožňuje pridať alebo nahradiť zoznam; pred nahradením vznikne bezpečnostná záloha. Vymazanie je nezvratné a vyžaduje celé meno. [Správa postáv](docs/CHARACTERS.md).

## Ovládanie

| Vstup | Akcia |
|---|---|
| WASD / šípky | Pohyb, zrušenie nasledovania |
| SPACE | Útok; zásah označí nepriateľa |
| Klik na nepriateľa / Metin | Označiť a zobraziť údaje |
| Dvojklik na nepriateľa / Metin | Nasledovať a automaticky útočiť |
| Klik do prázdna | Zrušiť cieľ |
| Q R T V U O | Schopnosti školy |
| Y / klik na korisť | Zdvihnúť výbavu a relikvie |
| E / B | Elixír / Plášť statočnosti |
| I / K / P | Inventár / schopnosti / progresia |
| J / M / F | Úlohy / mapy / obchod |
| C / ? | Bojový manuál / ovládanie |
| F10 / ⛶ | Celá obrazovka |
| Esc | Zavrieť panel; v hre zrušiť cieľ a automatiku |

Zlato a zásoby sa pripíšu priamo, bez predmetu na zemi. Výbava a relikvie zostávajú na zemi do zdvihnutia alebo expirácie. Okná možno zatvoriť kliknutím mimo nich.

## Herné systémy

- Štyri povolania, osem škôl, 48 schopností, pasívne bonusy a kombá. [Boj](docs/COMBAT.md).
- Päť máp vrátane Šuterlandu s Metinmi 1–99. [Metiny](docs/METINS.md), [príšery a farmenie](docs/FARMING.md).
- Desať slotov výbavy, mriežkový inventár a 39 vektorových modelov. [Inventár](docs/INVENTORY.md), [modely](docs/APPEARANCE.md).
- Šesť rarít, 20 náhodných bonusov a hodnotenie predmetov. [Rarity](docs/RARITIES.md).
- Tréning, schopnosti, biológia, alchýmia, relikvie, špecializácia a trhliny. [Progresia](docs/PROGRESSION.md).
- Automierenie pri útoku, Autospell v boji s označeným cieľom a Autoelixíry pod 45 % HP. Podrobnosti v bojovom manuáli.

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
