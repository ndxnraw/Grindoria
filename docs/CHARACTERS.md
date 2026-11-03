# Postavy, profily a zálohy

## Výber a tvorba

Po otvorení hry sa zobrazí Sieň hrdinov: zoznam postáv, animovaný model, meno, povolanie, škola, level, výbava a progres. Bez postáv sa zobrazí prázdny stav s vytvorením alebo importom. Náhľad používa vlastnú 2D SVG grafiku; existujúci engine Canvas 2D nemá 3D modely. Zmena výberu mení model aj údaje. Brnenie, prilba, štít a obuv sa prejavujú v modeli; zbraň zodpovedá povolaniu a všetkých desať skutočných slotov je v prehľade výbavy.

Pri tvorbe sa vyberá povolanie a jedna z jeho dvoch škôl. Štyri pôvodné povolania a 48 schopností zostávajú. Interný identifikátor ninja sa nemení; zobrazovaný názov je všade **Ninja**. Povolanie po vytvorení nemá mutačné UI a uloženie overuje zhodu s identitou profilu. Náhrada zálohou nemôže zmeniť povolanie existujúceho ID. Pridanie s konfliktom ID vytvorí samostatnú postavu.

Meno má 3–16 Unicode znakov, začína písmenom a ďalej povoľuje písmená, diakritické značky, čísla, podčiarkovník a pomlčku. Okrajové medzery sa odstránia, vnútorné medzery nie sú povolené. NFKC normalizácia a porovnanie bez veľkosti písmen zabránia duplicitám vrátane normalizovaných variantov diakritiky. Viac postáv rovnakého povolania je povolených.

Predpona * označí postavu ako GM: *Noctis sa zobrazí ako [GM] Noctis. Hviezdička sa nepočíta do dĺžky mena. Meno bez prefixu je unikátne naprieč GM aj bežnými postavami. Ide o lokálny menný štítok; offline hra nemá serverové účty ani overovanie administrátorských práv.

## Jeden register, samostatné profily

Existujúci localStorage sa rozširuje; nevzniká paralelný systém ukladania. Kľúč grindoria-characters-v1 obsahuje jeden dokument:

~~~text
format: grindoria-account
version: 1
revision: číslo zápisu
settings: globálne nastavenia, napríklad zvuk
selectedId: vybraná postava alebo null
order: usporiadané stabilné ID
profiles: záznamy postáv podľa ID
~~~

Každý záznam obsahuje id, name, isGM, classId, createdAt, lastPlayedAt a data. Dáta zachovávajú pôvodný model hráča: level, EXP, atribúty, HP/MP, schopnosti a prax, bag, equipped, gold (Yang), úlohy, career s biológiou, alchýmiou, zbierkou a endgame, worldStates, mapu a pozíciu, bestiary, achievements a nastavenia bojovej asistencie.

Aktívne ID je iba v pamäti relácie. Existujúce mechaniky používajú p, ktorý sa vytvorí hlbokou kópiou jediného profilu. Zápis je možný len ak aktívne ID, p.characterId a povolanie zodpovedajú rovnakému záznamu. Celý register sa zverejní jedným setItem; index a profily sa nezapisujú po častiach.

Item UID, spawnId, riftId a existujúce lokálne referencie sa zachovajú vnútri profilu. Rovnaké item UID v dvoch postavách je prípustné; inventáre ani objekty sa nezdieľajú. Referencie characterId, ownerCharacterId a selectedCharacterId v dátach musia patriť vlastnému profilu a pri pridaní s konfliktom ID sa premapujú. Globálny selectedId sa rieši samostatne.

## Hranie a prepínanie

Hrať uloží prípadnú aktívnu reláciu, načíta profil a inicializuje existujúce systémy kariéry, inventára, farmenia, koristi a sveta. Obnoví mapu aj uloženú pozíciu. Bežné cestovanie medzi mapami naďalej vedie do útočiska. Uložená mŕtva postava začne so zdravím v útočisku.

Postavy alebo ♙ v minimape najprv uložia aktívnu reláciu. Pri chybe sa neodpojí a ponúkne export aktuálneho progresu. Minimapa sprístupňuje návrat aj vo fullscreene. Po zmene rozloženia sa prepočíta Canvas a súradnice mierenia.

Pri prepnutí sa vyčistia ciele, kurzor, klávesy, strely, efekty, aury, dočasné cooldowny, rotácia Autospellu, výber a presúvanie predmetov. Tieto bojové stavy sa neukladajú, rovnako ako v pôvodnej hre. Trvalé dáta sa čítajú výlučne z aktivovaného profilu.

Autosave pokračuje každé štyri sekundy aktívnej simulácie, pri dôležitých akciách, zmene viditeľnosti a zatvorení stránky. Úvodná obrazovka nemá aktívnu postavu a tieto udalosti jej dáta neprepíšu. Zápis odmietne register zmenený iným oknom od načítania. Súbežné hranie vo viacerých oknách nepoužívaj; localStorage neposkytuje databázový zámok medzi procesmi.

## Bestiár a úspechy

Každá postava má počty zabití podľa rodiny príšery, typu Metinu a mapy bossa. Úspechy: prvý protivník, prvý Metin, prvý boss a 100 zabitých príšer. Existujúce úlohy sa nemenia. Starý postup dostane prázdne nové záznamy, bez domýšľania historických zabití. Informácie a progres zobrazia tieto záznamy aj hlavné cesty kariéry.

## Vymazanie

Vymazať postavu otvorí nezvratné potvrdenie. Tlačidlo sa sprístupní až po napísaní celého zobrazovaného mena; backend ho opäť overí. Okrajové medzery, normalizácia a veľkosť písmen používajú pravidlá mien; pri GM je potrebné celé [GM] meno. Nesprávny vstup nič nezmení.

Odstráni sa iba zvolené ID a celý jeho profil. Aktívna relácia sa najprv uloží a ukončí. Výber prejde na zostávajúci profil alebo null. Prázdny register zabráni opätovnému automatickému importu starého postupu. Vymazanie neodstraňuje hráčove externé zálohy ani historický migračný zdroj.

## Export

Exportovať postavy alebo Záloha v hre vytvorí prenosný UTF-8 JSON grindoria-characters-backup-YYYY-MM-DD.json. Obsahuje format grindoria-characters, verziu 2, čas exportu, verziu hry a celý account so všetkými profilmi. Zahŕňa predmety, referencie, neaktívne svety aj odloženú bežnú mapu pri trhline.

Export aktívnej relácie vytvorí snímku v pamäti, nevyžaduje zápis localStorage. Zachráni tak aj najnovší postup pri plnom úložisku. Uložený register sa exportom nemení.

## Import a transakcie

Súbor sa načíta ako text a JSON.parse; dáta sa nevyhodnocujú ako kód. Overí sa formát, verzia, povinné polia, rozsahy, povolania, školy, predmety a sloty, UID a políčka, materiály, schopnosti, alchýmia, mapy, Metiny, bestiár, úspechy a referencie postáv. Duplicitné identity, prekrývajúci sa inventár, neplatné referencie a nebezpečné dátové kľúče sa odmietnu. Platí limit veľkosti, hĺbky a počtu dátových uzlov.

Pred potvrdením sa zobrazí počet, mená, povolania, levely a konflikty ID a mien.

- Pridať ponechá existujúce profily. Meno musí hráč vyriešiť ručne; žiadne tiché prepísanie ani automatické premenovanie. Konflikt ID vytvorí nové ID a premapuje identity, bez zmeny lokálnych item UID.
- Nahradiť nahradí celý zoznam. Vyžaduje potvrdenie straty aktuálnych postáv, ktoré nie sú v zálohe. Pred zápisom vznikne bezpečnostná záloha grindoria-characters-v1.safety; tlačidlo ju umožní stiahnuť. Ak jej zápis zlyhá, náhrada sa nevykoná.

Výsledok vznikne v oddelenej kópii, prejde validáciou a uloží sa jedným atomickým zápisom. Chybný súbor, konflikt mena, prekročenie kapacity, zastaraný náhľad ani chyba úložiska nemenia existujúce profily. Globálne nastavenia aktuálnej aplikácie sa pri importe zachovajú.

Verzia exportu 1 so zoznamom characters sa prevedie na verziu 2 a doplní identitu, bestiár a úspechy. Budúca verzia sa odmietne; ďalšie migrácie musia byť výslovné. Surový neoznačený profil sa automaticky migruje iba z existujúceho lokálneho úložiska.

## Migrácia a chyby

Bez registra sa načíta pôvodný grindoria-save-v1 alebo kompatibilné staršie profily existujúcim rozpoznávaním formátu. Každý dostane ID a unikátne meno. Inventár, výbava a progres prejdú existujúcimi migráciami. Platný aktuálny starý profil má prednosť pred staršími kópiami, aby nevznikali duplikáty toho istého postupu.

Register sa uloží až po príprave všetkých profilov; zdroje ostávajú zálohou. Pri plnom úložisku aplikácia umožní export normalizovaných dát. Poškodený register sa neprepíše prázdnym stavom; obnova vyžaduje výslovný import platnej zálohy. Poškodené pôvodné bajty sa pri takej obnove uchovajú ako bezpečnostná kópia, nie ako zaručene čitateľný export.

## Konfigurácia a overenie

Jediný zdroj limitov je CHARACTER_RULES v data/characters.js: maxCharacters (8), nameMin, nameMax, backupVersion, maxBackupBytes (16 MiB), maxBackupCharacters (ochranný limit parsera 128) a storageKey. Zníženie kapacity nemaže postavy; tvorba a import rešpektujú nový limit. Reálna kapacita úložiska závisí od prehliadača; pri zaplnení sa údaje neprepisujú čiastočne a zostáva export.

Testy characters.test.cjs pokrývajú tvorbu, mená a GM, rovnaké povolania, ich nemennosť, izoláciu progresu a svetov, návrat do pozície, dočasné stavy, mazanie, obnovu stránky, obidva importy, konflikty, referencie, neplatné dáta, nedostatok miesta, migrácie, export neuloženého progresu a zastarané zápisy. Existujúce regresie používajú rovnaké profily podľa ID. V prehliadači sa overujú formuláre, zmena modelu a výbavy, export, import, konflikty aj fullscreen.
