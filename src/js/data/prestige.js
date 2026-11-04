const PRESTIGE_BESTIARY_KEYS=['wolf','scorpion','yeti','demon',...Object.keys(METIN_TYPES).map(id=>'metin:'+id),...Object.keys(MAPS).filter(id=>!MAPS[id].town&&!MAPS[id].instance&&!MAPS[id].metinsOnly).map(id=>'boss:'+id),...Object.keys(DUNGEONS).map(id=>'dungeon:'+id)];
const PRESTIGE_RULES={schema:1,maxRank:5,maxTraining:10,goalReward:20};
const PRESTIGE_RANKS=[null,
 {label:'I',color:'#a1d6c0',bonus:{hp:40},text:'+40 HP'},
 {label:'II',color:'#8dc3f0',bonus:{defense:4},text:'+4 obrana'},
 {label:'III',color:'#c4a2ef',bonus:{attack:6,magic:8},text:'+6 útok, +8 sila kúziel'},
 {label:'IV',color:'#efc879',bonus:{speed:6},text:'+6 rýchlosť pohybu'},
 {label:'V',color:'#f29bb7',bonus:{attackPercent:.03},text:'+3 % útok, +5 % odolnosť voči všetkým typom poškodenia'}
];
const PRESTIGE_TRAINING={vitality:{name:'Odolné telo',text:'+15 HP',bonus:{hp:15}},guard:{name:'Pevná obrana',text:'+1 obrana',bonus:{defense:1}},focus:{name:'Sústredenie',text:'+2 sila kúziel',bonus:{magic:2}}};
const PRESTIGE_REQUIREMENTS={
 2:[{metric:'trial',dungeon:'crypt',tier:1,need:1,label:'Prestížna hrobka · stupeň I+'},{metric:'metins',need:5,label:'Metiny Lv.95+ po aktivácii'},{metric:'skills10',need:3,label:'Schopnosti stupňa 10+'}],
 3:[{metric:'trial',dungeon:'frost',tier:2,need:1,label:'Prestížna pevnosť · stupeň II+'},{metric:'bosses',need:3,label:'Vzácni prestížni bossovia'},{metric:'skills20',need:1,label:'Schopnosť maximálneho stupňa'}],
 4:[{metric:'trial',dungeon:'abyss',tier:3,need:1,label:'Prestížna priepasť · stupeň III+'},{metric:'biology',need:8,label:'Dokončené biologické etapy'},{metric:'uniques',need:3,label:'Získané dungeonové unikáty'}],
 5:[{metric:'trials4',need:3,label:'Rôzne prestížne dungeony · stupeň IV+'},{metric:'bestiary',need:PRESTIGE_BESTIARY_KEYS.length,label:'Druhy porazené v bestiári'},{metric:'skills20',need:6,label:'Maximálne schopnosti aktuálnej školy'},{metric:'weapon9',need:1,label:'Legendary alebo Mythic zbraň +9'}]
};
const PRESTIGE_GOALS={
 arsenal:{metric:'arsenal',need:10,label:'Mythic výbava +9 vo všetkých slotoch'},
 perfect:{metric:'perfect',need:1,label:'Mythic predmet s piatimi maximálnymi bonusmi'},
 skills:{metric:'skills20',need:6,label:'Maximálne schopnosti aktuálnej školy'},
 biology:{metric:'biology',need:8,label:'Dokončená biológia'},
 challenges:{metric:'trials5',need:3,label:'Všetky prestížne dungeony · stupeň V'},
 bosses:{metric:'bossTypes',need:3,label:'Všetci traja vzácni prestížni bossovia'},
 uniques:{metric:'uniques',need:3,label:'Získané tri dungeonové unikáty'},
 bestiary:{metric:'bestiary',need:PRESTIGE_BESTIARY_KEYS.length,label:'Dokončený bestiár'},
 mastery:{metric:'training',need:30,label:'Všetky prestížne pasívne tréningy'}
};
