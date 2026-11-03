# Rozhranie a ovládanie

## Spoločný vzhľad

Panely používajú spoločné tmavé povrchy, bezpätkové písmo, rovnaké okraje, zaoblenia, odstupy a tlačidlá. Zlaté tlačidlo je hlavná akcia; červené označuje potvrdenie straty alebo odstránenie. Vybraná záložka má zreteľný rám. Klávesnicový fokus je viditeľný. Hotbar rozlišuje pripravenú schopnosť, cooldown, nedostatok many, pauzu a obmedzenie bezpečnej zóny. Na mobile má dva rady po piatich tlačidlách.

Náklady výroby, tréningu, schopností, kováča, biológa, alchymistických fúzií a obchodu ukazujú množstvá v poradí **Máš / Potrebuješ**. Pod riadkom je „Splnené“ alebo presný počet chýbajúcich kusov. Stav sa neoznamuje iba farbou. Úlohy používajú rovnaké riadky pre aktuálny postup a cieľ; odmena je oddelená.

## Stabilné panely

`modal(html, {key})` zachová pri obnovení toho istého otvoreného panelu posunutie aj fokus identifikovateľného ovládacieho prvku. Zmena panelu, zmena záložky alebo otvorenie po zatvorení začína hore. Obchod používa kľúč konkrétneho obchodníka, inventár vlastný kľúč a progresia kľúč záložky. Hlavné okná majú stabilnú výšku, takže ich predaj posledného predmetu neposunie vertikálne. Tab/Shift+Tab ostávajú v dialógu. Esc zatvorí panel; rozpracované vyhodenie alebo odstránenie najprv iba zruší.

## Vyhodenie z inventára

Potiahni predmet z batohu alebo zo zásob mimo okna inventára, ale do herného okna. Zobrazí sa potvrdenie s názvom, množstvom a časom do zmiznutia koristi. Rovnakú akciu poskytuje tlačidlo **Vyhodiť…**, použiteľné aj klávesnicou a dotykom. Nasadenú výbavu najprv zlož do batohu. Zrušenie ani Esc nič nespotrebujú.

Až potvrdenie prenesie predmet alebo zvolený počet zásob na zem pri postave. Vyhodené zásoby sa nezbierajú automaticky; kliknutie alebo Y ich zdvihne. Výbava aj zásoby zachovávajú štandardnú expiráciu koristi a uložia sa so svetom. Vyhodenie možno potvrdiť len pre aktuálnu postavu, mapu, existujúci predmet a platný počet. Zaplnený limit pozemnej koristi operáciu zablokuje. Po predaji, strate predmetu alebo zmene postavy nemôže staré potvrdenie vytvoriť duplikát.

Pôvodné **Odstrániť…** naďalej znamená trvalé zmazanie a vyžaduje vlastné potvrdenie. Vyhodenie túto akciu nenahrádza.

## Overenie

`tests/ui-standard.test.cjs` pokrýva zachovanie pozície, náklady, potvrdenia, obnovenie vyhodených zásob, ochranu proti duplikácii, Esc a stav hotbaru. Browserová kontrola používa skutočné tlačidlá a drag-and-drop, overuje predaj bez zmeny scrollTop a polohy okna, päť panelov pri úzkej šírke a hranice hotbaru. Vzhľad nevyžaduje externé fonty ani ďalší runtime.
