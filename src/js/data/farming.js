const SPAWN_RULES = {
  schema: 1, packSize: 6, sanctuaryRadius: 190, spawnClearance: 290,
  leash: 700, roamRadius: 85, roamSpeed: .4, assistRange: 300, assistLimit: 5,
  capeRange: 650, capeDuration: 18,
  capeCooldown: 2, capeBundle: 10, capePrice: 100,
  rareChance: .02, eliteChance: .12
};

const ENEMY_VARIANTS = {
  normal: { name: '', hp: 1, damage: 1, speed: 1, xp: 1, gold: 1, level: 0, respawn: 5, color: '#b8c59c' },
  elite: { name: 'Elitný', hp: 1.8, damage: 1.35, speed: 1.1, xp: 1.35, gold: 2, level: 1, respawn: 8, color: '#b59ceb' },
  rare: { name: 'Vzácny', hp: 2.8, damage: 1.7, speed: 1.15, xp: 1.8, gold: 4, level: 2, respawn: 20, color: '#edd183' }
};

const FARM_AREAS = [
  { id: 'southwest', name: 'Južné loviská', offset: 0, x1: 140, x2: 820, y1: 1180, y2: 1860 },
  { id: 'southeast', name: 'Východné tábory', offset: 2, x1: 1180, x2: 1860, y1: 1180, y2: 1860 },
  { id: 'northwest', name: 'Severné hliadky', offset: 4, x1: 140, x2: 820, y1: 140, y2: 820 },
  { id: 'northeast', name: 'Územie strážcu', offset: 6, x1: 1180, x2: 1860, y1: 140, y2: 820 }
];

