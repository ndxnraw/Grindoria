# Inventár a vybavenie

Panel **I** otvorí samostatnú presúvateľnú vrstvu s bronzovým rámom; svet aj ostatné otvorené panely zostanú aktívne. Atribúty a bojové hodnoty sú v okne Postava **C**. Vlastné vektorové ikony sú vložené priamo v hre, takže fungujú aj v jedinom offline HTML. Rozhranie je inšpirované klasickými MMORPG a nepoužíva pôvodné grafické súbory Metin2.

## Mriežka a ovládanie

- **Predmety:** päť strán po 5 × 9 políčok, spolu 225. Viacpolíčkový predmet nemôže presahovať okraj ani prechádzať medzi stranami.
- **Zásoby:** samostatná mriežka pre elixíry, plášte, materiály. Každý typ tvorí jeden zásobník bez limitu 200 kusov; zobrazuje skutočné uložené množstvo.
- Presunutie myšou alebo výber predmetu a následné kliknutie na prázdne políčko zmení jeho pozíciu. Výmena dvoch predmetov je možná, ak sa oba zmestia na nové miesto.
- Presunutie na zodpovedajúci slot alebo **Nasadiť** vybaví postavu. **Zložiť výbavu** vráti predmet do batohu, iba ak má dosť súvislého miesta.
- Dvojklik predmet použije alebo nasadí. Náhľad pri myši alebo zameraní ukazuje názov, vzácnosť, stupeň, vylepšenie, rozmery, bonusy a predajnú cenu. Náhľad porovnáva bonusy s aktuálne nasadeným predmetom rovnako ako pri koristi. Samostatný panel Predmet v inventári neexistuje.
- **Zoradiť** usporiada výbavu podľa veľkosti, vzácnosti, stupňa a názvu; zásoby podľa názvu. Ak nové rozloženie nemožno umiestniť, pôvodné ostáva zachované.
- **Predať** prevedie predmet na zlato. **Odstrániť…** vyžaduje samostatné potvrdenie; pri zásobníku možno určiť presný počet kusov.

Elixír možno vypiť aj v otvorenom inventári. Plášť sa použije bez zatvorenia vrstvy; rešpektuje ochranu útočiska aj obnovu. Použitie materiálu otvorí príslušnú časť progresie a samo osebe ho nespotrebuje.

## Sloty a rozmery

| Slot | Rozmery v batohu | Hlavný bonus |
| --- | --- | --- |
| Zbraň | 1 × 3 | Útok |
| Brnenie | 2 × 3 | Obrana |
| Prilba | 2 × 1 | Obrana |
| Štít | 2 × 2 | Obrana |
| Obuv | 2 × 2 | Rýchlosť pohybu |
| Náramok | 1 × 1 | Maximálne zdravie |
| Náhrdelník | 1 × 1 | Maximálna mana |
| Náušnice | 1 × 1 | Sila kúziel |
| Opasok | 2 × 1 | Obrana |
| Talizman | 1 × 2 | Kritický zásah |

Každý typ padá z bežných zdrojov výbavy v troch vzácnostiach. Nové predmety uvádzajú a kontrolujú požadovanú úroveň; stará výbava bez tejto požiadavky zostáva použiteľná. Všetkých desať slotov možno vylepšovať u kováča. Od cieľového stupňa +4 spotrebuje okrem rudy a zlata aj kamene vylepšenia z Metinov. Rozmery a číselné bonusy predstavujú vlastné nastavenie Grindorie.

Bonusy sa počítajú zo skutočne nasadených predmetov pri útoku, kúzlení, prijatom poškodení aj pohybe. Zloženie predmetu zníži maximá zdravia a many a oreže aktuálne hodnoty na nový limit; opakované nasadzovanie neposkytuje bezplatné liečenie.

## Uloženie a kompatibilita

`p.bag` naďalej obsahuje výbavu, teraz aj trvalé `uid` a počiatočné `cell`. `p.equipped` používa vyššie uvedených desať slotov. `p.inventory` uchováva schému, počet strán, poradové číslo identity a pozície zásobníkov. Počty zásob zostávajú v pôvodných `p.potions`, `p.braveryCapes`, `p.career.materials`; nejde o druhé kópie tých istých zdrojov.

Migrácia zachová mená, bonusy, vzácnosť aj vylepšenia starých predmetov a rozloží ich do mriežky. Ak starý batoh potrebuje viac miesta, dostane dodatočné strany; predmety sa nevymažú ani automaticky nepredajú. Bežný nový drop strany nepridáva. Pri plnom batohu zostáva korisť z nepriateľa alebo kameňa na zemi, bez automatického predaja. Podrobnosti ručného zbierania opisuje [LOOT.md](LOOT.md). Výslovne vyzdvihnuté odmeny úloh naďalej používajú pôvodné pravidlo náhrady za plný batoh.

Presun aj výmena výbavy najprv overia rozloženie. Neplatná operácia ponechá pôvodné predmety a štatistiky. Pozície aj množstvá prežijú uloženie a načítanie hry.

## Boj od 0.10.0

Nová vzácna výbava môže obsahovať typovú odolnosť; zbrane aj kritický zásah. Hodnoty sú percentá, sčítavajú sa zo všetkých slotov a okamžite sa používajú v boji. Staršie predmety si zachovávajú vlastné atribúty. Pozri [COMBAT.md](COMBAT.md).

## Samostatné postavy od 0.13.0

Batoh, desať slotov, rozmiestnenie a zásobníky patria konkrétnemu profilu. UID predmetov sú jedinečné v rámci postavy; pri importe ďalšej postavy sa neprečíslujú. Zmeny sa ukladajú výlučne pod aktívnym ID. Výber, ťahanie a otvorený detail predmetu sa pri prepnutí čistia.

## Vzhľad výbavy

Každý katalógový predmet má odlišnú siluetu podľa rodiny a typu. Nasadenie okamžite zmení náhľad aj postavu vo svete. Úroveň, rarita a vylepšenie menia kovanie a zdobenie. Pozri [APPEARANCE.md](APPEARANCE.md).

## Rarity a bonusy

Tlačidlo Rarity otvorí šance a pravidlá generovania. Nové predmety zobrazujú kvalitu náhodných bonusov, trhový odhad a skutočný výkup obchodníka. Triedenie rešpektuje poradie šiestich rarít; porovnanie zahŕňa aj nové bonusy. Pozri [RARITIES.md](RARITIES.md).

Vyhodenie otvorí samostatné kompaktné okno v strede hernej plochy. Enter potvrdí aj zadané množstvo; Esc alebo Zrušiť nič nespotrebujú. Výbava sa prenesie až po potvrdení a staré potvrdenie pre inú mapu či postavu neplatí.
