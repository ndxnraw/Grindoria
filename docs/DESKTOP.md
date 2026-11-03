# Fullscreen a budúca desktopová distribúcia

## Hranie v prehliadači

Tlačidlo ⛶ v minimape alebo F10 požiada o skutočný fullscreen elementu #game-shell. Ten obsahuje Canvas, HUD, inventár, modály aj tooltip koristi. CSS odstráni rámovanie a nastaví výšku aj šírku obrazovky; Canvas sa znovu prepočíta podľa skutočnej veľkosti a hustoty pixelov. Smerovanie vychádza z aktuálneho rámika Canvasu.

Tlačidlo, F10 alebo bežné Esc prehliadača režim ukončia. Stav tlačidla vychádza z udalosti fullscreenchange, nie z predpokladu, že žiadosť uspela. Odmietnutá žiadosť zobrazí informáciu a uvoľní zámok ďalšieho pokusu. Prepínanie vyčistí stlačené klávesy a starý tooltip. Fullscreen možno zapnúť aj pred vstupom do hry alebo pri otvorenom paneli.

## Electron host

Priečinok desktop/ obsahuje funkčný základ hosta pre neskorší balík:

- main.cjs vytvára BrowserWindow a otvára lokálny dist/Grindoria.html.
- preload.cjs poskytuje izolované API window.grindoriaDesktop.fullscreen.
- fullscreen.cjs prepína BrowserWindow.setFullScreen a vracia skutočný stav po enter-full-screen alebo leave-full-screen. Časový limit 5 s ukončí neúspešnú požiadavku; paralelné prechody sa nezamieňajú.

Rozhranie:

| Metóda | Význam |
| --- | --- |
| get() → Promise<boolean> | Aktuálny stav okna |
| set(boolean) → Promise<boolean> | Požiadať o zmenu a počkať na potvrdený stav |
| onChange(callback) → unsubscribe | Zmeny z OS aj ovládania aplikácie |

Renderer neimportuje Electron ani Node a naďalej funguje ako samostatné offline HTML. Host zapína contextIsolation a sandbox, vypína nodeIntegration. Most sprístupňuje iba tri konkrétne operácie, neposkytuje surové IPC objekty. Handler overuje zdrojové okno aj hlavný frame a prijíma iba boolean. Po zatvorení okna odpojí handlery a ukončí prípadný čakajúci prechod. Externé okná a navigácie host neotvára.

V natívnom režime F10 alebo tlačidlo prepína celé okno aplikácie; Esc ho vypne aj z úvodnej obrazovky. CSS native-fullscreen zaplní obsah okna hernou plochou. Browser Fullscreen API sa vtedy nepoužíva.

## Lokálne spustenie hosta neskôr

Najprv vytvor aktuálne dist cez npm run build. V prostredí s nainštalovaným Electron runtime spusti z koreňa repozitára:

~~~sh
electron desktop/main.cjs
~~~

Desktopová distribúcia musí obsahovať desktop/ a dist/ so zachovanými relatívnymi cestami. Výber Electron verzie, tvorba inštalátora, podpisovanie a automatické aktualizácie patria do prípravy neskoršieho balíka. Browser hra nemá novú závislosť a Electron sa pri jej spustení nesťahuje.

## Overenie a hranice

Automatické testy pokrývajú browserové prepnutie a jeho odmietnutie, stav tlačidla, natívny most, Esc, validáciu odosielateľa, skutočné potvrdzovacie udalosti, zatvorenie okna a izolované preload API. Kontrola zdrojov syntakticky overuje aj všetky tri desktopové súbory.

Fullscreen bol ručne overený v prehliadači pri 1920 × 1080 aj návrate pomocou F10. Samostatný Electron runtime ani inštalačný balík zatiaľ neboli spustené; pred distribúciou treba v cieľovom OS overiť jeho celé okno, DPI, Esc a ukončenie aplikácie.

Implementácia vychádza z oficiálnej dokumentácie [BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window), [contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge) a [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation).

## Profily postáv od 0.13.0

Rovnaké offline HTML obsahuje register postáv aj výber. Electron host neudržiava paralelný model hráča. Prenos medzi prehliadačom a aplikáciou používa export/import všetkých postáv. Návrat cez ♙ v minimape funguje aj v celom okne.
