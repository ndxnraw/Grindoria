# Vydávanie verzií

Aktuálna verzia je uvedená v `package.json`, označení `ALPHA` v `src/index.html` a v prvom vydaní `CHANGELOG.md`. Všetky tri hodnoty musia súhlasiť.

## Priebežný changelog

Každú zmenu zapisuj ako odrážku pod `[Unreleased]` do `Added`, `Changed` alebo `Fixed`. Prázdne kategórie sú povolené. Číslo pripravovanej verzie do tejto sekcie nepíš.

```markdown
## [Unreleased]

### Added
- Nová úloha v púšti.

### Changed

### Fixed
- Opravené zbieranie koristi.
```

## Príprava vydania

```sh
npm run release -- 0.4.1 --dry-run
npm run release -- 0.4.1
```

Použi vyššiu stabilnú verziu v tvare `major.minor.patch`. Skript odmietne rovnakú alebo nižšiu verziu aj prázdnu sekciu `Unreleased`. Pred zápisom spustí kontroly a testy. Potom:

1. presunie nevydané poznámky pod novú verziu,
2. doplní dátum podľa časového pásma Europe/Bratislava,
3. ponechá novú prázdnu sekciu `Unreleased`,
4. aktualizuje porovnávacie odkazy,
5. zosúladí verziu hry a `package.json`,
6. vytvorí offline zostavenie v `dist/`.

Ak zostavenie zlyhá, vráti tieto tri zdrojové súbory do pôvodného stavu. Skript nevytvára Git commit, tag ani vzdialené vydanie a nič automaticky neposiela.

## Odoslanie po kontrole

Skontroluj diff a otvor offline HTML. Potom vytvor commit a tag, napríklad:

```sh
git add package.json src/index.html CHANGELOG.md
git commit -m "chore(release): 0.4.1"
git tag -a v0.4.1 -m "JadeRealm 0.4.1"
git push origin main
git push origin v0.4.1
```

Porovnávacie odkazy potrebujú vzdialenú referenciu pre každú vydanú verziu. Verzie `v0.3.1` a `v0.4.0` majú referenčné vetvy vytvorené cez prepojenie GitHub; ďalšie vydania označuj tagmi podľa postupu vyššie. Do referenčných vetiev ďalšie zmeny necommituj. Záznamy 0.1.0–0.3.0 sú iba história skoršieho prototypu, preto odkazujú priamo na sekcie changelogu.

GitHub Release možno následne vytvoriť pre daný tag a priložiť `dist/Jade-Realm.html`. Samotné vytvorenie zdrojovej verzie nepublikuje hru na webový hosting.

