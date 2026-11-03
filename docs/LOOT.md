# Korisť na zemi a ručné zbieranie

Od verzie 0.8.0 sa korisť z nepriateľov ani kameňov osudu nezbiera automaticky. Výbava, zlato, elixíry, plášte, materiály, biologické vzorky, kľúče aj relikvie fyzicky vyletia z porazeného cieľa a po 0,65 sekundy dopadnú na zem. Každý drop má vlastnú ikonu, pozíciu a identitu. Stack môže predstavovať viac kusov toho istého predmetu.

## Zbieranie

1. Klikni **ľavým tlačidlom** priamo na predmet.
2. Alebo ponechaj **kurzor nad predmetom a stlač Y**.

Postava musí byť živá, hra nesmie byť pozastavená a predmet musí byť dopadnutý v dosahu **180 herných jednotiek**. Zo vzdialenejšieho miesta hra vyzve na priblíženie; pohyb sám predmet nezdvihne. Prejdenie cez korisť, držanie Y či pravé tlačidlo nič nezbierajú. Jedna platná akcia vyzdvihne presne jeden drop. Dotyk na predmet funguje rovnako ako ľavé kliknutie.

Kláves **Y** je vyhradený zbieraniu; štvrtá schopnosť je teraz na **V**. Celá šestica je **Q R T V U O**. Označenie na lište, v návode a knihe schopností je zhodné.

Výbava sa vloží do mriežky, zásoby sa pripočítajú k existujúcemu zásobníku, zlato k peňaženke a relikvia do zbierky. Pri plnom inventári zostane predmet na zemi. Nevykonáva sa jeho automatický predaj ani presun do iného úložiska. Zbieranie neznamená automatické nasadenie.

EXP, počítadlá úloh, prax schopností a body špecializácie sú postup postavy, preto sa započítajú pri zabití. Odmeny ručne vyzdvihnutých úloh a ručne dokončených výprav či výroby zostávajú priamou odmenou za túto výslovnú akciu.

## Náhľad a porovnanie

Kurzor nad ikonou otvorí tooltip s názvom, ikonou, raritou, požadovanou úrovňou a druhom predmetu. Výbava uvádza základný atribút, hodnotu vylepšenia, dodatočné bonusy, špeciálne vlastnosti a informáciu, či ju postava dokáže vybaviť. Ak nemá žiadne bonusy alebo špeciálne vlastnosti, náhľad to uvedie.

Pri použiteľnej výbave sa automaticky porovná celý súčet atribútov s aktuálnym predmetom toho istého slotu. Zahŕňa základ, vylepšenie aj bonusy. Prázdny slot má nulové hodnoty. Zvýšenia sú zelené so znamienkom plus, zníženia červené so znamienkom mínus a nezmenené hodnoty sivé; informáciu teda neprenáša iba farba.

Nová výbava vyžaduje úroveň zodpovedajúcu jej stupňu. Predmet možno zdvihnúť aj skôr, ale nasadenie rešpektuje požadovanú úroveň a prípadné obmedzenie povolania. Existujúca výbava bez poľa `requiredLevel` si zachováva použiteľnosť od úrovne 1.

Tooltip sa prepočítava pri pohybe kurzora, kamery, postavy, zmene výbavy aj veľkosti okna. Pri okrajoch sa preklopí, zachová odstup od kurzora a zostáva v obrazovke. Pri malej dostupnej ploche sa jeho maximálna výška obmedzí na voľný priestor.

## Uloženie

Drop sa ukladá do snímky mapy vrátane celého predmetu, počtu, polohy a jedinečného `id`. Neaktívna mapa korisť zachová. Pri načítaní sú uložené predmety už dopadnuté; nedostanú novú náhodnú pozíciu ani sa automaticky nezdvihnú.

Staršie nepozbierané zlaté kôpky sa premenia na ručne zbierateľné dropy pri zachovaní hodnoty. Obsah inventára sa spätne nemení. Zdvihnutý drop sa zo snímky odstráni a opakovaný pokus s rovnakou identitou nepridá ďalšiu odmenu.

Trhlina má samostatnú korisť. Nepozbierané predmety sa pri jej ukončení prenesú späť do bežného chrámu popri jeho pôvodnej koristi, bez duplikovania. Korisť nemá časovač automatického zmiznutia.

Logiku spravuje `systems/loot.js`, vykreslenie `render/loot.js` a tooltipy `ui/loot.js`. SVG ikony sú rovnaké ako v inventári a načítavajú sa z vložených dát, bez siete. Vykresľujú sa iba predmety vo viditeľnej oblasti; obrázky ikon sa zdieľajú cez cache.
