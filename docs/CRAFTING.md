# Výroba a alchýmia

Výroba je v Progrese (P), záložka Výroba, pri kováčovi v Meste. Alchýmia má vlastnú záložku a NPC Alchymista na východnej strane námestia. Recepty možno prezerať kdekoľvek; výroba vyžaduje živú postavu do 170 jednotiek príslušného NPC. Každý recept ukazuje požiadavky, cenu aj vlastné zásoby. Výroba má 100 % úspešnosť.

## Progres

Obe remeslá majú samostatnú prax a úrovne 1–10. Úroveň L vyžaduje celkovo `50 × L × (L − 1)` praxe; maximum je 4500. Recepty vyžadujú úrovne 1, 2, 3, 4, 6, 7, 8 alebo 10 podľa výrobku. Od rozdielu troch úrovní dáva starší recept štvrtinu praxe, zaokrúhlenú nadol, najmenej 1. Alchymistické majstrovstvo pridáva +3 maximálnej many za úroveň nad prvou, najviac +27. Samotné zvýšenie maxima manu nedoplní.

## Výrobky a recepty

Register obsahuje 47 receptov:

- 30 kusov výbavy: všetkých desať slotov v troch stupňoch. Základná výbava: remeslo 1, postava 1, Common. Pokročilá: remeslo 4, postava 20, Rare. Majstrovská: remeslo 8, postava 50, Epic a jadro trhliny.
- Ingot, plášť, kameň vylepšenia, kováčske jadro, talizman kováča, ochranný zvitok a kľúč trhliny.
- Liečivé elixíry, bylinný extrakt, elixír many, tri základné odvary a koncentrát sily.
- Tri pôvodné alchymistické kamene za pôvodnú cenu. Fúzia a už nasadené kamene zostávajú zachované.

Výbava používa existujúci generátor, rarity, náhodné bonusy, modely povolaní, inventár a požiadavky na nasadenie. Plný inventár zablokuje výrobu pred spotrebou materiálov, praxe či náhodných hodov. Materiály a produkty sa ukladajú do existujúcich zásobníkov; vyrobená výbava sa nepredáva automaticky.

Presné ceny a prax sú v `src/js/data/crafting.js`. Talizman a zvitok zdieľajú existujúce ceny `FORGE_RULES.recipes`; starý vstup `craftForgeSupport()` deleguje na ten istý receptový systém. Aj tieto recepty teraz vyžadujú príslušnú remeselnú úroveň.

## Suroviny

Nové suroviny sa získavajú cez existujúcu okamžitú korisť:

| Zdroj | Odmena |
| --- | --- |
| Bežná príšera pri násobku 3 primeraných zabití | 1 bylina pri nepárnom počítadle, inak 1 koža |
| Primeraný boss | 3 byliny a 2 kože |
| Primeraný Metin | 1 + ⌊úroveň / 25⌋ surových kryštálov |
| Primeraný boss patriaci aktívnej trhline | Navyše 1 + ⌊stupeň trhliny / 10⌋ jadier trhliny |

Primeraný cieľ nie je viac než päť úrovní pod hráčom. Privolaní obrancovia neposkytujú nové suroviny. Ingot sa spracuje z rudy; extrakt z bylín a esencie. Kombinácia kryštálov, démonického popola, ľadových jadier a prachu vytvára kováčske jadro. Trojica odvarov sily s ďalšími materiálmi vytvorí koncentrát sily. Smrť zdroja využíva existujúcu ochranu pred opakovanou odmenou.

## Produkty

| Produkt | Účinok |
| --- | --- |
| Liečivý elixír | Pôvodný zásobník: 65 HP, cooldown 4 s |
| Elixír many | 80 MP, spoločný cooldown s liečivým elixírom 4 s |
| Odvar sily | +4 útok na 120 s |
| Odvar odolnosti | +4 obrana na 120 s |
| Odvar vitality | +60 maximálneho zdravia na 120 s, bez doplnenia HP |
| Koncentrát sily | +10 útok na 180 s |

Produkty sa používajú v Alchýmii alebo v zásobách inventára. Naraz pôsobí jeden odvar; nový ho neprepíše a nespotrebuje sa. Účinok je viditeľný pri ostatných buffoch. Jeho čas sa odpočítava iba počas aktívnej simulácie, pri paneloch stojí, uloží sa s postavou a pri zmene postavy sa neprenáša. Po skončení vitality sa aktuálne HP obmedzí na nové maximum. Elixír many sa pri plnej mane ani počas cooldownu nespotrebuje.

## Ukladanie a kontrola

`p.career.crafting` obsahuje prax a počet výrobkov. Existujúce `p.career.alchemy` sa rozšíri o prax, počet výrobkov, zásobníky produktov a aktívny účinok. Staré profily dostanú iba chýbajúce materiály a polia; pôvodné kamene, fúzie, predmety aj meny zostanú zachované. Import overuje produkty, množstvá, prax a maximálnu dĺžku účinku ešte pred zmenou registra. Každá postava má vlastný progres.

Regresie v `tests/crafting.test.cjs` pokrývajú recepty, všetky sloty a stupne výbavy, plný inventár, zdroje koristi, produkty a ich skutočné bonusy, pauzu, import, migráciu a izoláciu postáv.
