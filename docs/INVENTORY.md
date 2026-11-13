# Inventár a vybavenie

Panel **I** otvorí samostatnú presúvateľnú vrstvu s bronzovým rámom; svet aj ostatné otvorené panely zostanú aktívne. Atribúty a bojové hodnoty sú v okne Postava **C**. Vlastné vektorové ikony sú vložené priamo v hre, takže fungujú aj v jedinom offline HTML. Rozhranie je inšpirované klasickými MMORPG a nepoužíva pôvodné grafické súbory Metin2.

## Mriežka a ovládanie

- **Predmety:** päť strán po 5 × 9 políčok, spolu 225. Viacpolíčkový predmet nemôže presahovať okraj ani prechádzať medzi stranami.
- **Zásoby:** samostatná mriežka pre elixíry, plášte, materiály. Každý typ tvorí jeden zásobník bez limitu 200 kusov; zobrazuje skutočné uložené množstvo.
- Predmet presunieš potiahnutím alebo výberom predmetu a cieľového políčka klávesom Enter. Obsadené miesto presun odmietne; ťahaný predmet sa zobrazí červenou. Predmety ani zásoby si nevymieňajú pozície.
- Presunutie na zodpovedajúci slot alebo **Nasadiť** vybaví postavu. **Zložiť výbavu** vráti predmet do batohu, iba ak má dosť súvislého miesta.
- Dvojklik predmet použije alebo nasadí. Náhľad pri myši alebo zameraní ukazuje názov, vzácnosť, stupeň, vylepšenie, rozmery, bonusy a predajnú cenu. Náhľad porovnáva bonusy s aktuálne nasadeným predmetom rovnako ako pri koristi. Samostatný panel Predmet v inventári neexistuje.
- **Zoradiť** usporiada výbavu podľa veľkosti, vzácnosti, stupňa a názvu; zásoby podľa názvu. Ak nové rozloženie nemožno umiestniť, pôvodné ostáva zachované.
- **Predať** prevedie predmet na zlato. **Odstrániť…** vyžaduje samostatné potvrdenie; pri zásobníku možno určiť presný počet kusov.

Elixír možno vypiť aj v otvorenom inventári. Plášť sa použije bez zatvorenia vrstvy; rešpektuje ochranu útočiska aj obnovu. Použitie materiálu otvorí príslušnú časť progresie a samo osebe ho nespotrebuje.

## Sloty a rozmery

| Slot | Rozmery v batohu | Hlavný bonus |
| --- | --- | --- |
| Zbraň | 1 × 2 | Útok |
| Brnenie | 1 × 2 | Obrana |
| Prilba | 1 × 1 | Obrana |
| Štít | 1 × 1 | Obrana |
| Obuv | 1 × 1 | Rýchlosť pohybu |
| Náramok | 1 × 1 | Maximálne zdravie |
| Náhrdelník | 1 × 1 | Maximálna mana |
| Náušnice | 1 × 1 | Sila kúziel |
| Opasok | 1 × 1 | Obrana |
| Talizman | 1 × 1 | Kritický zásah |

Každý typ výbavy môže padnúť z bežných zdrojov. Rovnaká pomenovaná výbava má vždy rovnakú požadovanú úroveň. Pri načítaní staršieho uloženia sa upraví požiadavka rozpoznanej výbavy a zostanú jej bonusy aj vylepšenie. Všetkých desať slotov možno vylepšovať u kováča. Od cieľového stupňa +4 spotrebuje okrem rudy a zlata aj kamene vylepšenia z Metinov. Rozmery a číselné bonusy predstavujú vlastné nastavenie Grindorie.

Bonusy sa počítajú zo skutočne nasadených predmetov pri útoku, kúzlení, prijatom poškodení aj pohybe. Zloženie predmetu zníži maximá zdravia a many a oreže aktuálne hodnoty na nový limit; opakované nasadzovanie neposkytuje bezplatné liečenie.

## Uloženie a kompatibilita

`p.bag` naďalej obsahuje výbavu, teraz aj trvalé `uid` a počiatočné `cell`. `p.equipped` používa vyššie uvedených desať slotov. `p.inventory` uchováva schému, počet strán, poradové číslo identity a pozície zásobníkov. Počty zásob zostávajú v pôvodných `p.potions`, `p.braveryCapes`, `p.career.materials`; nejde o druhé kópie tých istých zdrojov.

Migrácia zachová mená, bonusy, vzácnosť aj vylepšenia starých predmetov a rozloží ich do mriežky. Ak starý batoh potrebuje viac miesta, dostane dodatočné strany; predmety sa nevymažú ani automaticky nepredajú. Bežný nový drop strany nepridáva. Pri plnom batohu zostáva korisť z nepriateľa alebo kameňa na zemi, bez automatického predaja. Podrobnosti ručného zbierania opisuje [LOOT.md](LOOT.md). Výslovne vyzdvihnuté odmeny úloh naďalej používajú pôvodné pravidlo náhrady za plný batoh.

Presun najprv overí celú plochu predmetu vrátane spodného políčka zbrane či brnenia. Neplatná operácia ponechá pôvodné predmety a štatistiky. Pozície aj množstvá prežijú uloženie a načítanie hry.

## Boj od 0.10.0

Typová odolnosť a kritický zásah môžu byť dodatočné bonusy výbavy. Hodnoty sú percentá, sčítavajú sa zo všetkých slotov a okamžite sa používajú v boji. Staršie predmety si zachovávajú vlastné atribúty. Pozri [COMBAT.md](COMBAT.md).

## Samostatné postavy od 0.13.0

Batoh, desať slotov, rozmiestnenie a zásobníky patria konkrétnemu profilu. UID predmetov sú jedinečné v rámci postavy; pri importe ďalšej postavy sa neprečíslujú. Zmeny sa ukladajú výlučne pod aktívnym ID. Výber, ťahanie a otvorený detail predmetu sa pri prepnutí čistia.

## Vzhľad výbavy

Každý katalógový predmet má odlišnú siluetu podľa rodiny a typu. Nasadenie okamžite zmení náhľad aj postavu vo svete. Úroveň a vylepšenie menia kovanie a zdobenie. Pozri [APPEARANCE.md](APPEARANCE.md).

## Rarity a bonusy

Náhľad zobrazuje kvalitu pridaných bonusov, trhový odhad a výkup obchodníka. Inventár triedi podľa rozmeru, požadovanej úrovne a názvu. Údaje o pôvodných raritách opisuje [RARITIES.md](RARITIES.md).

Vyhodenie otvorí samostatné kompaktné okno v strede hernej plochy. Enter potvrdí aj zadané množstvo; Esc alebo Zrušiť nič nespotrebujú. Výbava sa prenesie až po potvrdení a staré potvrdenie pre inú mapu či postavu neplatí.

Výber predmetu už neotvára spodné menu akcií. Porovnanie s vybaveným predmetom používa rovnakú ukážku ako drop: zelené zlepšenie, červené zhoršenie a červený nesplnený požadovaný level. Dvojklik nasadí, zloží alebo použije predmet; presúvanie a potvrdené vytiahnutie mimo okna zostávajú dostupné. Predaj výbavy prebieha pretiahnutím z inventára do okna obchodníka a potvrdením ceny v stredovom okne. Obchodovateľné materiály používajú rovnaký postup s výberom počtu kusov.

Inventár je úzky zvislý panel: vybavenie hore, päť strán batohu pod ním a Yang úplne dole. Ovládanie presunu, použitia a vyhodenia je opísané v H → Inventár a korisť; v inventári sa neopakuje.

Inventár prispôsobuje veľkosť políčok dostupnej výške a šírke obrazovky. Celá aktuálna strana 5 × 9 políčok, výbava, Yang a ovládanie zostávajú viditeľné bez posúvania; kapacita piatich strán sa nemení. Pri presúvaní okna zostávajú jeho rozmery rovnaké. Rozloženie sa prispôsobí pri zmene veľkosti obrazovky.

Vybavenie používa rozloženie podľa Metinu2: zbraň vľavo hore, prilba nad brnením, štít vpravo od brnenia a náramok pod štítom. Náušnice a náhrdelník sú na pravom okraji, talizman vľavo dole, opasok vpravo dole a obuv pod postavou. Prázdne miesta medzi slotmi zostávajú voľné.

Mriežka vypĺňa celú šírku batohu. Zbrane a brnenia zaberajú dve políčka pod sebou; ostatná výbava a zásoby jedno. Pri načítaní sa zachovajú platné pozície aj všetky vlastnosti predmetov.

Opakovaný Enter na vybranom predmete alebo pohyb postavy zruší výber. Pri WASD a šípkach sa zameranie z inventára vráti na hernú plochu; pohyb nezvýrazňuje políčka. Po skončení dragu, zrušení vyhodenia alebo zatvorení inventára sa výber vyčistí vrátane vizuálneho rámika.

## Katalóg zbraní a brnení

Katalóg používa úrovne a základné atribúty výbavy pri +0. Spoločné zbrane majú jednu definíciu s viacerými povolaniami. Zbrane a brnenia z bežnej koristi sa vyberajú pre aktívne povolanie z úrovní do úrovne zdroja. Hra uprednostní rozsah posledných 10 úrovní. Výber výbavy používa skutočnú úroveň zdroja až po aktuálny strop 120.

- Bojovník: [zbrane](https://cz-wiki.metin2.gameforge.com/index.php/V%C3%A1le%C4%8Dn%C3%ADk/Zbran%C4%9B), [brnenia](https://cz-wiki.metin2.gameforge.com/index.php/V%C3%A1le%C4%8Dn%C3%ADk/Brn%C4%9Bn%C3%AD)
- Sura: [zbrane](https://cz-wiki.metin2.gameforge.com/index.php/Sura/Zbran%C4%9B), [brnenia](https://cz-wiki.metin2.gameforge.com/index.php/Sura/Brn%C4%9Bn%C3%AD)
- Ninja: [zbrane](https://cz-wiki.metin2.gameforge.com/index.php/Ninja/Zbran%C4%9B), [brnenia](https://cz-wiki.metin2.gameforge.com/index.php/Ninja/Brn%C4%9Bn%C3%AD)
- Šaman: [zbrane](https://cz-wiki.metin2.gameforge.com/index.php/%C5%A0aman/Zbran%C4%9B), [brnenia](https://cz-wiki.metin2.gameforge.com/index.php/%C5%A0aman/Brn%C4%9Bn%C3%AD)

Zdrojové údaje sú uložené pri každej položke v `src/js/data/metin-equipment.js`. Útok používa polovicu priemeru pôvodného rozsahu, obrana 22 %, sila kúziel 20 % a ploché HP 40 %. Útok a obrana majú strop podľa úrovne predmetu. Percentuálne vlastnosti používajú pravidlá boja Grindorie, napríklad strop rýchlosti útoku. Postih pohybu sa používa v bodoch rýchlosti. Bonus EXP má uvedenú šancu pridať 30 % EXP z príšery. Špecifické účinky Metinu2 bez herného ekvivalentu, napríklad poškodenie proti poloľuďom, a pôvodné náhodné varianty zostávajú iba v zdrojových údajoch.

Obchodník v Meste predáva **Zosilniť predmet** a **Začarovať predmet**. Obe zásoby môžeš potiahnuť z pásu nad batohom na položku v batohu alebo na nasadenú výbavu. Zosilnenie pridá jeden dodatočný bonus, najviac do štyroch. Začarovanie zmení typy aj hodnoty existujúcich dodatočných bonusov a zachová ich počet, aj keď stará výbava obsahuje päť. Základné atribúty a stupeň vylepšenia sa pri oboch akciách zachovajú. Neplatná akcia zásobu neminie.

Predlohy: [Zesílit předmět](https://cz-wiki.metin2.gameforge.com/index.php/Zes%C3%ADlit_p%C5%99edm%C4%9Bt), [Začarovat předmět](https://cz-wiki.metin2.gameforge.com/index.php/Za%C4%8Darovat_p%C5%99edm%C4%9Bt).
