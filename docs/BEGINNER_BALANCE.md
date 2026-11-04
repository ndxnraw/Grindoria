# Začiatok a súvislá progresia

## Štartovacia výbava

Každá nová postava začína s nasadenou Common zbraňou +9, požadovaný level 1, bez náhodných bonusov. Bojovník a Sura dostanú meč, Ninja podľa školy dýky alebo luk, Šaman vejár. Používa rovnaký model predmetu, ID, bonusy a efekty +9 ako ostatná výbava.

Existujúca neozbrojená postava Lv.1 dostane zbraň pri prvom načítaní. Predmety v batohu sa zachovajú. Nasadená výbava ani postavy vyšších levelov sa nemenia. Jednorazový príznak starterWeaponGranted zabraňuje opakovanému získavaniu po predaji, vyhodení alebo zložení zbrane; prenáša sa v existujúcej zálohe v2.

## Údolie

Vstup aj bezpečná zóna sú na juhozápade. Prvé obyčajné skupiny majú level 1–2 bez elitných variantov. Zvyšné oblasti postupne pridávajú levely až po bežné 4–5 a vzácne varianty; Metiny majú level 1–4, boss 8. Základné HP, damage, EXP krivka a drop šance sa neznižovali plošne: problém rieši vhodná vstupná oblasť, primerané levely a štartovacia zbraň.

Obyčajné dropy používajú päťlevelové pásma zaokrúhlené nadol s minimom 1. Príklady: zdroj 1–4 → výbava 1, 5–9 → 5, 30–34 → 30, 75–79 → 75. Rarita sa vyberá podľa skutočného levelu zdroja. FMS, Jedovatý meč, recepty a pevné dungeonové unikáty majú naďalej vlastné požiadavky.

## Loviská

| Mapa | Odporúčaný level | Príšera | Boss |
|---|---|---|---|
| Údolie tichého vetra | 1–8 | Divoký vlk | Strážca pralesa |
| Vlčia lúka | 5–18 | Lesný vlk | Vodca svorky |
| Púšť zapadnutých chrámov | 8–20 | Púštny škorpión | Pieskový kolos |
| Jedovaté močiare | 14–26 | Močiarny škorpión | Kráľ močiarov |
| Hory večného mrazu | 18–35 | Ľadový yeti | Mrazivý obor |
| Zabudnutý lom | 28–42 | Kamenný strážca | Prastarý golem |
| Chrám červeného plameňa | 35–55 | Chrámový démon | Pán plameňov |
| Búrkové vrchy | 45–62 | Búrkový strážca | Pán hromu |
| Démonické ruiny | 60–82 | Démonický lovec | Strážca ruín |
| Pustatina skazy | 80–99 | Démon skazy | Vládca pustatiny |
| Šuterland | 1–99 | iba Metiny | bez voľného bossa |

Najnižšie levely sú vždy v oblasti pri vstupe, na každej mape podľa jej bezpečnej zóny. Silnejšie oblasti sú ďalej a ukazujú vlastné levelové pásmo. Bossovia sú mimo bezprostredného dosahu vstupu. Démonické ruiny ponúkajú aj bežné príšery Lv.75+, Pustatina bežné Lv.99. Preto lov ostáva vhodný na EXP a materiály aj pred maximálnym levelom.

Nové mapy používajú existujúce skiny, vlastné palety, prirodzené spawny, bezpečné zóny, lokálne typy Metinov, bossové loot pooly a perzistentné snímky. Nezavádzajú ďalší systém uloženia.

## Základné plošné útoky

Útok zblízka zasiahne celé okolie do 62 jednotiek a čelný výsek do 95. Zachováva smer kurzora, cooldown, označenie a nasledovanie. Základný šíp pri dopade zasiahne ďalšie ciele do 65 jednotiek za 65 % jeho poškodenia. Primárny cieľ dostane plný zásah; slučky ďalších zásahov ho preskočia. Skupinové aggro, bezpečné zóny, kritické zásahy a resisty zostávajú platné.

## Uložené mapy a UI

Snímky ukladajú balanceSchema. Pri prvom načítaní staršej obyčajnej mapy sa jej trvalé spawnovacie sloty prepočítajú podľa novej konfigurácie; zachová sa pomer HP, smrť a zostávajúci respawn. Dropy, inventár, questy a ostatný progres sa neprepisujú. Starý bezpečný vstup údolia sa postave Lv.1 presunie na nový bezpečný vstup. Už migrované mapy sa znovu neprepočítavajú. Šuterland, dungeony, aktívne udalosti a ich vlastné pravidlá zostávajú samostatné.

Tooltipy vynechávajú neexistujúce bonusy, riadok nulového vylepšenia a hodnotenie kvality pri predmete bez náhodných bonusov. Porovnanie uvádza zmenené atribúty. Ponuka máp je zoradená podľa levelu s Mestom na začiatku a Šuterlandom na konci.

## Overenie

16 integračných regresií v beginner-balance.test.cjs pokrýva všetkých osem škôl, samostatné identity zbraní, jednorazové pridelenie, reálny boj Lv.1 proti skupine aj Metinu, drop pásma, nové mapy a vstupy, level 99, HP migráciu, melee/šípové AoE, tooltipy a prenos záloh. Existujúce bojové a inventárové jednotkové fixture zostávajú bez výbavy; keepStarter a testy tvorby používajú skutočný štart.
