const SPAWN_RULES = {
  schema: 1, packSize: 6, sanctuaryRadius: 85, spawnClearance: 180,
  leash: 700, roamRadius: 85, roamSpeed: .4, assistRange: 300, assistLimit: 5,
  capeRange: 650, capeDuration: 18,
  capeCooldown: 2, capeBundle: 10, capePrice: 100,
  rareChance: .003, eliteChance: .07
};

const ENEMY_VARIANTS = {
  normal: { name: '', hp: 1, damage: 1, speed: 1, xp: 1, gold: 1, level: 0, respawn: 8, color: '#b8c59c' },
  elite: { name: 'Elitný', hp: 1.6, damage: 1.25, speed: 1.1, xp: 1.8, gold: 2, level: 1, respawn: 12, color: '#b59ceb' },
  rare: { name: 'Vzácny', hp: 2.3, damage: 1.5, speed: 1.15, xp: 3.2, gold: 4, level: 2, respawn: 60, color: '#edd183' }
};

const FARM_AREAS = [
  { id: 'southwest', name: 'Južné loviská', offset: 0, x1: 80, x2: 1560, y1: 1640, y2: 3120 },
  { id: 'southeast', name: 'Východné tábory', offset: 2, x1: 1640, x2: 3120, y1: 1640, y2: 3120 },
  { id: 'northwest', name: 'Severné hliadky', offset: 4, x1: 80, x2: 1560, y1: 80, y2: 1560 },
  { id: 'northeast', name: 'Územie strážcu', offset: 6, x1: 1640, x2: 3120, y1: 80, y2: 1560 }
];


for(const cfg of Object.values(MAPS))if(!cfg.town&&!cfg.instance&&!cfg.metinsOnly&&!cfg.metinWorld){
 const span=cfg.levelMax-cfg.level;
 cfg.mobLevelSpread=Math.max(1,Math.min(3,Math.floor(span/4)));
 const last=Math.max(0,span-cfg.mobLevelSpread),steps=[0,Math.floor(last/3),Math.floor(last*2/3),last];
 const areas=FARM_AREAS.map((area,index)=>({index,distance:Math.hypot((area.x1+area.x2)/2-cfg.entry.x,(area.y1+area.y2)/2-cfg.entry.y)})).sort((a,b)=>a.distance-b.distance);
 cfg.areaLevelOffsets=[];areas.forEach((area,rank)=>cfg.areaLevelOffsets[area.index]=steps[rank]);cfg.balanceVersion=2;cfg.bossLevel=cfg.levelMax;cfg.maxEnemyLevel=cfg.levelMax;
}
MAPS.suterland.balanceVersion=2;
