const MAPS={
valley:{levelMax:8,areaLevelOffsets:[0,1,2,3],mobLevelSpread:1,metinLevelOffset:0,bossLevel:8,beginner:true,balanceVersion:1,dropLevelStep:5,name:'Údolie tichého vetra',region:'VÝCHODNÉ KRÁĽOVSTVO',desc:'Divoký vlk · Strážca pralesa',level:1,enemyLevel:1,scale:1,seed:78231,ground:'#536b45',patch:'#7d925a30',path:'#b9ae7c55',accent:'#b0c28b',water:'#517c6c',mob:'Divoký vlk',boss:'Strážca pralesa',skin:'wolf'},
desert:{levelMax:20,name:'Púšť zapadnutých chrámov',region:'JUŽNÉ PUSTATINY',desc:'Púštny škorpión · Pieskový kolos',level:8,enemyLevel:8,scale:2.3,seed:21812,ground:'#a78a55',patch:'#c8ab7135',path:'#e6c78955',accent:'#dec28a',water:'#487f76',mob:'Púštny škorpión',boss:'Pieskový kolos',skin:'scorpion'},
snow:{levelMax:35,name:'Hory večného mrazu',region:'SEVERNÉ VRCHOLY',desc:'Ľadový yeti · Mrazivý obor',level:18,enemyLevel:18,scale:4.8,seed:49125,ground:'#aabfc2',patch:'#e1ebdc50',path:'#778f9a44',accent:'#c5e5f2',water:'#608d9a',mob:'Ľadový yeti',boss:'Mrazivý obor',skin:'yeti'},
suterland:{name:'Šuterland',region:'RÍŠA METINOV',desc:'Metiny 1–99 · bez voľných príšer',level:1,levelMax:99,enemyLevel:1,scale:1,seed:184901,ground:'#5e6264',patch:'#969b9430',path:'#c2b58c44',accent:'#d4b8dd',water:'#737d83',mob:'Metiny Lv.1–99',boss:'Bez voľných príšer',skin:'wolf',count:0,packCount:0,metinCount:99,metinsOnly:true},
temple:{levelMax:55,name:'Chrám červeného plameňa',region:'ZAKÁZANÉ ÚZEMIE',desc:'Chrámový démon · Pán plameňov',level:35,enemyLevel:35,scale:10,seed:99012,ground:'#423b3b',patch:'#8b44332b',path:'#a0644950',accent:'#eda17b',water:'#bd6034',mob:'Chrámový démon',boss:'Pán plameňov',skin:'demon'}
};

const EXP_MAPS={
 meadow:{name:'Vlčia lúka',level:5,levelMax:18,scale:1.6,seed:68234,skin:'wolf',mob:'Lesný vlk',boss:'Vodca svorky',ground:'#607548',accent:'#c1d597',water:'#5e8774',entry:{x:2800,y:2750},safeZone:{x:2800,y:2780,radius:85},bossPosition:{x:500,y:450},packCount:52,metinTypes:['fracture','fang']},
 marsh:{name:'Jedovaté močiare',level:14,levelMax:26,scale:3.4,seed:78132,skin:'scorpion',mob:'Močiarny škorpión',boss:'Kráľ močiarov',ground:'#495b43',accent:'#b4c977',water:'#526c49',entry:{x:420,y:2800},safeZone:{x:420,y:2830,radius:85},bossPosition:{x:2700,y:500},packCount:60,metinTypes:['fang','sand']},
 quarry:{name:'Zabudnutý lom',level:28,levelMax:42,scale:7.2,seed:98135,skin:'yeti',mob:'Kamenný strážca',boss:'Prastarý golem',ground:'#73766c',accent:'#d3c895',water:'#667f7b',entry:{x:2800,y:420},safeZone:{x:2800,y:450,radius:85},bossPosition:{x:550,y:2700},packCount:64,metinTypes:['sand','frost']},
 highlands:{areaLevelOffsets:[0,4,8,12],mobLevelSpread:3,name:'Búrkové vrchy',level:45,levelMax:62,scale:12,seed:57121,skin:'yeti',mob:'Búrkový strážca',boss:'Pán hromu',ground:'#697e85',accent:'#c0dfed',water:'#5e889b',entry:{x:400,y:2600},safeZone:{x:400,y:2630,radius:85},bossPosition:{x:2700,y:500},packCount:68,metinTypes:['frost','ember']},
 ruins:{areaLevelOffsets:[0,5,10,15],mobLevelSpread:4,name:'Démonické ruiny',level:60,levelMax:82,scale:17,seed:31728,skin:'demon',mob:'Démonický lovec',boss:'Strážca ruín',ground:'#514249',accent:'#dfb5cb',water:'#7e5465',entry:{x:2700,y:2750},safeZone:{x:2700,y:2780,radius:85},bossPosition:{x:500,y:500},packCount:72,metinTypes:['ember','void']},
 wastes:{areaLevelOffsets:[0,5,10,15],mobLevelSpread:4,bossLevel:99,maxEnemyLevel:99,name:'Pustatina skazy',level:80,levelMax:99,scale:24,seed:83417,skin:'demon',mob:'Démon skazy',boss:'Vládca pustatiny',ground:'#3e414b',accent:'#d4b0ea',water:'#695879',entry:{x:2800,y:1600},safeZone:{x:2800,y:1630,radius:85},bossPosition:{x:450,y:1700},packCount:76,metinTypes:['void','doom']}
};
for(const [id,d]of Object.entries(EXP_MAPS))MAPS[id]={...d,enemyLevel:d.level,region:'LOVISKÁ',desc:d.mob+' · '+d.boss,patch:'#a8b0a020',path:'#b2a78d40',areaLevelOffsets:d.areaLevelOffsets||[0,2,4,6]};
const WORLD_RULES={schema:1,combatSize:3200,townSize:1200,travelCooldown:3};
const MAP_LOCATIONS={
 valley:{safeZone:{x:360,y:2800,radius:85},entry:{x:360,y:2770},bossPosition:{x:2740,y:500},packCount:48},
 desert:{safeZone:{x:2840,y:400,radius:85},entry:{x:2840,y:430},bossPosition:{x:500,y:2600},packCount:60},
 snow:{safeZone:{x:480,y:2750,radius:85},entry:{x:480,y:2780},bossPosition:{x:2700,y:420},packCount:60},
 temple:{safeZone:{x:2750,y:2760,radius:85},entry:{x:2750,y:2790},bossPosition:{x:2660,y:550},packCount:68},
 suterland:{safeZone:{x:280,y:1560,radius:85},entry:{x:280,y:1590},bossPosition:null,packCount:0}
};
for(const [id,d]of Object.entries(EXP_MAPS))MAP_LOCATIONS[id]={safeZone:d.safeZone,entry:d.entry,bossPosition:d.bossPosition,packCount:d.packCount};
for(const [id,location]of Object.entries(MAP_LOCATIONS)){Object.assign(MAPS[id],location,{size:WORLD_RULES.combatSize});MAPS[id].count=MAPS[id].packCount?MAPS[id].packCount*6+4:0;}
MAPS.town={name:'Mesto',region:'MESTO',desc:'Obchodník · Zbrojár · Kováč · Biológ · Dungeon Majster',level:1,enemyLevel:1,scale:1,seed:153170,ground:'#667461',patch:'#8f9b8130',path:'#c7b89c77',accent:'#d5c697',water:'#648b96',mob:'Bez nepriateľov',boss:'NPC',skin:'wolf',count:0,packCount:0,metinCount:0,town:true,size:WORLD_RULES.townSize,safeZone:{x:600,y:600,radius:10000},entry:{x:600,y:720}};
const NPCS={
 merchant:{name:'Obchodník',mapId:'town',x:440,y:630,color:'#c8ae75',service:'shop'},
 smith:{name:'Kováč',mapId:'town',x:760,y:630,color:'#b78664',service:'forge'},
 armsdealer:{name:'Zbrojár',mapId:'town',x:230,y:630,color:'#8e9fa6',service:'market'},
 dungeonMaster:{name:'Dungeon Majster',mapId:'town',x:950,y:630,color:'#8979ae',service:'dungeons'},
 biologist:{name:'Biológ',mapId:'town',x:600,y:370,color:'#93b98a',service:'biology'}
};

