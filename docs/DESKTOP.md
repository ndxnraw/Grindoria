# Windows aplikácia

## Inštalácia a hranie

V [GitHub Releases](https://github.com/ndxnraw/Grindoria/releases/latest) stiahni Grindoria-Setup-verzia-x64.exe. NSIS inštalátor nainštaluje kompletnú hru pre aktuálneho používateľa. Nevyžaduje nainštalovaný Node ani Electron; runtime je súčasťou EXE. Cieľ: Windows 10/11 x64.

Postavy sa ukladajú v profile aplikácie pod %APPDATA%/Grindoria. Aktualizácia ani bežné odinštalovanie tento priečinok neodstráni. Úložisko používa stále grindoria://game, aby sa pri zmene verzie nemenil pôvod uložených dát. Na prenos z browserovej HTML hry použi Exportovať postavy a Importovať postavy; aplikácia nečíta údaje iných prehliadačov.

Aktuálna distribúcia nemá Authenticode certifikát. Windows môže zobraziť upozornenie na neznámeho vydavateľa. Kontrolný súčet a aktuálne súbory patria ku konkrétnemu vydaniu na GitHube.

## Aktualizácie

Pri každom štarte zabalenej aplikácie electron-updater overí stabilné GitHub Releases repozitára ndxnraw/Grindoria. Nepovažuje samotný commit, main ani verziovú vetvu za nainštalovateľnú aktualizáciu. Zdroj je zapísaný v resources/app-update.yml pri zostavení.

Tlačidlo Aktualizácie ukazuje stav. Nová verzia sa sťahuje po potvrdení. Po overení stiahnutého inštalátora je dostupné Uložiť a reštartovať. Renderer najprv synchrónne uloží aktívnu postavu; host pred ukončením dokončí zápis úložiska; pri chybe uloženia inštaláciu nespustí. Automatická inštalácia pri obyčajnom zatvorení je vypnutá. Neoverené ani nedokončené sťahovanie nemožno nainštalovať.

Výpadok pripojenia nezablokuje vstup do hry. Po 12 s sa stav zmení na informáciu o pomalej kontrole; samotné hranie na odpoveď siete nečaká. Chyby sa zapisujú do updates.log v používateľskom profile. Vývojový Electron host kontrolu preskakuje; balík EXE ju vykonáva.

GitHub vydanie musí obsahovať NSIS EXE, jeho .blockmap a latest.yml so správnym SHA-512. Všetky tri súbory vždy vytvorí jedno zostavenie a uverejnia sa spolu. Kontroly sťahovania zabezpečuje electron-updater; privátne tokeny nie sú pribalené do aplikácie.

## Zostavenie

Node.js 24, npm:

~~~sh
npm ci
npm run check
npm test
npm run desktop:dist
npm run desktop:verify
npm run desktop:smoke
~~~

Výstup release/ obsahuje inštalátor, blockmap, latest.yml a win-unpacked/. Vývoj: npm run desktop:dev. Nezabalený testovací balík: npm run desktop:pack. Runtime Electron 45 sa po npm ci stiahne oficiálnym install-electron skriptom.

build/icon.svg je zdroj ikony; PNG a ICO sú pripravené pre balík. Konfigurácia electron-builder.json obsahuje iba desktop host, offline HTML a produkčné závislosti. Zdrojové testy, pracovné adresáre ani build nástroje sa nebalia do aplikácie.

## GitHub vydávanie

Workflow Build Windows installer beží pri relevantnej zmene na main alebo pri ručnom spustení. Nainštaluje uzamknuté závislosti, overí zdroje a hru, vytvorí NSIS, skontroluje feed a SHA-512 a spustí zabalenú aplikáciu s oddeleným testovacím profilom. Potom uloží CI artefakt a vytvorí stabilné vydanie vX.Y.Z na presnom commite vrátane troch aktualizačných súborov.

Existujúce vydanie rovnakej verzie sa neprepisuje. Ďalšia desktopová aktualizácia vyžaduje zvýšenie verzie cez existujúci release postup. package-lock sa aktualizuje spolu s package.json. GitHub token sa používa iba v publikačnom kroku workflowu, nikdy v hre. Samotná browserová distribúcia naďalej zostáva v oboch dist HTML.

Voliteľné CI secrets WINDOWS_CSC_LINK a WINDOWS_CSC_KEY_PASSWORD umožňujú vlastníkovi pridať Authenticode podpisovanie. Bez nich sa vytvorí nepodpísaný inštalátor.

## Izolácia a fullscreen

Host má contextIsolation, sandbox a vypnutý nodeIntegration. Preload poskytuje iba konkrétne metódy fullscreen a updates; IPC overuje hlavné okno aj jeho hlavný frame. Surové IPC, súborové cesty ani univerzálne spúšťanie príkazov nie sú dostupné rendereru. Navigácie a nové okná sa zamietajú, protokol sprístupní iba herné HTML, sieť renderera je blokovaná CSP.

F10, tlačidlo ⛶ a Esc ovládajú natívny fullscreen cez potvrdené udalosti BrowserWindow. Samostatný browser používa svoj pôvodný Fullscreen API.

## Overenie

Jednotkové testy aktualizácií pokrývajú súbežné kontroly, offline chyby, opakovanie, limity priebehu, explicitnú inštaláciu po dokončení, chybný download, cudzie IPC, vývojový režim, timeout a uloženie pred reštartom. Smoke test na skutočnom zabalenom EXE overuje štart, izoláciu Node, stále origin, preload, spustenie update checku a zachovanie zbrane +9 a Yang po obnovení.

Konečnú inštaláciu budúcej novšej verzie možno overiť až s druhým publikovaným vydaním. Test nepúšťa inštalátor do bežného používateľského profilu; testovacie dáta zostávajú vo work/desktop-smoke-*.

Implementácia používa [electron-builder Auto Update](https://www.electron.build/docs/features/auto-update/) a [NSIS target](https://www.electron.build/docs/nsis/).
