# Mesto, mapy a cestovanie

Mesto má rozmery 1 200 × 1 200, bez nepriateľov. Nové postavy začínajú na námestí. Obchodník je na západe, kováč na východe a biológ na severe. Služba vyžaduje vzdialenosť najviac 170 jednotiek; F otvorí najbližšiu dostupnú službu, klik konkrétne NPC. Bojové mapy obchodníka ani portál nemajú.

Päť bojových máp má 3 200 × 3 200 jednotiek. Malá bezpečná zóna s polomerom 85 je na každej inde: Údolie (360, 280), Púšť (2840, 400), Hory (480, 2750), Chrám (2750, 2760), Šuterland (280, 1560). Je vyznačená kruhom a vlajkami. Vnútri nemožno útočiť; podporné schopnosti zostávajú dostupné. Príšery ju obchádzajú. Príchod a oživenie vedú do bezpečnej zóny danej mapy.

M otvorí cestovanie z ľubovoľného miesta mimo boja. Blokuje ho útok, zásah alebo utrpené poškodenie za posledné 3 sekundy, aktívne aggro, plášť a hroziaci útok bossa. Blízkosť neutrálnej príšery ho neblokuje. Aktívnu trhlinu treba dokončiť alebo opustiť cez progresiu; ukončenie vráti postavu do Mesta.

## Rozširovanie

WORLD_RULES a MAP_LOCATIONS v data/maps.js určujú rozmery, bezpečné zóny, príchody a polohy bossov. NPCS registruje meno, mapu, polohu, farbu a službu NPC. systems/locations.js zdieľa pravidlá dostupnosti služieb a cestovania; render/locations.js vykreslí mesto, NPC a bezpečné zóny. Ďalšie NPC patria do Mesta a majú používať ten istý register.

Snímky mapy ukladajú worldSize. Stav starých máp veľkosti 2000 sa pri načítaní bezpečne prepočíta na 3200: pozícia postavy, koristi a domovy nepriateľov. Pôvodné útočisko sa prevedie na nový bezpečný príchod. Nové rozloženie zachová zdravie, časovače, trvalé identity, obsah koristi a inventár. Označenie worldSize zabraňuje opakovanému zväčšeniu pri ďalšom načítaní. NPC mesto je samostatná lokalita existujúceho systému máp.

## Overenie 0.18.0

193 automatických testov vrátane kováča, zničenia a ochrany, starých registrov a záloh, zväčšenia máp, odmien za obrancov a cestovania. V prehliadači overené: tvorba prvej postavy v Meste, NPC služby, zmena šance talizmanom, vylepšenie so spotrebou pomôcok, zavretie panelu kliknutím mimo, cestovanie a obnovenie pozície, prvý výber a samostatný druhý klik s útokom, odmietnutie cestovania počas boja.
