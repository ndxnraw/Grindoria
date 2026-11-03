# Korisť na zemi a zbieranie

Všetka korisť z nepriateľov a kameňov osudu najprv fyzicky vyletí z porazeného cieľa a po 0,65 sekundy dopadne na zem. Každý drop má vlastnú ikonu, pozíciu a identitu. Stack môže predstavovať viac kusov toho istého predmetu.

## Zbieranie

Od verzie 0.8.1 platia tieto pravidlá:

- **Zlato a zásoby** sa po dopade zbierajú **automaticky v dosahu 180 herných jednotiek**. Zahŕňa to elixíry, plášte, materiály, biologické vzorky, kľúče a vyrobené alchymistické kamene. Plná mriežka výbavy ich neblokuje.
- **Y** jedným stlačením pozbiera **všetky dostupné dopadnuté predmety v rovnakom okolí**, vrátane výbavy a relikvií. Kurzor môže byť kdekoľvek alebo mimo hernej plochy; hover sa nevyžaduje.
- **Ľavé kliknutie** na konkrétny predmet ho naďalej zdvihne samostatne. Dotyk funguje rovnako.

Postava musí byť živá a hra nesmie byť pozastavená. Padajúce a vzdialené predmety zostávajú na mieste. Hromadné zbieranie postupuje od najbližších predmetov. Ak sa časť výbavy nezmestí do inventára, zostane na zemi; zbieranie pritom pokračuje pri ďalších predmetoch, ktoré sa zmestia, a pri relikviách. Výbava ani relikvie sa samotnou blízkosťou nezdvihnú. Pravé tlačidlo predmety nezbiera.

Kláves **Y** je vyhradený zbieraniu; štvrtá schopnosť zostáva na **V**. Celá šestica je **Q R T V U O**. Označenie na lište, v návode a knihe schopností je zhodné.

Výbava sa vloží do mriežky, zásoby sa pripočítajú k existujúcemu zásobníku, zlato k peňaženke a relikvia do zbierky. Pri plnom inventári zostane výbava na zemi bez automatického predaja. Zbieranie neznamená automatické nasadenie. Hromadná akcia aktualizuje HUD a uloží stav iba raz za celú dávku.

EXP, počítadlá úloh, prax schopností a body špecializácie sa započítajú pri zabití. Odmeny ručne vyzdvihnutých úloh a ručne dokončených výprav či výroby zostávajú priamou odmenou za túto výslovnú akciu.

## Náhľad a porovnanie

Kurzor nad ikonou otvorí tooltip s názvom, ikonou, raritou, požadovanou úrovňou a druhom predmetu. Výbava uvádza základný atribút, hodnotu vylepšenia, dodatočné bonusy, špeciálne vlastnosti a informáciu, či ju postava dokáže vybaviť. Ak nemá žiadne bonusy alebo špeciálne vlastnosti, náhľad to uvedie.

Pri použiteľnej výbave sa automaticky porovná celý súčet atribútov s aktuálnym predmetom toho istého slotu. Zahŕňa základ, vylepšenie aj bonusy. Prázdny slot má nulové hodnoty. Zvýšenia sú zelené so znamienkom plus, zníženia červené so znamienkom mínus a nezmenené hodnoty sivé; informáciu teda neprenáša iba farba.

Nová výbava vyžaduje úroveň zodpovedajúcu jej stupňu. Predmet možno zdvihnúť aj skôr, ale nasadenie rešpektuje požadovanú úroveň a prípadné obmedzenie povolania. Existujúca výbava bez poľa `requiredLevel` si zachováva použiteľnosť od úrovne 1.

Tooltip sa prepočítava pri pohybe kurzora, kamery, postavy, zmene výbavy aj veľkosti okna. Pri okrajoch sa preklopí, zachová odstup od kurzora a zostáva v obrazovke. Pri malej dostupnej ploche sa jeho maximálna výška obmedzí na voľný priestor.

## Uloženie

Drop sa ukladá do snímky mapy vrátane celého predmetu, počtu, polohy a jedinečného `id`. Neaktívna mapa korisť zachová. Pri načítaní sú uložené predmety už dopadnuté; nedostanú novú náhodnú pozíciu. Po aktivácii mapy sa na zlato a zásoby uplatní automatické zbieranie v dosahu.

Staršie nepozbierané zlaté kôpky sa premenia na dropy zbierateľné podľa aktuálnych pravidiel pri zachovaní hodnoty. Obsah inventára sa spätne nemení. Zdvihnutý drop sa zo snímky odstráni a opakovaný pokus s rovnakou identitou nepridá ďalšiu odmenu.

Trhlina má samostatnú korisť. Nepozbierané predmety sa pri jej ukončení prenesú späť do bežného chrámu popri jeho pôvodnej koristi, bez duplikovania. Korisť nemá časovač automatického zmiznutia.

Logiku spravuje `systems/loot.js`, vykreslenie `render/loot.js` a tooltipy `ui/loot.js`. SVG ikony sú rovnaké ako v inventári a načítavajú sa z vložených dát, bez siete. Vykresľujú sa iba predmety vo viditeľnej oblasti; obrázky ikon sa zdieľajú cez cache.
