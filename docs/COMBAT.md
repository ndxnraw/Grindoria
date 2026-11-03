# Boj a ovládanie Grindoria

## Pohyb a zameranie

WASD a šípky ovládajú pohyb. Klik do voľného priestoru zruší označenie; neútočí ani nevytvára bod presunu. Bez cieľa sa orientácia a čelný výsek útoku priebežne riadia kurzorom. Medzerník opakuje základný útok; úspešný zásah označí živý cieľ bez zapnutia nasledovania.

Klik na živého nepriateľa alebo Metin uloží jeho referenciu a otvorí údaje. Druhý klik na ten istý cieľ zapne nasledovanie a automatický útok, bez časového limitu dvojkliku. Postava sleduje aktuálnu polohu, zastaví vo vzdialenosti 76 jednotiek (luk 420) a útočí v dosahu 95 (luk 500). Prsteň aj panel so zdravím označujú cieľ. WASD, šípky, Esc, smrť cieľa, jeho odstránenie, zmena mapy alebo strata zamerania okna zastavia nasledovanie. Respawn rovnakého objektu ho znovu neoznačí. V otvorenom paneli je simulácia pozastavená.

Klik na korisť má prednosť pred bojom. Zlato a zásoby sa automaticky zbierajú, Y berie dostupnú korisť do 180 jednotiek bez kurzora. F otvorí obchod, M cestovanie; pohyb kliknutím na obchodníka sa nepoužíva.

## Zásahy a odolnosti

Sedem typov: fyzické, prierazné, oheň, jed, blesk, temnota a mágia. Základ zblízka je fyzický, luk prierazný. Smerové útoky zasahujú priestor pred postavou; kruhové schopnosti jej okolie. Šípy majú priamu trajektóriu a zasiahnu prvú kolíziu; vybrané magické strely sledujú označený cieľ. Bez cieľa sa schopnosti dajú zoslať do smeru kurzora, okrem Prepadu vyžadujúceho blízkeho protivníka. Výpady sú aktívne schopnosti a môžu premiestniť postavu.

Útočné poškodenie tvorí základný útok, pri magickom type aj inteligencia a magická výbava, násobiteľ schopnosti, jej stupeň, kombo a pasívne bonusy. Kritický zásah násobí hodnotu 1,8×, potom sa použije rozptyl 0,94–1,06 a typová odolnosť. Metiny pred typovou odolnosťou používajú vlastný pancier a základnú odolnosť. Minimálny úspešný zásah je 1. Liečenie očarovanou čepeľou vychádza zo skutočne odobratého zdravia.

Pri zásahu hráča fyzické poškodenie používa 100 % obrany, prierazné 60 %, ostatné 25 %. Potom sa aplikujú ochranné aury a súčet odolností výbavy a pasívnej schopnosti. Typová odolnosť je obmedzená na 75 %, slabina na −50 %. Kritická šanca je obmedzená na 80 %. Zrušenie kúzla na 8 s znižuje kladnú typovú odolnosť cieľa o 15 percentuálnych bodov a potláča zúrivosť bossa.

Vlci sú slabší voči ohňu, škorpióny voči prieraznému poškodeniu a blesku, yeti voči ohňu a démoni voči blesku a mágii. Boss pridáva 10 percentuálnych bodov k profilu svojej rodiny. Metiny majú osem samostatných profilov. Panel cieľa a Atlas zobrazujú konkrétne hodnoty.

Jed a oheň pôsobia súčasne, každý po 1 s počas 6 s. Obnovenie rovnakého typu predĺži trvanie a ponechá vyššiu silu; nevytvorí ďalší zásobník. Omráčenie obmedzí pohyb a útoky, boss dostáva 40 % jeho trvania. Odhodenie nepremiestňuje Metiny.

## Pasívne schopnosti a kombinácie

Pasívny stupeň 1–4 sa odomyká automaticky na úrovniach 10, 25, 50 a 75. Pred úrovňou 10 je bonus nulový. Platí iba zvolená škola.

Kombo tvoria dve úspešné aktivácie v správnom poradí do 4 s aktívnej simulácie. Posilní poškodenie alebo liečenie druhej schopnosti. Neúspešný pokus pre nedostatok many, cooldown či vzdialenosť kombináciu nespotrebuje. Každá prijatá iná schopnosť začne nové poradie. Panel nad lištou ukazuje nasledujúci kláves a zostávajúci čas.

### Telesná sila

**Bojový rytmus:** Fyzické poškodenie +3 % za stupeň. Tri úspešné základné zásahy do rovnakého cieľa pripravia zosilnenie najbližšej útočnej schopnosti.

Kombo **Búrka čepelí**: R Aura meča → Q Vírenie meča; +25 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Vírenie meča | physical | Úder do všetkých nepriateľov okolo teba. | 20 | 7 s |
| R | Aura meča | podpora | Na 12 s zvýši útok o 45 %. | 24 | 16 s |
| T | Zúrivosť | podpora | Na 10 s zrýchli útoky a pohyb, ale prijímaš o 20 % viac škody. | 20 | 18 s |
| V | Prudký výpad | physical | Výpad k cieľu a krátke omráčenie. | 18 | 8 s |
| U | Trojitý sek | physical | Tri rýchle zásahy do blízkeho cieľa. | 16 | 6 s |
| O | Životná sila | physical | Silný úder; spotrebuje aj 8 % maximálneho zdravia. | 30 | 12 s |

### Mentálna sila

**Neústupnosť:** Fyzická odolnosť +6 % na prvom stupni, potom +2 % za ďalší stupeň.

Kombo **Rozbitá obrana**: T Dupnutie → Q Prerážajúci úder; +25 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Prerážajúci úder | physical | Prerazí nepriateľov v priamke. | 20 | 7 s |
| R | Silné telo | podpora | Na 12 s zvýši obranu a zníži prijatú škodu. | 25 | 18 s |
| T | Dupnutie | physical | Plošný úder s omráčením. | 22 | 9 s |
| V | Úder mečom | physical | Vlna sily omráči vzdialený cieľ. | 18 | 7 s |
| U | Silný úder | physical | Silný čelný úder s odhodením. | 17 | 6 s |
| O | Guľa meča | physical | Výbuch sily v mieste cieľa. | 28 | 11 s |

### Boj s dýkami

**Tichý lovec:** Kritický zásah +1 % a odolnosť voči jedu +6 % za stupeň.

Kombo **Tichá čepeľ**: U Maskovanie → Q Prepad; +20 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Prepad | piercing | Zblízka zasadí silný úder. Z neviditeľnosti má dvojitú silu. | 18 | 7 s |
| R | Rýchly útok | physical | Prudko sa priblížiš k cieľu. | 18 | 7 s |
| T | Jedovatý oblak | poison | Oblak zraní a otrávi nepriateľov na 6 s. | 24 | 10 s |
| V | Víriaca dýka | physical | Kotúľ vpred a útok okolo cieľa. | 22 | 8 s |
| U | Maskovanie | podpora | Na 8 s ťa príšery nevidia. Útok maskovanie ukončí. | 20 | 17 s |
| O | Zákerný jed | poison | Výpad s otravou na 6 s. | 25 | 10 s |

### Lukostreľba

**Presná muška:** Prierazné poškodenie +4 % za stupeň.

Kombo **Jedovatý výbuch**: R Jedovatý šíp → Q Ohnivý šíp; +25 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Ohnivý šíp | fire | Ohnivý šíp exploduje a spôsobí popálenie. | 20 | 7 s |
| R | Jedovatý šíp | poison | Vzdialený cieľ otrávi na 6 s. | 20 | 8 s |
| T | Dážď šípov | piercing | Zasiahne až päť cieľov. | 28 | 10 s |
| V | Opakovaná streľba | piercing | Tri šípy na jeden cieľ. | 22 | 8 s |
| U | Ľahká chôdza | podpora | Na 12 s zrýchli pohyb. | 20 | 16 s |
| O | Iskra | lightning | Svetelný lúč zasiahne cieľ a omráči ho. | 27 | 11 s |

### Zbraňová mágia

**Runová oceľ:** Temné poškodenie +3 % a fyzická odolnosť +2 % za stupeň.

Kombo **Runový prielom**: U Strach → Q Úder prstom; +25 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Úder prstom | dark | Prekliata ruka vytvorí prudkú explóziu pred tebou. | 20 | 7 s |
| R | Dračie vírenie | dark | Temné tornádo zasiahne okolie a odhodí nepriateľov. | 25 | 9 s |
| T | Očarovaná čepeľ | podpora | Na 12 s zvýši útok a vracia 15 % spôsobenej škody ako zdravie. | 25 | 17 s |
| V | Očarovaná zbroj | podpora | Na 12 s zvýši obranu a odráža časť škody. | 24 | 18 s |
| U | Strach | podpora | Na 10 s spomalí blízke príšery a zníži ich poškodenie. | 22 | 17 s |
| O | Zrušenie kúzla | dark | Zasiahne cieľ a na 8 s potlačí zúrivosť bossa. | 25 | 10 s |

### Čierna mágia

**Temná vôľa:** Odolnosť voči temnote +5 % a maximálna mana +15 za stupeň.

Kombo **Temný požiar**: R Temná guľa → T Ohnivý úder; +25 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Temný úder | dark | Rýchla strela temnej energie. | 18 | 6 s |
| R | Temná guľa | dark | Veľká temná guľa s plošným výbuchom. | 28 | 10 s |
| T | Ohnivý úder | fire | Explózia plameňov okolo teba. | 23 | 8 s |
| V | Duch plameňa | podpora | Na 12 s vyvolá ducha, ktorý každých 1,5 s útočí na najbližší cieľ. | 30 | 18 s |
| U | Temná ochrana | podpora | Na 12 s znižuje škodu o tretinu; časť zásahu spotrebuje manu. | 25 | 18 s |
| O | Úder ducha | dark | Temný duch zasiahne cieľ a spomalí ho na 4 s. | 22 | 8 s |

### Dračia sila

**Dračia krv:** Ohnivé poškodenie a odolnosť voči ohňu +4 % za stupeň.

Kombo **Dračí rozsudok**: O Dračia sila → T Strieľajúci drak; +25 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Dračí rev | fire | Dračí kruh spáli okolie a zanechá popálenie. | 25 | 9 s |
| R | Lietajúci talizman | arcane | Vyšle letiaci talizman na cieľ. | 16 | 6 s |
| T | Strieľajúci drak | fire | Ohnivý drak zasiahne nepriateľov pred tebou. | 23 | 8 s |
| V | Požehnanie | podpora | Na 12 s zníži prijatú škodu o 30 %. | 22 | 17 s |
| U | Odraz | podpora | Na 12 s odrazí 35 % prijatého zásahu útočníkovi. | 22 | 17 s |
| O | Dračia sila | podpora | Na 12 s zvýši šancu na kritický zásah o 25 %. | 25 | 17 s |

### Liečenie

**Čistá myseľ:** Liečenie a odolnosť voči bleskom +4 %, obnova many +0,5 za sekundu za stupeň.

Kombo **Obnovujúci prúd**: U Rýchlosť → V Vyliečenie; +25 %.

| Kláves | Schopnosť | Typ | Účel | Mana | Obnova |
| --- | --- | --- | --- | --- | --- |
| Q | Vrh blesku | lightning | Blesk zasiahne vzdialený cieľ. | 17 | 6 s |
| R | Privolanie blesku | lightning | Búrka zasiahne okolie cieľa a krátko omráči. | 28 | 10 s |
| T | Bleskový pazúr | lightning | Reťaz bleskov preskočí až na štyroch nepriateľov. | 23 | 8 s |
| V | Vyliečenie | podpora | Obnoví 45 + 5 za úroveň + 4 za inteligenciu zdravia. | 25 | 8 s |
| U | Rýchlosť | podpora | Na 12 s zrýchli pohyb a obnovovanie many. | 20 | 16 s |
| O | Zvýšenie útoku | podpora | Na 12 s zvýši silu útokov o 35 %. | 22 | 17 s |

Bojový rytmus potrebuje tri skutočné základné zásahy do rovnakého cieľa, najviac 3 s medzi zásahmi. Na 5 s pripraví bonus ďalšej útočnej schopnosti 10 % + 3 % za pasívny stupeň; podporná aktivácia ho nespotrebuje.

## Animácie, ukladanie a overenie

Každá zo 48 aktivácií vykresľuje vlastný znak školy a slotu spolu s účinkom útoku, podporou či strelou. Mana sa odpočíta iba pri úspešnej aktivácii, cooldown klesá v aktívnej simulácii a stupeň schopnosti ho skracuje podľa existujúcej progresie. K otvorí knihu s účelmi, nákladmi a pasívnym bonusom; C bojový manuál a aktuálne odolnosti hráča.

Uložené vybavenie a progres ostávajú kompatibilné. Súbežné poškodenia sa pri snímkovaní hlboko kopírujú, aby neaktívna mapa nezdieľala časovače s aktívnou. Cieľ, kombo, rozletené strely a animácie sa neukladajú.

Testy battle-controls.test.cjs overujú smerovanie, živé nasledovanie, rušenie cieľa, trajektórie, typové poškodenie a výbavu, pasívne stupne, kombá, súbežný jed a oheň aj 48 animácií s manou a cooldownmi. Vizuálna kontrola vyžaduje prehliadač.

## Prehľadnosť od 0.11.0

Smerová šípka pri postave sa nevykresľuje; orientáciu určuje kurzor a smer zbrane. Označený nepriateľ si zachováva prsteň a značku cieľa. Náhľad koristi vyžaduje 0,55 s bez pohybu kurzora; prebehnutie myšou počas mierenia ho resetuje. F10 alebo tlačidlo ⛶ v minimape prepína celú obrazovku.

## Automatická pomoc od 0.12.0

Tri prepínače nad hotbarom sú nezávislé a ukladajú sa do p.combatAssist; starý postup ich má predvolene vypnuté. Automierenie iba pri útoku vyberá najbližší živý cieľ do 500 jednotiek bez čelného obmedzenia. Nevyberá ciele v bezpečnej zóne. Ručne označený cieľ má prednosť; asistencia nevytvára cieľ nasledovania ani sama nespúšťa základný útok. V pokoji sa postava otáča podľa kurzora.

Autospell používa existujúce castSkill, skutočné cooldowny, dosah a cenu many. Vyžaduje živý ručne označený cieľ do 500 jednotiek a skutočný boj s ním v posledných 8 sekundách. Samotné približovanie sa k vzdialenému cieľu nestačí; neoznačené ciele, pokojové liečenie a buffovanie automatiku nespúšťajú. Rotuje šesť schopností s odstupom 0,8 s, čaká na dokončenie animácie a uprednostní dostupné dokončenie komba. Aktívne aury neopakuje. Vyliečenie uprednostní pod 65 % maximálneho zdravia; Životnú silu nespustí pri 35 % alebo menej. Výpady a kotúľanie môžu premiestniť postavu rovnako ako pri ručnom použití. Nedostupné schopnosti preskočí bez opakovaných hlášok o mane.

Pred začatím hry, pri pauze, smrti, v bezpečnej zóne, pri strate zamerania okna alebo skrytom tabe asistencia nič nové nezosiela. Po návrate do aktívneho okna pokračuje. Esc pri zavretom paneli zruší cieľ aj oba prepínače a uloží vypnutý stav. Esc v natívnom fullscreene navyše ukončí celú obrazovku. Pri browserovom fullscreene môže prvý Esc spracovať sám prehliadač.

Hotbar po použití schopnosti, elixíru či plášťa vráti fokus Canvasu bez posunu stránky. Medzerník počas hry funguje aj pri zameranom tlačidle; bežné písanie v textovom poli a klávesy dialógu pri pauze zostávajú natívne.

Autoelixíry pod 45 % HP spotrebujú jeden elixír a doplnia najviac 65 HP. Spoločný cooldown 4 sekundy platí pre E, hotbar, inventár aj automatiku a ukladá sa s postavou. Automatika čaká pri pauze, neaktívnom okne a v bezpečnej zóne; neoživuje. Každý panel sa zatvára aj primárnym kliknutím na pozadie mimo jeho karty.
