# Kováč a vylepšovanie

Kováč je v Meste. Príď k nemu a stlač F alebo naň klikni. Vylepšuje nasadenú výbavu vo všetkých desiatich slotoch od +0 po +9. Panel zobrazuje aktuálny aj ďalší bonus, cenu, šancu a následok neúspechu. Každý pokus spotrebuje celú cenu.

| Cieľový stupeň | Úspech | Celkový bonus k hlavnému atribútu | Neúspech bez ochrany |
|---|---:|---:|---|
| +1 | 95 % | +3 | Bez zmeny |
| +2 | 90 % | +7 | Bez zmeny |
| +3 | 80 % | +12 | Bez zmeny |
| +4 | 65 % | +18 | −1 stupeň |
| +5 | 50 % | +25 | −1 stupeň |
| +6 | 35 % | +34 | −1 stupeň |
| +7 | 23 % | +46 | 35 % zničenie, inak −1 |
| +8 | 14 % | +62 | 35 % zničenie, inak −1 |
| +9 | 8 % | +85 | 35 % zničenie, inak −1 |

Pri šperku s hlavným atribútom kritického zásahu sa bonus počíta v percentuálnych bodoch; existujúci celkový bojový limit platí naďalej. Ostatné atribúty predmetu, bonusy, UID a rarita zostávajú zachované. Zničenie odstráni iba daný predmet a ihneď prepočíta štatistiky. +9 je maximum.

## Cena

Pre cieľový stupeň r: ruda = 3 × r²; Yang = zaokrúhlenie nahor(300 × r³ × (1 + tier / 25 + poradie rarity × 0,35)). Poradie rarity je 0–5 podľa Common až Mythic. Od +3 treba aj ceil(r² / 6) kameňov vylepšenia, od +5 navyše 4 × (r − 4)² prachu a od +7 navyše r − 6 kováčskych jadier.

## Pomôcky

- Talizman kováča: +10 percentuálnych bodov, najviac 95 %. Pri +1 sa nespotrebuje.
- Ochranný zvitok: pri neúspechu zachová predmet aj stupeň. Používa sa od pokusu na +4.
- Zvolené pomôcky sa spotrebujú aj pri úspechu. Chýbajúca pomôcka pokus úplne odmietne; nevykoná sa nechránene.
- Talizman sa vyrába za 2 jadrá, 100 esencie a 15 000 Yang. Zvitok za 6 jadier, 100 prachu, 10 kníh a 50 000 Yang.

Jadrá / talizmany / zvitky padajú z primeraných cieľov Lv.35+: boss 50 % / 15 % / 6 %, Metin 8 % / 4 % / 1,5 %, vzácna príšera 15 % / 5 % / 1 %. Obrancovia Metinov tieto dodatočné pomôcky neposkytujú. Zásoby sa pripisujú priamo do inventára.

## Vzhľad a kompatibilita

Zbrane +5 až +9 majú postupne silnejšiu žiaru, energetické vlákna a častice; každý stupeň mení farbu a intenzitu. Efekt zdieľajú herný model, ikony aj portréty. Animácia nepoužíva herný generátor náhody. Modul render/weapon-upgrades.js sa pridáva k existujúcim modelom.

Staré stupne sa zachovajú a použijú novú tabuľku bonusov. Chýbajúce tri nové počítadlá materiálov sa doplnia nulami pri načítaní staršieho registra alebo importe zálohy. Formát záloh ostáva kompatibilný.
