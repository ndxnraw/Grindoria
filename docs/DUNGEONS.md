# Dungeony a bossovia

Dungeony otvor cez Mapy (M) → Dungeony alebo Progres (P) → Dungeony. Vstup vyžaduje živú postavu, ukončený boj, príslušnú úroveň a vstupné. Jedna postava môže mať naraz jednu výpravu; dungeon a pôvodná trhlina sa nedajú kombinovať.

## Lokality

Každá výprava používa oddelenú instanciu 1800 × 1800 s vlastným názvom, podlahou, rozložením, protivníkmi, bossom a korisťou. Bežné mapy ani ich poškodené alebo mŕtve populácie sa nemenia. Tri lokality používajú spoločný inštančný slot `MAPS.dungeon`; pri novej výprave sa vytvorí nová populácia, počas načítania sa obnoví presný uložený stav.

| Dungeon | Vstupná úroveň | Strážcovia | Boss / základné HP | Vstupné |
| --- | --- | --- | --- | --- |
| Hrobka jedovatého kráľa | 20 | 12 hrobkových škorpiónov | Jedovatý kráľ / 4500 | 500 Yang |
| Ľadová pevnosť | 45 | 16 ľadových strážcov | Mrazový titan / 14 000 | 1500 Yang + 1 kľúč |
| Priepasť zabudnutých | 75 | 20 strážcov priepasti | Vládca priepasti / 42 000 | 5000 Yang + 3 kľúče |

Obtiažnosti: Bežná (základné hodnoty), Ťažká (+5 úrovní, ×1,8 HP, ×1,45 poškodenie, ×2 materiálové odmeny), Mýtická (+10 úrovní, ×3 HP, ×2 poškodenie, ×3 materiálové odmeny). Úroveň sa obmedzí na 99. Vstupné sa nemení podľa obtiažnosti a pri odchode sa nevracia.

## Priebeh a stratégia

Najprv poraz všetkých pôvodných strážcov a znič tri pečate. Dovtedy boss nedostáva poškodenie a nezačína svoje útoky. Strážcovia, pečate ani boss sa v tej istej výprave neobnovujú. HUD a panel výpravy ukazujú zostávajúce ciele. Zmena mapy je blokovaná až do návratu cez panel dungeonu.

- **Hrobka:** nepravidelne rozmiestnené škorpióny, jedovaté kaluže pod hráčom a cielené kruhové útoky. Včas opusti označené miesto. Odporúčané aspoň 400 HP a 25 % odolnosť voči jedu.
- **Pevnosť:** ľadoví strážcovia v postupných líniách. Mrazivé polia znižujú skutočnú rýchlosť o 35 %, iba kým v nich hráč stojí. Boss strieda výpady v priamom páse a kruhový útok. Výpad sa vyhýba pohybom bokom. Odporúčané aspoň 1000 HP a obrana 50.
- **Priepasť:** strážcovia v kruhu, temné polia a prstencové rázové vlny. Prstenec zasiahne iba medzi vnútorným a vonkajším okrajom; bezpečná je blízkosť centra alebo priestor za vonkajším okrajom. Odporúčané aspoň 2000 HP a 35 % odolnosť voči temnote.

Útoky majú označenie na podlahe a čas prípravy 1,3–1,6 s. Zásah používa rovnakú geometriu ako značka, existujúce poškodenie a odolnosti hráča. V druhej polovici HP boss skracuje prestávky z 3,5 na 2 s; pod štvrtinou HP zvyšuje poškodenie o 30 %. Pri prvom poklese pod 50 % a 25 % privolá po dvoch pomocníkoch, spolu najviac štyroch na pokus. Bossovia majú samostatné vektorové modely, pulzáciu, reakciu na zásah a prípravnú animáciu.

Polia vznikajú aj počas postupu lokalitou, majú 1,4 s varovanie a trvajú 3–4 s. Zasahujú najviac raz za sekundu. V bezpečnej vstupnej zóne neubližujú. Ústup do bezpečia alebo stealth zruší pripravovaný bossov útok a obnovuje jeho HP o 10 % maxima za sekundu. Smrť používa pôvodnú stratu 10 % Yang; boss sa obnoví na plné HP, polia a pomocníci sa vyčistia. Už porazení pôvodní strážcovia a pečate zostávajú porazení.

## Korisť a opakovanie

Každý boss zaručí jeden unikátny kus cez pôvodný generátor výbavy, s náhodnými bonusmi a pevnou dodatočnou základnou silou:

| Dungeon | Unikát | Dodatočná základná hodnota |
| --- | --- | --- |
| Hrobka | Náramok jedovatého kráľa | +40 max. HP |
| Pevnosť | Štít mrazového titana | +12 obrana |
| Priepasť | Čepeľ zabudnutých | +35 útok |

Bežná obtiažnosť dá Rare, Ťažká Epic. Mýtická dá Legendary pri úrovni protivníka aspoň 50, inak Epic. Unikáty rešpektujú sloty, modely, požadovanú úroveň, náhodné bonusy, výkup a vylepšovanie existujúceho inventára. Materiálová odmena je `(5 + floor(základná úroveň / 5)) × násobiteľ odmeny` úlomkov. Ťažké a Mýtické dungeony a každá Priepasť navyše dávajú 1/2/3 jadrá trhlín podľa obtiažnosti. Hrobka poskytne jeden kľúč na ďalšie výpravy.

Priepasť dá navyše ďalší kus Legendary výbavy. Na Ťažkej má tento bonusový kus 3 % šancu byť Mythic, na Mýtickej 8 %. Po 11 úspešných zabitiach bossa bez Mythic je 12. zaručené; počítadlá sú oddelené podľa obtiažnosti a uložia sa s postavou. Mythic vynuluje príslušné počítadlo. Bežná Priepasť Mythic neposkytuje. Samotná smrť, opustenie ani znovunačítanie výpravy nie sú úspešným pokusom.

Korisť padá fyzicky pri bossovi. Plný batoh ju nepredá ani nezmaže. Pri návrate sa nezdvihnuté predmety prenesú na zem v Meste s rovnakou identitou a pôvodnou expiráciou. Ak by súčet pozemných predmetov presiahol limit 5000, návrat sa zablokuje, kým hráč miesto neuvoľní. Potvrdenie odchodu z nedokončenej výpravy zachová už získanú korisť. Odmena, počítadlo úspechov a pity sa vyplácajú len raz pri skutočnej smrti bossa. Ďalší vstup vytvorí nové ID výpravy a nový pokus o lepšie náhodné bonusy.

## Stav a overenie

`p.career.dungeons` obsahuje schému, sériu, počty dokončení, pity a aktuálnu výpravu. `worldStates.dungeon` uchováva nepriateľov, HP, fázy a plánovaný útok. Výprava uchováva čas a aktívne polia. Panely pozastavia všetky tieto časovače. Načítanie obnoví aj mŕtve jednotky bez respawnu. Postavy majú oddelené výpravy; starým profilom sa doplní prázdny stav. Pôvodné trhliny zostávajú kompatibilné.

Validácia importu kontroluje lokalitu, obtiažnosť, populáciu, identitu výpravy, jediného bossa, tri pečate, odomknutie, stav odmeny, geometriu útokov, unikáty a pity. Dungeony zdieľajú pôvodný pohyb nepriateľov, boj, odolnosti, zásoby, korisť, výbavu, renderer a uloženie; nepridávajú druhý inventár ani výpočet poškodenia.

Regresie: `tests/dungeons.test.cjs`. Ceny, HP a šance sú v `data/dungeons.js`; balans vyžaduje ďalšie hranie s reálnymi buildmi.
