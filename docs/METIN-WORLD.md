# Svet a skúsenosti

Cestovanie (Tab) zoskupuje oblasti podľa ríší Chunjo, Jinno, Shinsoo a neutrálnych oblastí. Pôvodné lokality Grindorie sú v samostatnej skupine kvôli existujúcim úlohám, biológovi a uloženiam. Mesto slúži ako centrum služieb. Oblasti používajú 2D terén a súbojový systém Grindorie.

- [Mapa sveta](https://cz-wiki.metin2.gameforge.com/index.php/Mapa_sv%C4%9Bta)
- [Súpis príšer](https://cz-wiki.metin2.gameforge.com/index.php/P%C5%99%C3%AD%C5%A1ery)
- [Tabuľky a pravidlá EXP](https://cz-wiki.metin2.gameforge.com/index.php/Body_zku%C5%A1enosti)

Definície v `src/js/data/metin-world.js` spájajú príšery s výskytom, úrovňou, stupňom, základným EXP a údajmi o agresivite. Oblasti bez súpisky sú označené v cestovaní. Príšery s neovereným základným EXP majú v bestiári pomlčku a dočasne nedávajú EXP. Zoznam obsahuje aj záznamy, ktorých výskyt je mimo oblastí z prehľadu sveta. V Červenom lese sú [Metin Tu-Young](https://cz-wiki.metin2.gameforge.com/index.php/Metin_Tu-Young) a [Metin Jeon-Un](https://cz-wiki.metin2.gameforge.com/index.php/Metin_Jeon-Un). Z nich môže padnúť prsteň skúseností.

Základné EXP príšery sa násobí podľa rozdielu úrovní a aktívnych bonusov. Jeden protivník dá najviac 10 % požiadavky na aktuálnu úroveň. Výbava so šancou na bonus EXP pridá pri úspešnom hode 30 %. Za tri štvrtiny ukazovateľa sa postupne udeľujú body vlastností. Po dokončení úrovne pribudne bod schopností, ktorý možno použiť na normálne stupne v knihe schopností.

Prsteň tajomstva v okne postavy zastaví prírastky EXP. Prstene a elixíry z obchodu, koristi a Truhly skúseností sa aktivujú v inventári. Aktívne násobky sa kombinujú. Aktivovaná svetová udalosť pridáva 50 % EXP počas trvania. Truhla skúseností patrí medzi odmeny pôvodných endgame a prestížnych výprav Grindorie. Prístup k spotrebným predmetom a ich ceny sú lokálne pravidlá.

Bežné úrovne končia na 120. Aktuálna verzia používa sólo progresiu. Úrovne šampióna, Yohara, skupinové delenie EXP, manželstvo, mounty a peti nemajú implementáciu. Špeciálne lokality používajú dostupné súpisky. Cechové vojny, svadby, arény a poschodové mechaniky originálnych dungeonov nemajú vlastný režim.

Pri načítaní sa zachová približný percentuálny postup rozpracovanej úrovne. Úroveň, body a naučené schopnosti sa nemenia. Výbava má požadovanú úroveň, základné atribúty, vylepšenie a voliteľné dodatočné bonusy. Pôvodné údaje o rarite sa používajú pri čítaní staršej výbavy kvôli zachovaniu existujúcich bonusov a výkupných hodnôt.
