# Grindoria

**Definitely not Metin**

Hrateľné fantasy akčné RPG v prehliadači. Projekt vlastní a spravuje [@ndxnraw](https://github.com/ndxnraw).

Sólo 2D hra inšpirovaná klasickými MMORPG: štyri povolania, osem škôl so 48 schopnosťami, päť máp, bossovia, výbava a úlohy. Grafika a animácie sú vlastné; nejde o oficiálny klient Metin2 ani presnú reprodukciu jeho mechaník.

## Výber postáv

Hra sa otvára v **Sieni hrdinov**. Vytvor si pomenovanú postavu, vyber povolanie a školu, potom stlač **Hrať**. Povolanie sa už nemení. Predvolene môžeš mať osem samostatných postáv, aj viac rovnakého povolania; limit nastavuje CHARACTER_RULES.maxCharacters v src/js/data/characters.js. Meno má 3–16 znakov, začína písmenom a podporuje písmená, čísla, `_` a `-`. Predpona `*` pridá lokálne označenie `[GM]`.

Každá postava má vlastné úrovne, inventár, výbavu, Yang, úlohy, schopnosti a mapy. **Postavy** v hlavičke alebo **♙ v minimape** bezpečne uložia reláciu a vrátia výber. Výber zobrazuje animovaný 2D model s nasadenou výbavou; engine nepoužíva 3D.

**Exportovať postavy** stiahne jeden JSON so všetkými profilmi. **Importovať postavy** najprv ukáže obsah a konflikty: možno postavy pridať s vyriešením mien alebo celý zoznam nahradiť po potvrdení. Pred nahradením vznikne stiahnuteľná bezpečnostná záloha. Vymazanie vyžaduje napísanie celého mena. Podrobnosti: [CHARACTERS.md](docs/CHARACTERS.md).

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

Otvor `dist/Grindoria.html` dvojklikom v prehliadači. Celá hra je v jednom súbore bez externých fontov, obrázkov či servera. `dist/index.html` je rovnaký výstup pre prípadné statické hostovanie. Priečinok `dist/` je súčasťou každého vydania v repozitári. [Stiahni Grindoria.html](https://github.com/ndxnraw/Grindoria/raw/refs/heads/main/dist/Grindoria.html) a otvor uložený súbor.

## Ovládanie

| Kláves | Akcia |
| --- | --- |
| WASD / šípky | Pohyb |
| Medzerník | Základný útok; možno držať |
| Q R T V U O | Šesť schopností školy |
| Y | Pozbierať predmety v okolí bez kurzora |
| E | Liečivý elixír |
| B | Plášť statočnosti — prilákanie príšer |
| I | Výbava a vlastnosti |
| P | Dlhodobá progresia a materiály |
| K | Kniha schopností |
| J | Denník úloh |
| M | Cestovanie z útočiska |
| F | Obchodník |
| C | Bojový manuál a odolnosti |
| F10 / ⛶ v minimape | Celá obrazovka |
| Esc | Zavrieť okno alebo zrušiť cieľ |

Klik na nepriateľa alebo Metin ho označí: postava sleduje jeho aktuálnu polohu a v dosahu automaticky útočí. Smrť cieľa nasledovanie zastaví. WASD, šípky alebo Esc zrušia označenie. Klik do prázdna vyvolá útok bez pohybu; bez označeného cieľa postava mieri podľa kurzora. Ľavé kliknutie na korisť ju zdvihne; Y pozbiera predmety v okolí bez potreby kurzora. Dostupné je aj dotykové ovládanie.

## Automatické mierenie a Autospell

Dva prepínače **nad hotbarom** sa dajú zapnúť nezávisle:

- **Automierenie** otáča postavu na najbližšiu živú príšeru alebo Metin do 500 jednotiek. Označený cieľ má prednosť. Samo nevytvára pohyb ani základné útoky; medzerník naďalej ovládaš ty.
- **Autospell** používa dostupné schopnosti so skutočnou spotrebou many, cooldownmi a dosahom. Bez automatického mierenia používa označený cieľ alebo smer postavy. Zahŕňa aj premiestňujúce výpady a dostupné liečenie pri nízkom zdraví.

Nastavenie sa zapamätá. V útočisku, otvorenom paneli a neaktívnom okne automatika čaká. **Esc v hre vypne oba režimy**; Esc pri otvorenom paneli najprv zavrie panel. Kliknutie na schopnosť vráti ovládanie hernej ploche, takže medzerník hneď funguje.

## Obsah

- Bojovník, Ninja, Sura a šaman; každé povolanie má dve školy.
- Údolie tichého vetra, Púšť zapadnutých chrámov, Hory večného mrazu, Chrám červeného plameňa a Šuterland.
- Úrovne, skúsenosti, zlato, mana, sila, vitalita, obratnosť a inteligencia.
- Mriežkový inventár 5 × 9 na dvoch stranách, viacpolíčkové predmety, presúvanie, tooltipy, triedenie a zásobníky.
- Desať slotov výbavy s okamžitými bonusmi, vlastné ikony, nasadzovanie, predaj, potvrdené odstraňovanie a vylepšovanie.
- Strely, plošné útoky, jed, popálenie, omráčenie, aury a liečenie.
- Pomalé levelovanie, tréning atribútov, stupne schopností, biologické úlohy, alchýmia, relikvie, špecializácia a endgame trhliny.
- Husté skupinové spawny v štyroch úrovňových oblastiach každej mapy; elitné a vzácne varianty s lepšou korisťou.
- Bežné, elitné a vzácne príšery sa pokojne potulujú v okruhu 85 jednotiek. Zásah vyprovokuje zasiahnutú príšeru a blízkych členov jej skupiny, spolu najviac päť; susedné skupiny zostanú neutrálne. Plášť priťahuje hromadne, bossovia útočia automaticky.
- Plášť statočnosti v konečnej zásobe: dosah 650, priťahovanie na 18 s, nákup a dopĺňanie z koristi.
- Respawn: bežné príšery 5 s, elity 8 s, vzácne varianty 20 s, hliadky 75 s, kamene 18 s a bossovia 40 s aktívneho času mapy.

Postavy sa automaticky ukladajú do jedného atomického registra v localStorage pod kľúčom grindoria-characters-v1, pričom každý profil má vlastné stabilné ID a samostatné dáta. Starý spoločný postup sa jednorazovo prevedie na pomenovanú postavu; pôvodný zdroj zostane zálohou. Pri obnovení stránky sa najprv zobrazí výber a po Hrať sa obnoví vlastná mapa aj pozícia postavy. Prenos medzi zariadeniami, súbormi alebo Electron aplikáciou používa export a import. Respawn neaktívnej mapy je pozastavený, expirácia koristi plynie podľa skutočného času.

## Metiny a Šuterland

Osem typov Metinov má vlastné modely, úrovne, obtiažnosť, životy, odolnosť a loot pooly. Počas útoku pravidelne privolávajú agresívnych obrancov podľa úrovne. **M → Šuterland** vedie na mapu s 99 Metinmi, po jednom pre každú úroveň 1–99; bez boja sa tam bežné príšery nevyskytujú.

**M → Atlas Metinov** ukazuje konkrétne šance na Yang, rudu, knihy, alchymistické materiály, kamene vylepšenia, výbavu a relikvie. Kamene vylepšenia používa kováč od +4. Všetky dropy najprv dopadnú na zem a používajú aktuálne pravidlá zbierania. Pozri [METINS.md](docs/METINS.md).

## Boj a schopnosti

48 aktívnych schopností má vlastné animácie, náklady many a cooldowny. Sedem typov poškodenia používa odlišné odolnosti a slabiny. Každá škola získava pasívnu schopnosť na úrovniach 10, 25, 50 a 75 a vlastnú dvojicu schopností pre kombo do štyroch sekúnd. Jed a popálenie môžu pôsobiť súčasne; šípy letia v smere mierenia a vybrané magické strely sledujú cieľ. **K** ukáže účel schopností, pasívny bonus a kombo; **C** otvorí pravidlá boja. Pozri [COMBAT.md](docs/COMBAT.md).

## Korisť na zemi

Zlato a zásoby sa po dopade zbierajú **automaticky do 180 jednotiek**. **Y** pozbiera všetku dostupnú korisť v rovnakom okolí bez kurzora; konkrétny predmet možno zdvihnúť aj kliknutím. Výbava a relikvie vyžadujú Y alebo kliknutie. Plný inventár ponechá výbavu na zemi. Tooltip sa otvorí po 0,55 s zastavenia kurzora a ukáže požadovanú úroveň a farebné porovnanie s nasadenou výbavou. Štvrtá schopnosť sa presunula na **V**. Podrobnosti: [LOOT.md](docs/LOOT.md).

## Celá obrazovka a Electron

**F10** alebo tlačidlo **⛶ v minimape** prepne celú hernú plochu na obrazovku. Návrat: rovnaké tlačidlo, F10 alebo Esc podľa prehliadača. Ovládanie, inventár aj tooltipy zostávajú v hre. Prehliadač používa Fullscreen API; pripravený Electron host používa izolovaný most a skutočný fullscreen okna. Zdroj hosta je v `desktop/`, postup a hranice overenia v [DESKTOP.md](docs/DESKTOP.md).

## Inventár a výbava

**I** otvorí výbavu postavy a inventár. Predmety presúvaj myšou; na dotyku vyber predmet a potom cieľové políčko. Dvojklik alebo tlačidlo v detaile predmet nasadí či použije. Záložka **Zásoby** automaticky zlučuje elixíry, plášte, materiály a kamene. Odstraňovanie vyžaduje potvrdenie. Rozmery, bonusy a prenos starého batohu opisuje [INVENTORY.md](docs/INVENTORY.md).

## Dlhodobá progresia

Panel **P** sprístupňuje všetky cesty rozvoja a ich náklady. Prvá úroveň vyžaduje 600 EXP, úroveň 10 už vyše 100 000 EXP na ďalší level. Príliš slabé ciele neposkytujú EXP a opakovateľné úlohy tento limit neobchádzajú. Starší postup sa migruje pri zachovaní levelu a pomernej EXP pozície.

Materiály, knihy a prax umožňujú zlepšovať postavu aj bez zvýšenia levelu. Štyri pôvodné bojové mapy sú odporúčané pre úrovne 1, 8, 18 a 35; Šuterland ponúka Metiny všetkých úrovní 1–99; od úrovne 35 sa otvárajú silnejúce trhliny. Podrobné vzorce, príklady, zdroje materiálov a limity opisuje [PROGRESSION.md](docs/PROGRESSION.md).

Štyri pôvodné mapy obsahujú 148–196 pohyblivých príšer, osem Metinov a bossa. Každá má 24–32 skupinových bodov a štyri vzácne hliadky. **B** použije jeden Plášť statočnosti a pritiahne živé pohyblivé ciele v okolí. Počet kusov nájdeš na lište a vo výbave, ďalšie predáva obchodník. Oblasti, dropy a presné pravidlá vysvetľuje [FARMING.md](docs/FARMING.md).

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
desktop/               Electron host, preload a fullscreen most
scripts/               Server, zostavenie, kontroly a vydávanie
tests/                 Herné mechaniky a nástroje
docs/                  Architektúra a vydávanie
.github/workflows/     Automatické kontroly
dist/                  Hotové offline HTML súbory
CHANGELOG.md           História a pripravované zmeny
```

## Vývoj a kontroly

```sh
npm run check
npm test
npm run build
npm run check:dist
```

Testy pokrývajú všetkých 48 schopností, postup, ukladanie, mapy, respawn a prípravu vydania. Nenahrádzajú vizuálnu kontrolu v prehliadači. Rovnaké príkazy používa GitHub Actions na Windows a Linuxe.

Zmeny zapisuj pod `[Unreleased]` v [CHANGELOG.md](CHANGELOG.md). Príkaz `npm run release -- 0.13.1` presunie poznámky do novej verzie, pridá dátum a odkazy, zosúladí verziu hry a vytvorí offline súbor. Sám necommituje ani neposiela zmeny na GitHub.

Podrobnosti: [vydávanie](docs/RELEASING.md), [architektúra](docs/ARCHITECTURE.md), [prispievanie](CONTRIBUTING.md).

História 0.1.0–0.3.0 opisuje prototyp pred založením repozitára; nejde o spätne vytvorené commity alebo tagy.

## Pôvod a práva

Hra nepoužíva originálne assety Metin2. Školy a názvy klasických schopností vychádzajú z [Metin2 Wiki](https://en-wiki.metin2.gameforge.com/index.php/Category:Skills). Ochranné známky patria ich príslušným vlastníkom. Pozri [NOTICE.md](NOTICE.md). Licenciu na ďalšie šírenie zdrojov zatiaľ vlastník nezvolil.



Vizuálna výbava: 39 vektorových modelov pre desať slotov a štyri typy zbraní. Nasadené predmety sú viditeľné v hernom svete, inventári a výbere postáv. [Modely a rozširovanie](docs/APPEARANCE.md).
