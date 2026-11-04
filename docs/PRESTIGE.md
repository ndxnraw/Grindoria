# Prestíž a endgame

Prestíž sa aktivuje po úrovni 99 cez P → Prestíž, mimo boja a výprav. Level, výbava, bonusy predmetov, schopnosti, biológia aj všetok ostatný progres zostávajú zachované. EXP sa nemenia na ďalšie opakované levelovanie. Nový profil začína bez aktivovanej prestíže.

## Stupne

| Stupeň | Podmienky postupu | Nový trvalý bonus | Jednorazové znaky |
|---|---|---|---:|
| I | Aktivácia na úrovni 99 | +40 HP | 5 |
| II | Prestížna hrobka I+, 5 Metinov Lv.95+ po aktivácii, tri schopnosti stupňa 10+ | +4 obrana | 10 |
| III | Prestížna pevnosť II+, traja prestížni bossovia, jedna maximálna schopnosť | +6 útok, +8 sila kúziel | 15 |
| IV | Prestížna priepasť III+, všetkých 8 biologických etáp, tri získané dungeonové unikáty | +6 rýchlosť pohybu | 20 |
| V | Všetky tri prestížne dungeony IV+, 25 porazených druhov bestiára vrátane šiestich nových bossov, všetkých 6 schopností školy na maxime, Legendary alebo Mythic zbraň +9 | +3 % útok, +5 % odolnosť voči všetkým typom poškodenia | 25 |

Bonusy stupňov sa sčítavajú. Typové odolnosti stále rešpektujú spoločný strop 75 %. Zvýšenie maximálneho HP nepredstavuje liečenie. Stupeň sa už neznižuje. Každý má vlastnú farbu, rímsku číslicu, znak nad postavou, kruh pri nohách a emblém v portréte. Meno a pravidlá jeho validácie sa nemenia.

## Prestížne dungeony

Používajú existujúce tri lokality a ich vstupné. Vstup cez kartu Prestíž spúšťa mýtický dungeon na úrovni 99 so stupňom aktuálnej prestíže. Bežný vstup cez kartu Dungeony zostáva pôvodný. Rozbehnutá výprava si uloží stupeň a po načítaní nemení obtiažnosť.

Pre prestížneho bossa je základ aspoň 42 000 HP a 300 útok, aby aj pôvodne nízkoúrovňové lokality zodpovedali endgame. Pre stupeň r: zdravie = základ × 3 × (1 + 0,5r), poškodenie = základ útoku × 2 × (1 + 0,2r), materiálový násobok = 3 + r. Najprv treba poraziť strážcov a zničiť tri pečate. Vzácny boss používa pôvodné schopnosti aj dodatočné striedavé prstence a pásy s upozornením 1,8 s. Pole rešpektuje bezpečnú zónu a limit 12 aktívnych mechaník. Frekvencia polí rastie so stupňom.

Porážka bossa dá r znakov prestíže, dungeonový unikát a bonusovú výbavu Legendary. Namiesto bonusovej výbavy môže padnúť Mythic so šancou 8 % + 2r percentuálne body, najneskôr po 12 úspechoch bez Mythic. Používa existujúci mýtický pity danej lokality. Výbava zostáva na zemi až do zdvihnutia; pri odchode sa prenesie do Mesta. Znaky a dokončenie výzvy sa zapíšu raz. Opustenie bez porazenia bossa ich nepridá.

Vyšší stupeň sa musí skutočne absolvovať: predchádzajúce nižšie výpravy ho nenahradia. Počty sa ukladajú podľa lokality a stupňa. Unikát sa započíta až po prijatí do inventára; zostane v zbierke aj po predaji. Staré už vlastnené unikáty sa zachovajú.

## Znaky a ďalšia progresia

- Pasívne tréningy: Odolné telo +15 HP, Pevná obrana +1 obrana, Sústredenie +2 sila kúziel za stupeň. Každý najviac 10; ďalší stupeň stojí 3 × (aktuálny + 1) znakov.
- Od prestíže III možno zdokonaľovať existujúce bonusy nasadenej generovanej Mythic výbavy. Kvalita vybraného bonusu stúpne o 5, najviac na 100; cena 5 + floor(kvalita / 20) znakov. Druhy bonusov, UID, rarita, základná sila a stupeň vylepšenia zostanú zachované. Skutočná hodnota atribútu sa prepočíta existujúcim generátorom.
- Deväť endgame cieľov dá po 20 znakov, každý raz: desať Mythic predmetov +9, Mythic s piatimi maximálnymi bonusmi, maximálne schopnosti, biológia, všetky tri výzvy V, traja rôzni prestížni bossovia, tri unikáty, celý bestiár a všetky pasívne tréningy.

## Dáta a kompatibilita

Všetko patrí do existujúceho profilu p.career.prestige: schema, rank, marks, metins, clears, bosses, uniques, claimed a training. Svet, predmety a schopnosti používajú pôvodné dátové systémy. Neexistuje druhý inventár ani druhá postava pre prestíž.

Staré profily a zálohy bez prestíže sa načítajú s nulovým stupňom a bez spätne pridanej meny. Rozbehnuté pôvodné dungeony zostávajú pôvodné. Export a import prenášajú aj prestíž a rozbehnuté výzvy; neplatné stupne, meny, pasívy, odkazy a výpravy sa odmietnu transakčne. Každá postava má samostatný postup a odmeny.

Definície: data/prestige.js. Pravidlá a validácia: systems/prestige.js. UI, emblémy a ciele: ui/prestige.js. Výpravy rozširujú systems/dungeons.js bez zmeny bežných režimov.
