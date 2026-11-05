# Pravidlá projektu

## Texty rozhrania

- Slovenčina: stručná, vecná, herná. Bez marketingu, poetických úvodov, fantasy klišé a komentárov o implementácii.
- Každý text musí pomáhať ovládať hru, pochopiť pravidlo alebo rozhodnúť. Jedna informácia má jedno hlavné miesto.
- Ako hrať: stručné ovládanie a pravidlá všetkých systémov vrátane pokročilého boja. Ostatné okná: aktuálne stavy, hodnoty, podmienky, ceny a akcie; neopakuj v nich návody.
- Kniha schopností: kláves, názov, stupeň, typ, mana, cooldown, účinok a kombo. Progresia: čísla, podmienky, ceny, tlačidlá; najviac jedna potrebná krátka vysvetľujúca veta na kartu.
- Výber a tvorba postavy sú funkčné menu. Mapy: názov, odporúčaná úroveň, nepriatelia, boss. Úlohy: cieľ, progres, odmena. Tooltipy: názov, rarita, požiadavky, štatistiky, bonusy, cena, použitie.
- Zachovaj názvy, číselné hodnoty, náklady, dosahy, trvania, šance, pity, podmienky, chyby a bezpečnostné upozornenia pri strate dát.
- Interné pravidlá označovania postáv patria iba do kódu; nezverejňuj ich v UI, README ani dokumentácii.
- Odstráň prázdne prezentačné elementy. Zachovaj elementy používané pre stavové hlásenia, accessibility, ID, class names, data atribúty a event handlery. CSS odstráň len pri preukázanej nepoužívanosti.
- Pri textovej korektúre nemeň mechaniky ani save formát. Výslovne žiadané opravy logiky rieš oddelene.

## Kontroly a distribúcia

- Pred úpravami preskúmaj existujúce moduly. Nezakladaj paralelný systém pre už riešenú funkciu.
- Over syntax, príslušné testy a panely v prehliadači; pri zmene ovládania alebo koristi pridaj integračné regresie.
- Zachovaj zdroje, changelog aj oba offline výstupy dist/Grindoria.html a dist/index.html. Používaj existujúci release postup.
