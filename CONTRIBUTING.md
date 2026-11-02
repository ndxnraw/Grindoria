# Prispievanie

Projekt spravuje [@ndxnraw](https://github.com/ndxnraw). Použi Node.js 22+; externé závislosti nie sú potrebné.

1. Založ vetvu pre jednu konkrétnu zmenu.
2. Uprav zdroje v `src/`, nie vygenerované súbory v `dist/`.
3. Pridaj stručnú poznámku pod `Unreleased` v `CHANGELOG.md` do `Added`, `Changed` alebo `Fixed`.
4. Spusť `npm run check`, `npm test` a `npm run build`.
5. Otvor hru cez `npm start` a skontroluj dotknuté ovládanie a vzhľad. Pri zmene zostavenia otvor aj `dist/Jade-Realm.html` bez servera.
6. Commit označ podľa obsahu, napríklad `feat: add a map`, `fix: preserve map loot`, `docs: explain saving` alebo `test: cover poison damage`.

Do pull requestu napíš problém, výsledné správanie, vykonané kontroly a prípadné obmedzenia. Pridaj testy pri zmene súbojov, odmien alebo ukladania; jednoduchá textová úprava nové testy nepotrebuje.

## Dôležité pravidlá

- Zachovaj kľúč `jade-realm-save-v1`, pokiaľ nepripravíš migráciu uloženého postupu.
- Pri presúvaní funkcií zachovaj poradie inicializácie: dáta, stav, funkcie, `main.js`.
- Nový runtime súbor pridaj do `src/index.html`. Zostavenie a testy preberajú poradie priamo odtiaľ.
- Offline výstup nesmie načítavať vzdialené fonty, obrázky ani skripty.
- Nevkladaj osobné uložené hry, heslá, tokeny, lokálne cesty ani konfiguračné súbory pôvodného hostingu.
- Nepreberaj herné assety bez vyriešených práv na ich použitie.

Vydávanie opisuje [docs/RELEASING.md](docs/RELEASING.md).
