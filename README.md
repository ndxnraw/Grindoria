# JadeRealm

Hrateľné fantasy akčné RPG v prehliadači. Projekt vlastní a spravuje [@ndxnraw](https://github.com/ndxnraw).

Sólo 2D hra inšpirovaná klasickými MMORPG: štyri povolania, osem škôl so 48 schopnosťami, štyri mapy, bossovia, výbava a úlohy. Grafika a animácie sú vlastné; nejde o oficiálny klient Metin2 ani presnú reprodukciu jeho mechaník.

## Spustenie

Potrebuješ Node.js 22 alebo novší (odporúčané 24). Projekt nemá externé balíčky; netreba `npm install`.

```sh
npm start
```

Otvor [http://127.0.0.1:4173](http://127.0.0.1:4173). Zmeny zdrojov sa prejavia po obnovení stránky.

## Offline hranie

```sh
npm run build
```

Otvor `dist/Jade-Realm.html` dvojklikom v prehliadači. Celá hra je v jednom súbore bez externých fontov, obrázkov či servera. `dist/index.html` je rovnaký výstup pre prípadné statické hostovanie. Generovaný priečinok `dist/` sa necommituje.

## Ovládanie

| Kláves | Akcia |
| --- | --- |
| WASD / šípky | Pohyb |
| Medzerník | Základný útok; možno držať |
| Q R T Y U O | Šesť schopností školy |
| E | Liečivý elixír |
| I | Výbava a vlastnosti |
| P | Dlhodobá progresia a materiály |
| K | Kniha schopností |
| J | Denník úloh |
| M | Cestovanie z útočiska |
| F | Obchodník |
| Esc | Zavrieť okno |

Kliknutie v teréne presúva postavu, kliknutie na blízku príšeru útočí. Dostupné je aj dotykové ovládanie.

## Obsah

- Bojovník, nindža, Sura a šaman; každé povolanie má dve školy.
- Údolie tichého vetra, Púšť zapadnutých chrámov, Hory večného mrazu a Chrám červeného plameňa.
- Úrovne, skúsenosti, zlato, mana, sila, vitalita, obratnosť a inteligencia.
- Batoh, tri vzácnosti výbavy, nasadzovanie, predaj a vylepšovanie.
- Strely, plošné útoky, jed, popálenie, omráčenie, aury a liečenie.
- Pomalé levelovanie, tréning atribútov, stupne schopností, biologické úlohy, alchýmia, relikvie, špecializácia a endgame trhliny.
- Respawn: príšery 5 s, kamene 18 s, bossovia 40 s aktívneho času mapy.

Postup sa ukladá v `localStorage` pod kľúčom `jade-realm-save-v1`. Závisí od prehliadača a umiestnenia súboru; medzi zariadeniami a adresami sa automaticky neprenáša. Stav neaktívnej mapy vrátane časovačov je pozastavený.

## Dlhodobá progresia

Panel **P** sprístupňuje všetky cesty rozvoja a ich náklady. Prvá úroveň vyžaduje 600 EXP, úroveň 10 už vyše 100 000 EXP na ďalší level. Príliš slabé ciele neposkytujú EXP a opakovateľné úlohy tento limit neobchádzajú. Starší postup sa migruje pri zachovaní levelu a pomernej EXP pozície.

Materiály, knihy a prax umožňujú zlepšovať postavu aj bez zvýšenia levelu. Mapy sú odporúčané pre úrovne 1, 8, 18 a 35; od úrovne 35 sa otvárajú silnejúce trhliny. Podrobné vzorce, príklady, zdroje materiálov a limity opisuje [PROGRESSION.md](docs/PROGRESSION.md).

## Štruktúra

```text
src/
  index.html           Rozhranie a poradie skriptov
  styles/main.css      Responzívny vzhľad
  js/
    data/              Povolania, schopnosti a mapy
    core/              Stav a herná slučka
    systems/           Súboje, postup a stav máp
    render/            Postavy, scéna a efekty
    ui/                Panely a HUD
    main.js            Pripojenie ovládania a spustenie
scripts/               Server, zostavenie, kontroly a vydávanie
tests/                 Herné mechaniky a nástroje
docs/                  Architektúra a vydávanie
.github/workflows/     Automatické kontroly
CHANGELOG.md           História a pripravované zmeny
```

## Vývoj a kontroly

```sh
npm run check
npm test
npm run build
```

Testy pokrývajú všetkých 48 schopností, postup, ukladanie, mapy, respawn a prípravu vydania. Nenahrádzajú vizuálnu kontrolu v prehliadači. Rovnaké príkazy používa GitHub Actions na Windows a Linuxe.

Zmeny zapisuj pod `[Unreleased]` v [CHANGELOG.md](CHANGELOG.md). Príkaz `npm run release -- 0.4.1` presunie poznámky do novej verzie, pridá dátum a odkazy, zosúladí verziu hry a vytvorí offline súbor. Sám necommituje ani neposiela zmeny na GitHub.

Podrobnosti: [vydávanie](docs/RELEASING.md), [architektúra](docs/ARCHITECTURE.md), [prispievanie](CONTRIBUTING.md).

História 0.1.0–0.3.0 opisuje prototyp pred založením repozitára; nejde o spätne vytvorené commity alebo tagy.

## Pôvod a práva

Hra nepoužíva originálne assety Metin2. Školy a názvy klasických schopností vychádzajú z [Metin2 Wiki](https://en-wiki.metin2.gameforge.com/index.php/Category:Skills). Ochranné známky patria ich príslušným vlastníkom. Pozri [NOTICE.md](NOTICE.md). Licenciu na ďalšie šírenie zdrojov zatiaľ vlastník nezvolil.

