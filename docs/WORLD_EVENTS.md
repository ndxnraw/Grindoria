# Živý svet a udalosti

Udalosti vznikajú náhodne na piatich bojových mapách. Mesto, dungeony a trhliny používajú pôvodné pravidlá. Jedna mapa má najviac jednu udalosť naraz; ostatné bežné spawny zostávajú zachované.

## Výskyt

Prvá kontrola nasleduje po 90 sekundách aktívneho času mapy, ďalšie po náhodných 120–180 sekundách. Každá kontrola používa nasledujúce absolútne pravdepodobnosti; zvyšných 49,5 % znamená pokoj. Šanca sa nenásobí počtom snímok.

| Udalosť | Šanca pri kontrole | Trvanie | Cieľ |
|---|---:|---|---|
| Elitná hliadka | 20 % | 5 min | Päť elitných hliadkarov |
| Prepad lovcov | 12 % | 6 min | Vzácny veliteľ a štyria elitní lovci |
| Žatva materiálov | 10 % | 4 min | Bonusové materiály z farmenia |
| Prastarý strážca | 3,5 % | 7 min | Náhodne umiestnený vzácny boss |
| Vzácny Metin | 2,5 % | 6 min | Odolnejší kameň s vlastným označením |
| Skryté ruiny | 1,5 % | 8 min | Nájsť dočasnú lokalitu |
| Démonický sprievod | 1 % | 7 min | Päť rôznych protivníkov |

V Šuterlande sa skupiny a bossovia neobjavujú; ich šanca sa neprerozdelí medzi ostatné udalosti. Mapa zostáva bez voľne spawnovaných príšer. Obrancovia vzácneho Metinu používajú pôvodný systém vĺn a jeho limity.

## Nepriatelia a objavovanie

Miesto sa vyberá prirodzene mimo bezpečnej zóny a s odstupom od hráča a živých nepriateľov. Členovia skupiny majú nezávislé pozície okolo spoločného bodu. Bežné eventové príšery sú neutrálne; zásah vyvolá pomoc najviac piatich členov skupiny. Bossovia útočia automaticky a fungujú súčasne s pôvodným bossom mapy.

Démonický sprievod kombinuje veliteľa, jedového lovca, obrneného strážcu, temného bojovníka a stopára s rozdielnymi modelmi, typmi poškodenia alebo odolnosťou. Vzácny Metin má 2,4× životy, silnejší pancier, farebné jadro a kruh. Boss i Metin používajú vlastné meno; úroveň zostáva v paneli cieľa.

Aktívna udalosť má tlačidlo s odpočtom, detail v P → Udalosti a odkaz v denníku J. Známe miesto je označené na minimape. Ruiny sa odhalia až do 420 jednotiek; návšteva do 90 jednotiek udelí odmenu a zapíše objav do existujúceho discovery.eventPlaces. Pôvodné tri stále skryté miesta a ich odmeny zostávajú zachované.

## Odmeny a koniec

Úspešné porazenie členov udalosti dá obvyklé dropy nepriateľov a jednorazový bonus. Patrola a lovci pridajú 300 × mierka mapy Yang a pri primeranom cieli 5 rudy a 1 kameň vylepšenia. Boss a Metin pridajú 1000 × mierka Yang, ostatné dokončené aktívne ciele 300 × mierka; primeraný boss, Metin alebo ruiny pridajú 12 rudy a 3 kamene vylepšenia.

Primeraný boss, vzácny Metin, ruiny a démonický sprievod navyše zaručia jeden predmet: Epic do Lv.49, Legendary od Lv.50; od Lv.75 je namiesto neho 4 % Mythic. Používa sa úroveň udalosti, nie úroveň hráča. Slabé udalosti nedávajú vysokolevelovej postave bonusovú výbavu ani materiály. Bežný drop nepriateľa sa nemení.

Žatva materiálov platí pre celú mapu: primeraná voľná príšera má navyše 50 % na jednu rudu a 10 % na kameň vylepšenia. Obrancovia Metinov, kamene a slabé ciele tieto bonusy nedajú. Udalosť neudeľuje odmenu za nečinnosť ani bonus pri uplynutí času.

Zásoby a Yang sa pripíšu priamo s malým hlásením; výbava ostáva na zemi pre klik alebo Y. Pri expirácii nezabití eventoví nepriatelia a ich posily zmiznú bez EXP a dropu. Existujúca korisť sa neodstráni. Udalosť neobnovuje svojich porazených členov. Dokončenie aj história sa zapíšu raz.

## Ukladanie a kompatibilita

Každá snímka v existujúcom worldStates ukladá voliteľné events: schému, mapu, vlastný stav generátora náhody, čas ďalšej kontroly a aktívnu udalosť. Nepriatelia používajú pôvodný zoznam mobs a stabilné eventové ID. Cestovanie a reload zachovajú čas, HP, porazených členov, obrancov Metinu aj pôvodnú korisť. Ostatné mapy, pauza a offline hra čas pozastavia. Trhlina uchová normálny chrám aj s jeho udalosťou a odstráni ju iba z aktívnej expedície.

career.worldEvents drží len sériu ID a dokončené typy; objavy ruín rozširujú existujúce discovery. Všetko patrí konkrétnej postave a prenáša sa existujúcim exportom a importom. Staré profily bez udalostí sa načítajú bez straty dát a bez spätne pridanej odmeny. Import odmietne neplatné typy, časy, mapy, ID, populácie, čítače a objavy transakčne.

Definície: data/world-events.js. Plánovanie, odmeny a validácia: systems/world-events.js. UI a denník: ui/world-events.js. Modelové doplnky, ruiny a značky: render/world-events.js.

## Lokálne hranice od 0.30.0

Úroveň udalosti neprekročí hornú hranicu mapy. Vzácnosť mení zdravie, poškodenie a odmeny pri rovnakej úrovni. Šuterland povoľuje iba vzácny Metin a skryté ruiny; Žatva materiálov sa tam neplánuje, pretože neobsahuje vhodné voľné príšery. Starý nesplniteľný stav sa pri načítaní zruší bez falošnej odmeny. Bossovia nových máp používajú existujúce registrované relikvie podľa regiónu.
