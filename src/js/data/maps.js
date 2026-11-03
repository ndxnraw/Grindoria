const MAPS={
valley:{name:'Údolie tichého vetra',region:'VÝCHODNÉ KRÁĽOVSTVO',desc:'Divoký vlk · Strážca pralesa',level:1,enemyLevel:1,scale:1,seed:78231,ground:'#536b45',patch:'#7d925a30',path:'#b9ae7c55',accent:'#b0c28b',water:'#517c6c',mob:'Divoký vlk',boss:'Strážca pralesa',skin:'wolf'},
desert:{name:'Púšť zapadnutých chrámov',region:'JUŽNÉ PUSTATINY',desc:'Púštny škorpión · Pieskový kolos',level:8,enemyLevel:8,scale:2.3,seed:21812,ground:'#a78a55',patch:'#c8ab7135',path:'#e6c78955',accent:'#dec28a',water:'#487f76',mob:'Púštny škorpión',boss:'Pieskový kolos',skin:'scorpion'},
snow:{name:'Hory večného mrazu',region:'SEVERNÉ VRCHOLY',desc:'Ľadový yeti · Mrazivý obor',level:18,enemyLevel:18,scale:4.8,seed:49125,ground:'#aabfc2',patch:'#e1ebdc50',path:'#778f9a44',accent:'#c5e5f2',water:'#608d9a',mob:'Ľadový yeti',boss:'Mrazivý obor',skin:'yeti'},
suterland:{name:'Šuterland',region:'RÍŠA METINOV',desc:'Metiny 1–99 · bez voľných príšer',level:1,levelMax:99,enemyLevel:1,scale:1,seed:184901,ground:'#5e6264',patch:'#969b9430',path:'#c2b58c44',accent:'#d4b8dd',water:'#737d83',mob:'Metiny Lv.1–99',boss:'Bez voľných príšer',skin:'wolf',count:0,packCount:0,metinCount:99,metinsOnly:true},
temple:{name:'Chrám červeného plameňa',region:'ZAKÁZANÉ ÚZEMIE',desc:'Chrámový démon · Pán plameňov',level:35,enemyLevel:35,scale:10,seed:99012,ground:'#423b3b',patch:'#8b44332b',path:'#a0644950',accent:'#eda17b',water:'#bd6034',mob:'Chrámový démon',boss:'Pán plameňov',skin:'demon'}
};

const WORLD_RULES={schema:1,combatSize:3200,townSize:1200,travelCooldown:3};
const MAP_LOCATIONS={
 valley:{safeZone:{x:360,y:280,radius:85},entry:{x:360,y:310},bossPosition:{x:2740,y:500},packCount:48},
 desert:{safeZone:{x:2840,y:400,radius:85},entry:{x:2840,y:430},bossPosition:{x:2660,y:750},packCount:60},
 snow:{safeZone:{x:480,y:2750,radius:85},entry:{x:480,y:2780},bossPosition:{x:2700,y:420},packCount:60},
 temple:{safeZone:{x:2750,y:2760,radius:85},entry:{x:2750,y:2790},bossPosition:{x:2660,y:550},packCount:68},
 suterland:{safeZone:{x:280,y:1560,radius:85},entry:{x:280,y:1590},bossPosition:null,packCount:0}
};
for(const [id,location]of Object.entries(MAP_LOCATIONS)){Object.assign(MAPS[id],location,{size:WORLD_RULES.combatSize});MAPS[id].count=MAPS[id].packCount?MAPS[id].packCount*6+4:0;}
MAPS.town={name:'Mesto',region:'MESTO',desc:'Obchodník · Zbrojár · Kováč · Biológ · Alchymista',level:1,enemyLevel:1,scale:1,seed:153170,ground:'#667461',patch:'#8f9b8130',path:'#c7b89c77',accent:'#d5c697',water:'#648b96',mob:'Bez nepriateľov',boss:'NPC',skin:'wolf',count:0,packCount:0,metinCount:0,town:true,size:WORLD_RULES.townSize,safeZone:{x:600,y:600,radius:10000},entry:{x:600,y:720}};
const NPCS={
 merchant:{name:'Obchodník',mapId:'town',x:440,y:630,color:'#c8ae75',service:'shop'},
 smith:{name:'Kováč',mapId:'town',x:760,y:630,color:'#b78664',service:'forge'},
 armsdealer:{name:'Zbrojár',mapId:'town',x:230,y:630,color:'#8e9fa6',service:'market'},
 alchemist:{name:'Alchymista',mapId:'town',x:950,y:630,color:'#8979ae',service:'alchemy'},
 biologist:{name:'Biológ',mapId:'town',x:600,y:370,color:'#93b98a',service:'biology'}
};

