# Inventár a vybavenie

Panel **I** pozastaví hru a otvorí tmavé okno s bronzovým rámovaním. Vlastné vektorové ikony sú vložené priamo v hre, takže fungujú aj v jedinom offline HTML. Rozhranie je inšpirované klasickými MMORPG a nepoužíva pôvodné grafické súbory Metin2.

## Mriežka a ovládanie

- **Predmety:** dve strany po 5 × 9 políčok, spolu 90. Viacpolíčkový predmet nemôže presahovať okraj ani prechádzať medzi stranami.
- **Zásoby:** samostatná mriežka pre elixíry, plášte, materiály a vyrobené alchymistické kamene. Každý typ tvorí jeden zásobník bez limitu 200 kusov; zobrazuje skutočné uložené množstvo.
- Presunutie myšou alebo výber predmetu a následné kliknutie na prázdne políčko zmení jeho pozíciu. Výmena dvoch predmetov je možná, ak sa oba zmestia na nové miesto.
- Presunutie na zodpovedajúci slot alebo **Nasadiť** vybaví postavu. **Zložiť výbavu** vráti predmet do batohu, iba ak má dosť súvislého miesta.
- Dvojklik predmet použije alebo nasadí. Detail a tooltip ukazujú názov, vzácnosť, stupeň, vylepšenie, rozmery, bonusy a predajnú cenu. Na dotyku tieto informácie zostávajú v paneli detailu.
- **Zoradiť** usporiada výbavu podľa veľkosti, vzácnosti, stupňa a názvu; zásoby podľa názvu. Ak nové rozloženie nemožno umiestniť, pôvodné ostáva zachované.
- **Predať** prevedie predmet na zlato. **Odstrániť…** vyžaduje samostatné potvrdenie; pri zásobníku možno určiť presný počet kusov.

Elixír možno vypiť aj v otvorenom inventári. Plášť uzavrie inventár a použije sa v hernom svete; rešpektuje ochranu útočiska aj obnovu. Použitie materiálu otvorí príslušnú časť progresie a samo osebe ho nespotrebuje.

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

`p.bag` naďalej obsahuje výbavu, teraz aj trvalé `uid` a počiatočné `cell`. `p.equipped` používa vyššie uvedených desať slotov. `p.inventory` uchováva schému, počet strán, poradové číslo identity a pozície zásobníkov. Počty zásob zostávajú v pôvodných `p.potions`, `p.braveryCapes`, `p.career.materials` a `p.career.alchemy.stock`; nejde o druhé kópie tých istých zdrojov.

Migrácia zachová mená, bonusy, vzácnosť aj vylepšenia starých predmetov a rozloží ich do mriežky. Ak starý batoh potrebuje viac miesta, dostane dodatočné strany; predmety sa nevymažú ani automaticky nepredajú. Bežný nový drop strany nepridáva. Pri plnom batohu zostáva korisť z nepriateľa alebo kameňa na zemi, bez automatického predaja. Podrobnosti ručného zbierania opisuje [LOOT.md](LOOT.md). Výslovne vyzdvihnuté odmeny úloh naďalej používajú pôvodné pravidlo náhrady za plný batoh.

Presun aj výmena výbavy najprv overia rozloženie. Neplatná operácia ponechá pôvodné predmety a štatistiky. Pozície aj množstvá prežijú uloženie a načítanie hry.

## Boj od 0.10.0

Nová vzácna výbava môže obsahovať typovú odolnosť; zbrane aj kritický zásah. Hodnoty sú percentá, sčítavajú sa zo všetkých slotov a okamžite sa používajú v boji. Staršie predmety si zachovávajú vlastné atribúty. Pozri [COMBAT.md](COMBAT.md).
