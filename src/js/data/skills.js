const SCHOOLS={
body:{name:'Telesná sila',classId:'warrior',skills:[
['Vírenie meča','spin',7,20,2.5,165,'Úder do všetkých nepriateľov okolo teba.'],
['Aura meča','aura',16,24,0,0,'Na 12 s zvýši útok o 45 %.'],
['Zúrivosť','berserk',18,20,0,0,'Na 10 s zrýchli útoky a pohyb, ale prijímaš o 20 % viac škody.'],
['Prudký výpad','dash',8,18,2,300,'Výpad k cieľu a krátke omráčenie.'],
['Trojitý sek','triple',6,16,2.8,105,'Tri rýchle zásahy do blízkeho cieľa.'],
['Životná sila','burst',12,30,3.8,125,'Silný úder; spotrebuje aj 8 % maximálneho zdravia.']
]},
mental:{name:'Mentálna sila',classId:'warrior',skills:[
['Prerážajúci úder','beam',7,20,2.7,310,'Prerazí nepriateľov v priamke.'],
['Silné telo','guard',18,25,0,0,'Na 12 s zvýši obranu a zníži prijatú škodu.'],
['Dupnutie','stomp',9,22,2,170,'Plošný úder s omráčením.'],
['Úder mečom','boltStun',7,18,2.2,390,'Vlna sily omráči vzdialený cieľ.'],
['Silný úder','cleave',6,17,2.8,130,'Silný čelný úder s odhodením.'],
['Guľa meča','ground',11,28,3.3,240,'Výbuch sily v mieste cieľa.']
]},
blade:{name:'Boj s dýkami',classId:'ninja',skills:[
['Prepad','ambush',7,18,3,130,'Zblízka zasadí silný úder. Z neviditeľnosti má dvojitú silu.'],
['Rýchly útok','dash',7,18,2.4,340,'Prudko sa priblížiš k cieľu.'],
['Jedovatý oblak','poisonCloud',10,24,1.2,170,'Oblak zraní a otrávi nepriateľov na 6 s.'],
['Víriaca dýka','roll',8,22,2.7,165,'Kotúľ vpred a útok okolo cieľa.'],
['Maskovanie','stealth',17,20,0,0,'Na 8 s ťa príšery nevidia. Útok maskovanie ukončí.'],
['Zákerný jed','poisonDash',10,25,2.4,290,'Výpad s otravou na 6 s.']
]},
archery:{name:'Lukostreľba',classId:'ninja',skills:[
['Ohnivý šíp','fireArrow',7,20,2.5,520,'Ohnivý šíp exploduje a spôsobí popálenie.'],
['Jedovatý šíp','poisonArrow',8,20,2,520,'Vzdialený cieľ otrávi na 6 s.'],
['Dážď šípov','arrowRain',10,28,1.8,490,'Zasiahne až päť cieľov.'],
['Opakovaná streľba','multiShot',8,22,3.1,520,'Tri šípy na jeden cieľ.'],
['Ľahká chôdza','speed',16,20,0,0,'Na 12 s zrýchli pohyb.'],
['Iskra','spark',11,27,3.4,520,'Svetelný lúč zasiahne cieľ a omráči ho.']
]},
weapon:{name:'Zbraňová mágia',classId:'sura',skills:[
['Úder prstom','finger',7,20,3,150,'Prekliata ruka vytvorí prudkú explóziu pred tebou.'],
['Dračie vírenie','dragonSpin',9,25,2.7,185,'Temné tornádo zasiahne okolie a odhodí nepriateľov.'],
['Očarovaná čepeľ','enchanted',17,25,0,0,'Na 12 s zvýši útok a vracia 15 % spôsobenej škody ako zdravie.'],
['Očarovaná zbroj','armor',18,24,0,0,'Na 12 s zvýši obranu a odráža časť škody.'],
['Strach','fear',17,22,0,0,'Na 10 s spomalí blízke príšery a zníži ich poškodenie.'],
['Zrušenie kúzla','dispel',10,25,2.3,420,'Zasiahne cieľ a na 8 s potlačí zúrivosť bossa.']
]},
black:{name:'Čierna mágia',classId:'sura',skills:[
['Temný úder','darkBolt',6,18,2.3,510,'Rýchla strela temnej energie.'],
['Temná guľa','darkOrb',10,28,3.5,500,'Veľká temná guľa s plošným výbuchom.'],
['Ohnivý úder','flameBurst',8,23,2.5,180,'Explózia plameňov okolo teba.'],
['Duch plameňa','spirit',18,30,0,0,'Na 12 s vyvolá ducha, ktorý každých 1,5 s útočí na najbližší cieľ.'],
['Temná ochrana','darkGuard',18,25,0,0,'Na 12 s znižuje škodu o tretinu; časť zásahu spotrebuje manu.'],
['Úder ducha','spiritBolt',8,22,2.8,500,'Temný duch zasiahne cieľ a spomalí ho na 4 s.']
]},
dragon:{name:'Dračia sila',classId:'shaman',skills:[
['Dračí rev','dragonRoar',9,25,2.7,190,'Dračí kruh spáli okolie a zanechá popálenie.'],
['Lietajúci talizman','talisman',6,16,2.1,480,'Vyšle letiaci talizman na cieľ.'],
['Strieľajúci drak','dragonBreath',8,23,2.9,370,'Ohnivý drak zasiahne nepriateľov pred tebou.'],
['Požehnanie','bless',17,22,0,0,'Na 12 s zníži prijatú škodu o 30 %.'],
['Odraz','reflect',17,22,0,0,'Na 12 s odrazí 35 % prijatého zásahu útočníkovi.'],
['Dračia sila','dragonPower',17,25,0,0,'Na 12 s zvýši šancu na kritický zásah o 25 %.']
]},
healing:{name:'Liečenie',classId:'shaman',skills:[
['Vrh blesku','lightning',6,17,2.3,500,'Blesk zasiahne vzdialený cieľ.'],
['Privolanie blesku','storm',10,28,3.1,480,'Búrka zasiahne okolie cieľa a krátko omráči.'],
['Bleskový pazúr','chain',8,23,1.9,450,'Reťaz bleskov preskočí až na štyroch nepriateľov.'],
['Vyliečenie','heal',8,25,0,0,'Obnoví 45 + 5 za úroveň + 4 za inteligenciu zdravia.'],
['Rýchlosť','speed',16,20,0,0,'Na 12 s zrýchli pohyb a obnovovanie many.'],
['Zvýšenie útoku','attackUp',17,22,0,0,'Na 12 s zvýši silu útokov o 35 %.']
]}};
