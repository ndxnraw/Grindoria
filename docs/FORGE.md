# Kováč a vylepšovanie

Kováč v Meste vylepšuje nasadenú výbavu +0 až +9. Každý pokus spotrebuje celú zobrazenú cenu. Ochranný zvitok od +4 zachová predmet aj stupeň; bez ochrany neúspech zníži stupeň a od +7 môže predmet zničiť.

| Cieľ | Úspech | Útok / sila kúziel | Obrana | HP | MP | Pohyb | Kritický zásah |
|---|---:|---:|---:|---:|---:|---:|---:|
| +1 | 95 % | 2 | 1 | 10 | 10 | 1 | 0,4 p. b. |
| +2 | 93 % | 4 | 2 | 22 | 20 | 2 | 0,8 p. b. |
| +3 | 90 % | 7 | 3 | 36 | 32 | 3 | 1,3 p. b. |
| +4 | 85 % | 10 | 5 | 55 | 48 | 4 | 1,9 p. b. |
| +5 | 75 % | 14 | 7 | 80 | 68 | 6 | 2,6 p. b. |
| +6 | 65 % | 19 | 10 | 110 | 92 | 8 | 3,4 p. b. |
| +7 | 55 % | 25 | 13 | 145 | 120 | 10 | 4,3 p. b. |
| +8 | 45 % | 32 | 17 | 180 | 155 | 12 | 5,3 p. b. |
| +9 | 35 % | 40 | 22 | 220 | 195 | 15 | 6,5 p. b. |

Tabuľka udáva celkový príspevok vylepšenia. Slot používa svoj hlavný atribút; ostatné štatistiky, identita a rarita predmetu sa nemenia. Celkový strop kritického zásahu je naďalej 80 %. Neúspech do +3 nemení stupeň. Pri neúspechu od +7 je šanca zničenia 15 %, inak sa stupeň zníži o jeden.

## Cena a pomôcky

Pre cieľový stupeň r: ruda = `2r + floor(r² / 4)`; Yang = `ceil(40 × r² × (1 + tier / 30 + poradie rarity × 0,25))`. Od +3 treba `ceil(r / 3)` kameňov vylepšenia, od +5 aj `2 × (r − 4)` prachu, od +7 aj `ceil((r − 6) / 2)` jadier.

- Talizman kováča pridáva 10 percentuálnych bodov úspechu, najviac 95 %. Pri +1 sa nespotrebuje. Recept: 1 jadro, 30 esencie, 1 000 Yang.
- Ochranný zvitok sa používa od +4. Recept: 2 jadrá, 25 prachu, 3 knihy, 3 000 Yang.
- Pomôcky sa spotrebujú aj pri úspechu. Chýbajúca zvolená pomôcka odmietne celý pokus.

Jadrá / talizmany / zvitky padajú z primeraných cieľov Lv.35+: boss 50 % / 15 % / 6 %, Metin 8 % / 4 % / 1,5 %, vzácna príšera 15 % / 5 % / 1 %. Obrancovia Metinov ich neposkytujú.

Staré stupne výbavy používajú nové krivky. Výnimkou je pôvodná štartovacia Common zbraň Lv.1 +9: jednorazovo sa zmení na +2 a zachová svoju identitu. Ostatné predmety sa neodstraňujú ani neprehadzujú. Zbrane +5 až +9 si zachovávajú existujúce vizuálne efekty.
