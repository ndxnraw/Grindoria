# Biologické úlohy

Biológ v Meste prijíma jednu vzorku a poplatok naraz. F otvorí službu v blízkosti NPC; aktuálny výskum je aj v Progresii → Biológ a v denníku J. Etapy sa dokončujú postupne. Odmena sa automaticky pridá k trvalým bonusom postavy; nevyžaduje ďalšie vyzdvihnutie.

| Etapa | Úroveň | Vzorka | Počet | Zdroj | Získanie | Interval | Yang za odovzdanie | Trvalá odmena |
|---|---:|---|---:|---|---|---|---:|---|
| Život údolia | 1 | Vlčie tkanivo | 10 | Príšery údolia | Každá 4. | Bez časového limitu | 25 | +30 HP |
| Jed púšte | 5 | Vak jedu | 12 | Príšery púšte | Každá 6. | Bez časového limitu | 50 | +6 útok |
| Odolnosť mrazu | 12 | Ľadové jadro | 15 | Príšery hôr | Každá 8. | Bez časového limitu | 75 | +5 obrana |
| Srdce plameňa | 25 | Démonický popol | 20 | Príšery chrámu | Každá 10. | Bez časového limitu | 100 | +4 % kritický zásah, +30 MP |
| Koncentrácia jedu | 40 | Koncentrovaný jed | 15 | Elitné a vzácne škorpióny v púšti | 20 %, najneskôr 10. vhodné zabitie | 5 min | 500 | +60 HP, +12 rýchlosť pohybu |
| Výskum mrazivej drene | 55 | Mrazivá dreň | 20 | Elitní a vzácni yetiovia v horách | 12 %, najneskôr 16. | 10 min | 1 000 | +120 HP, +8 obrana |
| Výskum démonického srdca | 70 | Démonické srdce | 25 | Vzácni chrámoví démoni | 8 %, najneskôr 20. | 20 min | 2 500 | +18 útok, +12 sila kúziel |
| Výskum prastarého orgánu | 85 | Prastarý orgán | 30 | Pán plameňov v chráme alebo trhline | 5 %, najneskôr 25. | 30 min | 5 000 | +180 HP, +12 obrana, +8 rýchlosť pohybu |

Medzi všetkými odovzdaniami zostáva podmienka 10 nových primeraných zabití. Časový interval a zabitia platia súčasne, aj medzi etapami. Prvé odovzdanie nemá dodatočné čakanie. Čas plynie aj pri pauze a mimo hry; ďalší pokus musí splniť všetky podmienky. Vzorky sa prijímajú vždy, bez náhodného zlyhania.

Pokročilé vzorky padajú iba pre aktívnu etapu a od požadovanej úrovne. Ich čítač zaručeného dropu postupuje iba pri správnom zdroji. Úspešný drop ho vynuluje; dokončenie etapy ho tiež vyčistí. Obrancovia Metinov a dungeonové objekty neposkytujú pokročilé vzorky. Prvé štyri základné vzorky možno zbierať dopredu. Vzorky padajú aj z príšer, ktoré sú príliš slabé na EXP; nemení to podmienku primeraných zabití medzi odovzdaniami.

Zásoby sa okamžite pripíšu do inventára a zobrazí sa malé hlásenie. Vzorka má vlastnú ikonu a použitím otvorí panel biológa. Bonus rýchlosti je pevný príspevok k základnej rýchlosti, pred násobkami dočasných efektov a dungeonov. Vyššie maximálne HP ani MP pri dokončení výskumu automaticky neliečia postavu.

## Uloženie a kompatibilita

Používa sa existujúce p.career.biology: stage, delivered, nextKill a nové voliteľné nextDeliveryAt (čas zariadenia v ms) a sampleKills (pity aktívnej pokročilej etapy). Materiály sú v existujúcom p.career.materials. Čítače prvých štyroch máp zostávajú v samplePity. Každá postava má vlastné údaje; export a import ich prenášajú spolu s profilom.

Staré štyri etapy si zachovajú poradie, počty, požadované úrovne, poplatky aj bonusy. Dokončený i čiastočný progres a uložené vzorky zostanú zachované. Nové počítadlá dostanú nulu; nové materiály sa doplnia pri načítaní registra alebo príprave staršej zálohy. Formát zálohy sa nemení. Neplatné časovače, čítače a zásoby import odmietne bez zmeny uložených postáv.

Definície: data/biology.js. Odovzdanie a dropy: systems/biology.js, napojené na existujúci careerKill. UI a živý odpočet: ui/biology.js. Odpočet aktualizuje text a dostupnosť tlačidla bez prekreslenia celého okna a bez straty pozície či zamerania.
