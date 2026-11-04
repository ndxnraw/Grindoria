const BATTLE = { meleeRange: 95, basicCleaveRadius:62, basicSplashRadius:65, basicSplashMultiplier:.65, meleeStop: 76, rangedRange: 500, rangedStop: 420, halfArc: Math.PI * .31, comboWindow: 4 };
const DAMAGE_TYPES = {
  physical: { name: 'Fyzické', color: '#dfce9e' }, piercing: { name: 'Prierazné', color: '#c3dca3' },
  fire: { name: 'Oheň', color: '#f3a56b' }, poison: { name: 'Jed', color: '#acd571' },
  lightning: { name: 'Blesk', color: '#a6dff2' }, dark: { name: 'Temnota', color: '#c49de4' }, arcane: { name: 'Mágia', color: '#e8c6a5' }
};
const SUPPORT_SKILLS = new Set(['heal','aura','berserk','guard','enchanted','armor','fear','stealth','speed','spirit','darkGuard','bless','reflect','dragonPower','attackUp']);
const SKILL_DAMAGE = {
  spin:'physical', dash:'physical', triple:'physical', burst:'physical', beam:'physical', stomp:'physical', boltStun:'physical', cleave:'physical', ground:'physical',
  ambush:'piercing', poisonCloud:'poison', roll:'physical', poisonDash:'poison', fireArrow:'fire', poisonArrow:'poison', arrowRain:'piercing', multiShot:'piercing', spark:'lightning',
  finger:'dark', dragonSpin:'dark', dispel:'dark', darkBolt:'dark', darkOrb:'dark', flameBurst:'fire', spiritBolt:'dark',
  dragonRoar:'fire', talisman:'arcane', dragonBreath:'fire', lightning:'lightning', storm:'lightning', chain:'lightning'
};
const ACTIVE_SKILLS = Object.fromEntries(Object.entries(SCHOOLS).flatMap(([id, school]) => school.skills.map((skill, index) => [id+':'+index, { animation: id+':'+index, school: id, index, type: SKILL_DAMAGE[skill[1]] || null, support: SUPPORT_SKILLS.has(skill[1]), purpose: skill[6] }])));
const SCHOOL_PASSIVES = {
  body: { name: 'Bojový rytmus', text: 'Fyzické poškodenie +3 % za stupeň. Tri úspešné základné zásahy do rovnakého cieľa pripravia zosilnenie najbližšej útočnej schopnosti.' },
  mental: { name: 'Neústupnosť', text: 'Fyzická odolnosť +6 % na prvom stupni, potom +2 % za ďalší stupeň.' },
  blade: { name: 'Tichý lovec', text: 'Kritický zásah +1 % a odolnosť voči jedu +6 % za stupeň.' },
  archery: { name: 'Presná muška', text: 'Prierazné poškodenie +4 % za stupeň.' },
  weapon: { name: 'Runová oceľ', text: 'Temné poškodenie +3 % a fyzická odolnosť +2 % za stupeň.' },
  black: { name: 'Temná vôľa', text: 'Odolnosť voči temnote +5 % a maximálna mana +15 za stupeň.' },
  dragon: { name: 'Dračia krv', text: 'Ohnivé poškodenie a odolnosť voči ohňu +4 % za stupeň.' },
  healing: { name: 'Čistá myseľ', text: 'Liečenie a odolnosť voči bleskom +4 %, obnova many +0,5 za sekundu za stupeň.' }
};
const SCHOOL_COMBOS = {
  body: { name: 'Búrka čepelí', sequence: [1,0], bonus: .25 }, mental: { name: 'Rozbitá obrana', sequence: [2,0], bonus: .25 },
  blade: { name: 'Tichá čepeľ', sequence: [4,0], bonus: .2 }, archery: { name: 'Jedovatý výbuch', sequence: [1,0], bonus: .25 },
  weapon: { name: 'Runový prielom', sequence: [4,0], bonus: .25 }, black: { name: 'Temný požiar', sequence: [1,2], bonus: .25 },
  dragon: { name: 'Dračí rozsudok', sequence: [5,2], bonus: .25 }, healing: { name: 'Obnovujúci prúd', sequence: [4,3], bonus: .25 }
};
const CREATURE_RESISTS = {
  wolf: { fire: -.1, poison: .15 }, scorpion: { physical: .08, piercing: -.1, fire: .25, poison: .6, lightning: -.15, dark: .05 },
  yeti: { physical: .12, piercing: .05, fire: -.2, poison: .1, lightning: .2 },
  demon: { physical: .08, piercing: .05, fire: .4, poison: .2, lightning: -.15, dark: .3, arcane: -.1 }
};
const METIN_RESISTS = {
  fracture: { physical: .05, dark: .25, arcane: -.1 }, fang: { physical: .1, poison: .35, fire: -.1 },
  sand: { piercing: .2, fire: .25, lightning: -.1 }, frost: { fire: -.2, poison: .1, physical: .05 },
  ember: { fire: .5, dark: .1, lightning: -.15 }, storm: { lightning: .5, piercing: .1, dark: -.1 },
  void: { dark: .5, arcane: .2, physical: -.1 }, doom: { physical: .15, fire: .2, poison: .15, lightning: .1, dark: .25, arcane: -.1 }
};

for (const [type, spec] of Object.entries(DAMAGE_TYPES)) ITEM_STATS[type+'Resist']='Odolnosť · '+spec.name;

const POTION_RULES = { heal: 65, cooldown: 2 };
