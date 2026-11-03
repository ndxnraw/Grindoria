# Spawny, farmenie a Plášť statočnosti

## Hustota a spawnovacie body

Štyri pôvodné bojové mapy majú štyri priestorovo oddelené oblasti. Skupinový bod obsahuje šesť pohyblivých príšer. Okrem nich sú v každej oblasti dve miesta pre kamene a jedna vzácna hliadka; samostatný bod patrí bossovi.

| Mapa | Skupinové body | Pohyblivé príšery vrátane hliadok | Kamene | Boss | Všetky body | Všetci nepriatelia |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Údolie | 24 | 148 | 8 | 1 | 37 | 157 |
| Púšť | 28 | 172 | 8 | 1 | 41 | 181 |
| Hory | 28 | 172 | 8 | 1 | 41 | 181 |
| Chrám | 32 | 196 | 8 | 1 | 45 | 205 |

Predtým bolo na mape len 18–24 pohyblivých príšer. Trvalé identifikátory slotov sa opakovane obnovujú; ich celkový počet nekontrolovane nerastie. Skupinové centrá, hliadky aj Metiny sa vyberajú náhodným vzorkovaním v úrovňových oblastiach, bez radov alebo stĺpcov. Kandidáti rešpektujú ochranu útočiska a rozostupy; seed mapy stabilizuje základné rozloženie. Počiatočná aj respawn pozícia príšery sa náhodne vyberá v kruhu 90 jednotiek okolo skupinového centra. Domovské pozície sú mimo chráneného útočiska. Rozostupy skupiny a lokálne vyhýbanie sa obmedzujú skladanie všetkých tiel do jedného bodu.

## Oblasti a úrovne

| Oblasť | Poloha | Údolie | Púšť | Hory | Chrám |
| --- | --- | --- | --- | --- | --- |
| Južné loviská | juhozápad | 1–3 | 8–10 | 18–20 | 35–37 |
| Východné tábory | juhovýchod | 3–5 | 10–12 | 20–22 | 37–39 |
| Severné hliadky | severozápad | 5–7 | 12–14 | 22–24 | 39–41 |
| Územie strážcu | severovýchod | 7–9 | 14–16 | 24–26 | 41–43 |

Ide o úrovne bežných variantov. Elita pridáva 1 úroveň a vzácny variant 2. Boss v severovýchodnej oblasti má úroveň 12, 19, 29 alebo 46 podľa mapy. Kamene a príšery majú silu upravenú podľa oblasti aj variantu. Názov oblasti a úrovne vidíš v teréne, na minimape a v informácii o polohe.

## Varianty a odmeny

Bežný skupinový slot pri prvom vytvorení a po každom skutočnom respawne môže vybrať variant. Začiatočný prvý slot zostáva bežný.

| Variant | Šanca v skupinovom slote | Životy pri danej úrovni | Poškodenie | EXP násobok | Zlato | Respawn |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Bežný | 86 % | 1× | 1× | 1× | 1× | 5 s |
| Elitný | 12 % | 1,8× | 1,35× | 1,35× | 2× | 8 s |
| Vzácny | 2 % | 2,8× | 1,7× | 1,8× | 4× | 20 s |

Každá oblasť má aj jeden samostatný bod vzácnej hliadky. Tá je vždy vzácna a obnovuje sa po 75 sekundách. Kamene sa obnovujú po 18 sekundách, boss po 40 sekundách. Časovače bežia v aktívnom čase mapy, rovnako ako v predchádzajúcej verzii.

Bežná príšera má **3 %** šancu na výbavu (predtým 32 %), elita **20 %** (predtým 75 %). Vzácny variant výbavu zaručí, minimálne vzácnu, s 25 % šancou na epický predmet. Primeraná elita pridá rudu a esenciu, primeraný vzácny nepriateľ aj prach, knihu a tréningovú pečať. Bossovia a vzácne príšery dopĺňajú aj plášte.

Všetky EXP odmeny stále používajú rozdiel úrovní a percentuálne limity z [PROGRESSION.md](PROGRESSION.md). Ani vzácny slabý cieľ nemôže obísť nulovú EXP odmenu alebo neobmedzene vytvárať rozvojové materiály.

## Správanie nepriateľov

Bežné, elitné aj vzácne pohyblivé príšery sú neutrálne. Samotná blízkosť hráča ich neaktivuje. V pokoji sa pohybujú 40 % bojovej rýchlosti v okruhu **85 jednotiek od domova**, vyberajú si nezávislé smery a medzi cestami odpočívajú 1,5–5 sekúnd. Neopúšťajú hranice mapy ani nevstupujú do útočiska. Kamene zostávajú počas života nehybné; pri respawne si vyberú nové miesto vo vlastnej úrovňovej oblasti s odstupom od živých Metinov.

Zásah vyprovokuje obeť a najbližších živých členov tej istej skupiny do vzdialenosti **300 jednotiek**, spolu najviac **päť príšer vrátane obete**. Pomoc sa ďalej nereťazí na susedné skupiny, mŕtvi ani vzdialení členovia sa nepridajú. Opakované zásahy do rovnakej obete nedopĺňajú šiesteho člena k už aktívnej pätici. Aj smrteľný zásah zalarmuje spojencov. Priame plošné zasiahnutie ďalších cieľov a plášť môžu úmyselne vyprovokovať viac než päť nepriateľov; limit sa vzťahuje na automatickú pomoc skupiny.

Vyprovokované príšery sa bránia a prenasledujú hráča; každý ich útok predĺži bojové vyprovokovanie na 8 sekúnd. Pri úteku čas vyprší a vrátia sa domov, po návrate opäť pokračujú v potulovaní. Bežné prenasledovanie má hranicu 700 jednotiek od domova. Bossovia sú výnimka: hráča automaticky napádajú v dosahu 500 jednotiek.

## Metiny a výnimka Šuterlandu

Metiny majú vlastné typy, modely, obranu a dropy. Po zásahu privolávajú agresívne posily podľa svojej úrovne; na príslušnú generáciu kameňa môže byť najviac 8 živých obrancov, na mape spolu 60. Posily sa po smrti samostatne neobnovujú a po 45 sekundách bez zabitia zmiznú bez odmeny. Ich EXP je 35 % bežnej odmeny.

Šuterland má namiesto stálych skupín a bossa presne 99 Metinov úrovní 1–99. Bežné príšery sa tam objavia iba ako posily privolané bojom s kameňom. Podrobné modely, výpočty a individuálne loot pooly opisuje [METINS.md](METINS.md).

## Plášť statočnosti

Základný princíp priťahovania príšer vychádza z [Metin2 Wiki – Bravery Cape](https://en-wiki.metin2.gameforge.com/index.php/Bravery_Cape). Číselné hodnoty nižšie sú vlastným nastavením tejto 2D adaptácie, nie tvrdením o presnom dosahu alebo časovaní originálu.

- **B** alebo tlačidlo s vlajkou použije jeden kus z inventára.
- Dosah je **650 herných jednotiek** v kruhu okolo hráča; vizuálna vlna kopíruje tento kruh v perspektíve mapy.
- Všetky živé pohyblivé príšery v dosahu, vrátane elít, vzácnych a bossa, získajú **18 sekúnd vynúteného prenasledovania**.
- Príšery skutočne kráčajú k aktuálnej polohe hráča počas účinku aj za hranicou bežného prenasledovania. Plášť nie je teleport ani okamžitý zásah.
- Nehybné kamene ani mŕtvi nepriatelia sa nepriťahujú. Nepriatelia mimo dosahu zostanú nezmenení.
- Ďalšie použitie je možné po **2 sekundách**. Počet kusov je viditeľný na lište aj vo výbave (I).
- Platné použitie mimo útočiska spotrebuje kus aj vtedy, keď nie je žiadny vhodný cieľ. Hra oznámi počet pritiahnutých nepriateľov.
- Plášť nefunguje pred začatím hry, pri otvorenom paneli, po smrti ani v chránenom útočisku. Pri odmietnutom použití sa kus nespotrebuje.
- Použitie zruší maskovanie. Návrat do útočiska alebo nové maskovanie preruší vyprovokovanie; po vypršaní účinku pokračuje iba rozbehnutý boj, kým trvá vyprovokovanie. Samotná blízkosť nové aggro nevyvolá.

Korisť najprv dopadne na zem. Zlato a zásoby vrátane plášťov a materiálov sa od verzie 0.8.1 zbierajú automaticky v dosahu 180. Y pozbiera predmety v okolí bez kurzora; konkrétnu výbavu možno zdvihnúť aj kliknutím. Pozri [LOOT.md](LOOT.md).

Nové aj migrované postavy dostanú jednorazovo zásobu 10 kusov. Už uložená nula sa pri načítaní nedopĺňa. Obchodník predáva 10 kusov za 100 zlata. Boss pridá 3 kusy, vzácny nepriateľ 2; bežní a elitní protivníci ich môžu tiež zanechať.

Útočisko je skutočne chránené: z jeho vnútra nemožno používať základné ani útočné kúzla na bezpečné farmenie. Liečenie a podporné aury zostávajú dostupné. Nepriatelia pri pohybe obchádzajú jeho kruhový okraj.

## Ukladanie a kompatibilita

`layoutSchema: 2` prenesie staré pravidelné rozloženie na nové body bez obnovenia zdravia či časovačov smrti. Po migrácii sa polohy uchovávajú. Každý slot má trvalé `spawnId`. Zostáva rovnaký pri smrti aj respawne a pri normálnom načítaní sa neprehadzuje variant či neobnovujú životy. Uloží sa korisť, zostávajúci čas do respawnu a stav populácie. Samotné vyprovokovanie sa po zmene mapy alebo načítaní zruší; spotrebované plášte zostávajú odpočítané.

Staré riedke mapy sa rozšíria pri načítaní. Ich mŕtvi nepriatelia sa prenesú do samostatných nových slotov bez duplikácie odmien a so zachovaným časovačom. Už rozbehnutá trhlina zo staršej verzie si ponechá pôvodnú populáciu do konca výpravy; bežný chrám sa rozšíri po návrate. Nové trhliny využívajú husté spawny a zachovávajú silu variantov pri škálovaní stupňa.

Automatické testy overujú hustotu, hranice dosahu, reálny pohyb pritiahnutých cieľov, spotrebu a uloženie kusov, respawn, odmeny, migráciu a kompatibilitu trhlín. Skupinové farmenie a výkon na rôznych zariadeniach ešte potrebujú spätnú väzbu z hrania.
