const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedProfile } = require('./helpers/game.cjs');

test('EXP curve supports bounded leveling, scales with enemy level, and suppresses weak targets', () => {
  const { run } = createGame();
  assert.equal(run('needXP()'), 300);
  assert.equal(run('enemyXP({type:"wolf",level:1})'), 6);
  assert.equal(run('enemyXP({type:"wolf",level:2})') > run('enemyXP({type:"wolf",level:1})'), true);
  assert.equal(run('enemyXP({type:"boss",level:90})') <= 30, true);
  for (const level of [2, 5, 10, 20, 35, 60, 98]) assert(run(`xpForLevel(${level + 1}) > xpForLevel(${level})`));
  assert(run('xpForLevel(10) === 33000'));
  run('experience(299);'); assert.equal(run('p.level'), 1);
  run('experience(1);'); assert.equal(run('p.level'), 2); assert.equal(run('p.points'), 3);
  run('p.level=20;'); assert.equal(run('enemyXP({type:"wolf",level:1})'), 0);
  assert(run('enemyXP({type:"wolf",level:18}) < enemyXP({type:"wolf",level:20})'));
  run('p.level=120;p.xp=0;experience(1000000);'); assert.equal(run('p.level'), 120); assert.equal(run('p.xp'), 0);
});

test('legacy saves keep level, EXP percentage, equipment power and their schema migrates once', () => {
  const { run, saved } = createGame({ level: 8, xp: 152.5, gold: 222, weapon: 3, strength: 4, hp: 100, bag: [], equipped: { weapon: null, armor: null } });
  assert.equal(run('p.level'), 8); assert.equal(run('p.gold'), 222);
  assert.equal(run('p.xp'), run('Math.floor(.5*xpForLevel(8))'));
  assert.equal(run('equippedBonus("weapon")'), 24);
  assert.equal(run('p.career.materials.ore'), 0);
  run('save();'); const next = createGame(readSavedProfile(saved));
  assert.equal(next.run('p.xp'), run('p.xp')); assert.equal(next.run('equippedBonus("weapon")'), 24);
});

test('one death grants loot only once, and hostile levels actually affect enemy strength', () => {
  const { run } = createGame();
  assert(run('mobs[1].level > mobs[0].level && mobs[1].max > mobs[0].max && mobs[1].attackScale > mobs[0].attackScale'));
  run('let foe=mobs[0];foe.hp=1;hit(foe,10);');
  const xp = run('p.xp'), essence = run('p.career.materials.essence');
  run('hit(foe,999);'); assert.equal(run('p.xp'), xp); assert.equal(run('p.career.materials.essence'), essence);
  run('p.level=20;let weak=mobs[1];weak.hp=1;hit(weak,2);');
  assert.equal(run('p.career.materials.essence'), essence);
});

test('removed paid training cannot spend currency or alter old trained attributes',()=>{const {run}=createGame();run('p.strength=7;p.career.training.strength=7;p.gold=200;p.career.materials.training=10;save();');assert.equal(run('typeof trainAttribute'),'undefined');assert.equal(run('p.strength'),7);assert.equal(run('p.gold'),200);});

test('skill practice requires a real eligible kill; repeated hits do not multiply practice', () => {
  const { run } = createGame();
  run('running=true;p.x=500;p.y=500;mobs.forEach(m=>m.hp=0);let foe=mobs[0];foe.hp=10000;foe.max=10000;foe.x=520;foe.y=500;castSkill(0);');
  assert.equal(run('skillProgress("body:0").practice'), 0);
  run('rememberSkill(foe,"body:0");rememberSkill(foe,"body:0");hit(foe,20000);');
  assert.equal(run('skillProgress("body:0").practice'), 1);
  run('p.gold=1000;p.career.materials.books=10;'); assert.equal(run('upgradeSkill("body:0")'), false);
  run('skillProgress("body:0").practice=20;');
  assert.equal(run('upgradeSkill("body:0")'), true); assert.equal(run('skillProgress("body:0").rank'), 2);
  assert.equal(run('p.career.materials.books'), 10); assert.equal(run('p.gold'), 980);
  assert.equal(run('upgradeSkill("black:0")'), false);
});

test('biologist consumes samples, allows successive basic-stage submissions and grants permanent bonuses', () => {
  const { run } = createGame();
  run('running=true;loadMap("town",true);p.x=NPCS.biologist.x;p.y=NPCS.biologist.y;p.gold=10000;p.career.materials.wolf=20;');
  assert.equal(run('completeBiology()'), true); assert.equal(run('completeBiology()'), true);
  assert.equal(run('p.career.materials.wolf'), 18);
  run('p.x=100;p.y=100;p.career.eligibleKills=10;'); assert.equal(run('completeBiology()'), false);
  run('p.x=NPCS.biologist.x;p.y=NPCS.biologist.y;');
  const hp = run('maxHP()');
  for (let i = 2; i < 10; i++) { run(`p.career.eligibleKills=${i * 10};`); assert.equal(run('completeBiology()'), true); }
  assert.equal(run('p.career.biology.stage'), 1); assert.equal(run('maxHP()'), hp + 80);
  assert.equal(run('p.career.materials.wolf'), 10);
  assert.equal(run('completeBiology()'), false);
});

test('enhancement follows the item across swaps and cannot be bought without ore', () => {
  const { run } = createGame();
  run('running=true;loadMap("town",true);p.x=NPCS.smith.x;p.y=NPCS.smith.y;rand=()=>0;p.equipped.weapon={name:"A",slot:"weapon",bonus:10,rarity:0,value:10};p.bag=[{name:"B",slot:"weapon",bonus:12,rarity:0,value:10}];p.gold=1000;');
  assert.equal(run('enhanceEquipment("weapon")'), false); assert.equal(run('p.gold'), 1000);
  run('p.career.materials.ore=10;'); assert.equal(run('enhanceEquipment("weapon")'), true);
  assert.equal(run('equippedBonus("weapon")'), 12);
  run('equipItem(0);'); assert.equal(run('equippedBonus("weapon")'), 12);
  run('equipItem(0);'); assert.equal(run('equippedBonus("weapon")'), 12);
});

test('removed alchemy and relic mechanics cannot grant permanent bonuses',()=>{const {run}=createGame();assert.equal(run('typeof upgradeGem'),'undefined');assert.equal(run('typeof collectRelic'),'undefined');assert.equal(run('p.career.alchemy'),undefined);assert.equal(run('p.career.collection'),undefined);assert.equal(run('careerBonuses().attack'),0);});

test('ordinary bosses reward usable resources and never create retired drops',()=>{const {run}=createGame();run('running=true;rand=()=>0;for(let i=0;i<20;i++)careerKill({type:"boss",level:40,x:400,y:400});');assert(run('p.career.materials.books>0'));assert(run('p.career.materials.soulStones>0'));assert(run('drops.every(d=>d.kind!=="relic")'));});

test('specialization and endgame have separate gates and currencies', () => {
  const { run } = createGame();
  run('p.career.specialization.points=30;'); assert.equal(run('specialize("ravager")'), false);
  run('p.level=10;'); assert.equal(run('specialize("ravager")'), true); assert.equal(run('specialize("sentinel")'), false);
  assert.equal(run('trainSpecialization()'), true); assert.equal(run('careerBonuses().attackPercent'), .03);
  run('running=true;p.career.materials.keys=6;'); assert.equal(run('enterRift()'), false);
  run('p.level=35;'); run('loadMap("town",true);p.x=NPCS.dungeonMaster.x;p.y=NPCS.dungeonMaster.y;');assert.equal(run('enterRift()'), true);
  assert.equal(run('p.career.materials.keys'), 3); assert.equal(run('finishRift()'), false);
  assert.equal(run('loadMap("valley")'), false);
  run('for(const m of mobs.filter(m=>m.type==="wolf").slice(0,20))hit(m,999999);hit(mobs.find(m=>m.type==="boss"),999999);');
  assert.equal(run('finishRift()'), true); assert.equal(run('p.career.endgame.highest'), 1);
  assert.equal(run('p.career.materials.shards'), 13); assert.equal(run('finishRift()'), false);
  assert.equal(run('upgradeParagon()'), false);
  run('p.career.materials.shards=25;'); assert.equal(run('upgradeParagon()'), true);
  assert.equal(run('p.career.endgame.paragon'), 1); assert.equal(run('p.career.materials.shards'), 0);
  assert.equal(run('careerBonuses().attack'), 2); assert.equal(run('careerBonuses().hp'), 5);
});

test('higher skill ranks change real spell damage, healing and cooldown, rather than just UI values', () => {
  const { run } = createGame();
  run('rand=()=>.5;running=true;p.x=500;p.y=500;mobs.forEach(m=>m.hp=0);let foe=mobs[0];foe.x=520;foe.y=500;foe.hp=10000;foe.max=10000;castSkill(0);');
  const firstDamage = 10000 - run('foe.hp');
  run('foe.hp=10000;spellCD.fill(0);p.mp=maxMP();skillProgress("body:0").rank=5;castSkill(0);');
  assert(10000 - run('foe.hp') > firstDamage); assert(run('spellCD[0] < 7'));
  run('p.classId="shaman";p.schools.shaman="healing";p.hp=1;p.mp=maxMP();spellCD.fill(0);castSkill(3);');
  const firstHeal = run('p.hp');
  run('skillProgress("healing:3").rank=5;p.hp=1;p.mp=maxMP();spellCD.fill(0);castSkill(3);');
  assert(run('p.hp') > firstHeal); assert(run('spellCD[3] < 8'));
});

test('repeatable quest cannot bypass EXP penalties and capped systems do not consume resources', () => {
  const { run } = createGame();
  run('running=true;p.career.eligibleKills=10;claimHunt();'); assert.equal(run('p.xp'), 0);
  run('p.career.materials.training=1000;p.gold=100000;p.career.training.strength=20;');
  assert.equal(run('typeof trainAttribute'), 'undefined'); assert.equal(run('p.gold'), 100000);
  run('p.equipped.weapon={slot:"weapon",bonus:10,enhance:9};p.career.materials.ore=10000;');
  assert.equal(run('enhanceEquipment("weapon")'), false); assert.equal(run('p.career.materials.ore'), 10000);
  run('for(let i=0;i<20000;i++)experience(enemyXP({type:"wolf",level:1}));');
  assert(run('p.level < 13'));
});

test('an active expedition survives reload and abandoning restores the ordinary map', () => {
  const { run, saved } = createGame();
  run('running=true;p.level=35;p.career.materials.keys=3;loadMap("temple");let normalHP=mobs[0].max,normalBossHP=mobs.find(m=>m.type==="boss").max;loadMap("town",true);p.x=NPCS.dungeonMaster.x;p.y=NPCS.dungeonMaster.y;enterRift();hit(mobs[0],999999);save();');
  assert(run('mobs.find(m=>m.type==="boss").max > normalBossHP'));
  const reload = createGame(readSavedProfile(saved));
  assert.equal(reload.run('p.career.endgame.run.kills'), 1);
  assert.equal(reload.run('mobs[0].hp'), 0);
  reload.run('running=true;'); assert.equal(reload.run('finishRift(false)'), true);
  reload.run('loadMap("temple");'); assert.equal(reload.run('mobs[0].max'), run('normalHP'));
  assert.equal(reload.run('p.career.endgame.highest'), 0);
});

test('every progression panel opens and the entire career persists in the save', () => {
  const { run, elements, saved } = createGame();
  run('running=true;');
  for (const tab of ['overview','discovery','metins']) {
    run(`careerPanel('${tab}');`); assert.equal(elements.get('modal').hidden, false); assert.equal(run('gameWindows.has("career:'+tab+'")'),true);assert.equal(run('paused'),false);
  }
  run('p.career.materials.books=8;p.career.biology.stage=1;save();');
  const reload = createGame(readSavedProfile(saved));
  assert.equal(reload.run('p.career.materials.books'), 8); assert.equal(reload.run('careerBonuses().attack'), 0); assert.equal(reload.run('careerBonuses().hp'), 80);
});

