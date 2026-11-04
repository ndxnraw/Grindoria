const METIN_RULES = { schema: 1, combatWindow: 6, firstWave: .1, maxGuards: 8, globalGuards: 60, guardLifetime: 45 };
// Loot material entries are [chance, minimum amount, maximum amount].
const METIN_TYPES = {
  fracture: { name: 'Metin praskliny', levels: [1, 9], model: 'obelisk', difficulty: 'Ľahký', color: '#80728e', glow: '#d6a3e2', hp: 1, armor: 0, interval: 4.8, wave: 2, loot: { yang: [18, 32], ore: [1, 1, 2], books: [.35, 1, 1], essence: [.55, 1, 3], dust: [.2, 1, 2], upgradeStones: [.05, 1, 1], gear: .45, epic: .025, rare: .015, relic: 'valley', slots: ['weapon', 'bracelet'], extra: ['wolf', .22, 1, 2] } },
  fang: { name: 'Metin šeliem', levels: [10, 19], model: 'tusks', difficulty: 'Ľahký', color: '#93816a', glow: '#e8c57d', hp: 1.08, armor: .015, interval: 4.4, wave: 2, loot: { yang: [25, 42], ore: [.85, 2, 3], books: [.42, 1, 1], essence: [.6, 2, 4], dust: [.25, 1, 2], upgradeStones: [.08, 1, 1], gear: .5, epic: .04, rare: .02, relic: 'valley', slots: ['weapon', 'helmet', 'boots'], extra: ['training', .3, 1, 2] } },
  sand: { name: 'Metin púšte', levels: [20, 34], model: 'pyramid', difficulty: 'Stredný', color: '#a88b58', glow: '#f0d293', hp: 1.17, armor: .025, interval: 4, wave: 3, loot: { yang: [40, 65], ore: [.9, 2, 4], books: [.48, 1, 2], essence: [.7, 2, 5], dust: [.35, 2, 3], upgradeStones: [.12, 1, 1], gear: .55, epic: .06, rare: .025, relic: 'desert', slots: ['shield', 'belt', 'bracelet'], extra: ['venom', .3, 1, 3] } },
  frost: { name: 'Metin mrazu', levels: [35, 49], model: 'crystals', difficulty: 'Stredný', color: '#6d9ba9', glow: '#b7e5ef', hp: 1.28, armor: .04, interval: 3.6, wave: 3, loot: { yang: [65, 95], ore: [.92, 3, 5], books: [.55, 1, 2], essence: [.75, 3, 6], dust: [.5, 2, 4], upgradeStones: [.16, 1, 2], gear: .6, epic: .08, rare: .035, relic: 'snow', slots: ['armor', 'necklace', 'earrings'], extra: ['frost', .35, 1, 3] } },
  ember: { name: 'Metin plameňa', levels: [50, 64], model: 'volcano', difficulty: 'Ťažký', color: '#66504b', glow: '#eea068', hp: 1.4, armor: .055, interval: 3.2, wave: 4, loot: { yang: [95, 145], ore: [.95, 3, 6], books: [.6, 1, 3], essence: [.8, 4, 7], dust: [.58, 3, 5], upgradeStones: [.2, 1, 2], gear: .65, epic: .11, rare: .045, relic: 'temple', slots: ['weapon', 'armor', 'shield'], extra: ['ember', .4, 1, 3] } },
  storm: { name: 'Metin búrky', levels: [65, 79], model: 'twins', difficulty: 'Ťažký', color: '#507e82', glow: '#93e4dd', hp: 1.5, armor: .07, interval: 2.9, wave: 4, loot: { yang: [140, 210], ore: [.96, 4, 7], books: [.66, 2, 3], essence: [.85, 4, 8], dust: [.65, 3, 6], upgradeStones: [.25, 1, 3], gear: .7, epic: .14, rare: .055, relic: 'desert', slots: ['boots', 'earrings', 'talisman'], extra: ['training', .5, 2, 4] } },
  void: { name: 'Metin prázdnoty', levels: [80, 94], model: 'floating', difficulty: 'Veľmi ťažký', color: '#64567e', glow: '#c9a0ef', hp: 1.65, armor: .09, interval: 2.6, wave: 5, loot: { yang: [200, 290], ore: [.98, 5, 8], books: [.72, 2, 4], essence: [.9, 5, 10], dust: [.75, 4, 8], upgradeStones: [.3, 2, 3], gear: .78, epic: .2, rare: .07, relic: 'snow', slots: ['talisman', 'necklace', 'armor'], extra: ['shards', .1, 1, 2] } },
  doom: { name: 'Metin skazy', levels: [95, 99], model: 'crown', difficulty: 'Legendárny', color: '#5e414c', glow: '#f398ac', hp: 1.8, armor: .11, interval: 2.3, wave: 5, loot: { yang: [280, 420], ore: [1, 6, 10], books: [.8, 3, 5], essence: [.95, 6, 12], dust: [.85, 5, 10], upgradeStones: [.4, 2, 4], gear: .9, epic: .3, rare: .1, relic: 'temple', slots: ['weapon', 'armor', 'helmet', 'talisman'], extra: ['keys', .12, 1, 2] } }
};
const METIN_MAP_TYPES = { valley: ['fracture'], desert: ['fracture', 'fang'], snow: ['fang', 'sand'], temple: ['frost', 'ember'] };
for(const [id,d]of Object.entries(EXP_MAPS))METIN_MAP_TYPES[id]=d.metinTypes;
const METIN_GUARDS = [
  { max: 14, skin: 'wolf', name: 'Metinový vlk' },
  { max: 34, skin: 'scorpion', name: 'Pieskový obranca' },
  { max: 59, skin: 'yeti', name: 'Ľadový obranca' },
  { max: 105, skin: 'demon', name: 'Démonický obranca' }
];

for(const type of Object.values(METIN_TYPES))type.interval=Math.round(type.interval*.55*100)/100;
