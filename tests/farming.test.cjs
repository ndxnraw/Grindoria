const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedProfile } = require('./helpers/game.cjs');

test('each map has dense packs, four level regions and unique protected spawn slots', () => {
  const { run } = createGame(); run('running=true;');
  const expected = { valley: 292, desert: 364, snow: 364, temple: 412 };
  for (const [id, count] of Object.entries(expected)) {
    assert.equal(run(`loadMap('${id}')`), true);
    assert.equal(run('mobs.filter(m=>m.type==="wolf").length'), count);
    assert.equal(run('mobs.filter(m=>m.type==="stone").length'), 8);
    assert.equal(run('mobs.filter(m=>m.type==="boss").length'), 1);
    assert.equal(run('spawnPoints.filter(point=>point.kind==="pack").length'), run('map().packCount'));
    assert.equal(run('new Set(mobs.map(m=>m.spawnId)).size'), count + 9);
    assert(run('mobs.every(m=>Math.hypot(m.homeX-safeZone().x,m.homeY-safeZone().y)>=SPAWN_RULES.spawnClearance-1e-8)'));
    for (const area of ['southwest', 'southeast', 'northwest', 'northeast']) assert(run(`mobs.some(m=>m.type==='wolf'&&m.area==='${area}')`));
    assert(run('Math.max(...FARM_AREAS.map(a=>farmAreaLevelRange(a)[0]))>Math.min(...FARM_AREAS.map(a=>farmAreaLevelRange(a)[0]))'));
    run('draw();');
  }
});

test('elite and rare rolls produce stronger enemies and appropriate respawn intervals', () => {
  const { run } = createGame();
  run('let point=spawnPoints.find(p=>p.kind==="pack"&&!p.starter&&p.area!=="southwest");rand=()=>.5;let normal=createSpawnEnemy(point,2);rand=()=>.04;let elite=createSpawnEnemy(point,2);rand=()=>.001;let rare=createSpawnEnemy(point,2);');
  assert.equal(run('normal.variant'), 'normal'); assert.equal(run('elite.variant'), 'elite'); assert.equal(run('rare.variant'), 'rare');
  assert(run('normal.max<elite.max&&elite.max<rare.max'));
  assert(run('normal.attackScale<elite.attackScale&&elite.attackScale<rare.attackScale'));
  assert.equal(run('normal.respawnSeconds'), 8); assert.equal(run('elite.respawnSeconds'), 12); assert.equal(run('rare.respawnSeconds'), 60);
  assert.equal(run('createSpawnEnemy(spawnPoints.find(p=>p.kind==="rare")).respawnSeconds'), 180);
});

test('rare kills have better gold, EXP, equipment and materials without bypassing weak-target penalties', () => {
  const { run } = createGame();
  run('rand=()=>.5;p.level=10;p.xp=0;let regular={...mobs[0],hp:1,level:10,variant:"normal",skillContributors:[]};hit(regular,2);');
  const xp = run('p.xp'), gold = run('p.gold');
  run('let rare={...mobs[0],hp:1,level:10,variant:"rare",skillContributors:[]};hit(rare,2);');
  assert(run('p.xp') - xp > xp); assert.equal(run('p.gold')-gold, gold * 4);
  assert(run('drops.some(d=>d.kind==="gear"&&d.item.rarity>=1)'));
  run('running=true;for(const drop of [...drops]){drop.fallAge=LOOT_RULES.fallDuration;p.x=drop.x;p.y=drop.y;pickUpGroundDrop(drop.id);}');
  assert(run('p.bag.at(-1).rarity>=1')); assert(run('p.career.materials.books>=1'));
  assert(run('p.career.materials.ore>=3')); assert.equal(run('p.braveryCapes'), 12);
  const books = run('p.career.materials.books'); run('hit(rare,100);'); assert.equal(run('p.career.materials.books'), books);
  run('p.level=30;'); assert.equal(run('enemyXP({...rare,level:1})'), 0);
});

test('cape consumes one inventory unit and only attracts alive mobile enemies within its exact range', () => {
  const { run, saved } = createGame();
  run('running=true;p.x=400;p.y=400;p.braveryCapes=2;mobs.forEach(m=>{m.hp=0;m.dead=1000;});let near=mobs[0],outside=mobs[1],boss=mobs.find(m=>m.type==="boss"),stone=mobs.find(m=>m.type==="stone");Object.assign(near,{hp:55,x:1050,y:400});Object.assign(outside,{hp:55,x:1051,y:400});Object.assign(boss,{hp:100,x:1000,y:400});Object.assign(stone,{hp:100,x:500,y:400});');
  assert.equal(run('useBraveryCape()'), true); assert.equal(run('p.braveryCapes'), 1);
  assert.equal(run('near.taunt'), 18); assert.equal(run('boss.taunt'), 18); assert.equal(run('outside.taunt'), 0); assert.equal(run('stone.taunt'), 0);
  assert.equal(run('effects.at(-1).style'), 'bravery');
  run('draw();');
  assert.equal(run('useBraveryCape()'), false); assert.equal(run('p.braveryCapes'), 1);
  assert.equal(readSavedProfile(saved).braveryCapes, 1);
});

test('a cape pulls whole packs together rather than marking only the nearest monster', () => {
  const { run } = createGame();
  run('running=true;p.x=350;p.y=1400;p.hp=100000;mobs.forEach(m=>{m.hp=0;m.dead=1000;});let pack=mobs.filter(m=>m.type==="wolf").slice(0,12);pack.forEach((m,i)=>Object.assign(m,{hp:1000,x:700+i%4*40,y:1300+Math.floor(i/4)*70,homeX:700+i%4*40,homeY:1300+Math.floor(i/4)*70}));let distances=pack.map(m=>Math.hypot(m.x-p.x,m.y-p.y));useBraveryCape();for(let i=0;i<100;i++)update(.05);');
  assert.equal(run('pack.filter(m=>m.taunt>0).length'), 12);
  assert(run('pack.every((m,i)=>Math.hypot(m.x-p.x,m.y-p.y)<distances[i]-100)'));
});

test('taunted packs and bosses really approach from beyond normal aggro distance', () => {
  const { run } = createGame();
  run('running=true;p.x=400;p.y=400;p.hp=100000;mobs.forEach(m=>{m.hp=0;m.dead=1000;});let farmTarget=mobs[0],boss=mobs.find(m=>m.type==="boss");Object.assign(farmTarget,{hp:1000,x:1000,y:400,homeX:1000,homeY:400});Object.assign(boss,{hp:1000,x:1010,y:450});useBraveryCape();let before=Math.hypot(farmTarget.x-p.x,farmTarget.y-p.y),bossBefore=Math.hypot(boss.x-p.x,boss.y-p.y);for(let i=0;i<80;i++)update(.05);');
  assert(run('Math.hypot(farmTarget.x-p.x,farmTarget.y-p.y)<before-150'));
  assert(run('Math.hypot(boss.x-p.x,boss.y-p.y)<bossBefore-150'));
  assert(run('farmTarget.taunt>0')); assert(run('boss.taunt>0'));
});

test('cape cannot be used while paused, dead, before starting or inside sanctuary; zero is saved as zero', () => {
  const { run, saved } = createGame();
  assert.equal(run('useBraveryCape()'), false);
  run('running=true;'); assert.equal(run('useBraveryCape()'), false); assert.equal(run('p.braveryCapes'), 10);
  run('p.x=400;p.y=400;paused=true;'); assert.equal(run('useBraveryCape()'), false);
  run('paused=false;p.hp=0;'); assert.equal(run('useBraveryCape()'), false);
  run('p.hp=100;p.braveryCapes=1;mobs.forEach(m=>m.hp=0);'); assert.equal(run('useBraveryCape()'), true);
  assert.equal(run('p.braveryCapes'), 0); run('capeCooldown=0;'); assert.equal(run('useBraveryCape()'), false);
  run('save();'); const reload = createGame(readSavedProfile(saved)); assert.equal(reload.run('p.braveryCapes'), 0);
});

test('8 and the action button use the same cape logic and the shop restocks finite stacks', () => {
  const { run, listeners, elements } = createGame();
  run('running=true;p.x=400;p.y=400;');
  listeners.get('keydown')({ key: '8', repeat: false, target: { tagName: 'CANVAS' }, preventDefault() {} });
  assert.equal(run('p.braveryCapes'), 9);
  run('capeCooldown=0;'); elements.get('bravery').onclick(); assert.equal(run('p.braveryCapes'), 8);
  run('loadMap("town",true);p.x=NPCS.merchant.x;p.y=NPCS.merchant.y;p.gold=99;'); assert.equal(run('buyBraveryCapes()'), false); assert.equal(run('p.gold'), 99);
  run('p.gold=100;'); assert.equal(run('buyBraveryCapes()'), true); assert.equal(run('p.braveryCapes'), 18); assert.equal(run('p.gold'), 0);
  run('inventory();'); assert.equal(run('supplyEntries().find(e=>e.id==="braveryCapes").count'),18);assert(!elements.get('modalcontent').innerHTML.includes('item-inspector'));
});

test('spawn slots repeatedly replenish in place, reroll variants and clear old combat effects', () => {
  const { run } = createGame();
  run('running=true;rand=()=>.5;let farmTarget=mobs.find(m=>m.type==="wolf"&&!m.rareSlot&&m.spawnSlot===2&&m.area!=="southwest");farmTarget.hp=1;farmTarget.variant="normal";farmTarget.respawnSeconds=5;let identity=farmTarget,spawn=farmTarget.spawnId;hit(farmTarget,2);farmTarget.dot={time:20,tick:1,power:100};farmTarget.taunt=10;');
  run('updateEnemySpawns(4.9,true);'); assert.equal(run('farmTarget.hp'), 0);
  run('rand=()=>.04;updateEnemySpawns(.2,true);'); assert.equal(run('farmTarget.variant'), 'elite'); assert.equal(run('farmTarget.hp'), run('farmTarget.max'));
  assert.equal(run('farmTarget===identity'), true); assert.equal(run('farmTarget.spawnId'), run('spawn')); assert.equal(run('farmTarget.dot'), undefined); assert.equal(run('farmTarget.taunt'), 0);
  run('hit(farmTarget,999999);'); assert.equal(run('farmTarget.dead'), 12);
  run('rand=()=>.5;updateEnemySpawns(12.1,true);'); assert.equal(run('farmTarget.variant'), 'normal'); assert.equal(run('farmTarget.hp'), run('farmTarget.max'));
});

test('migration fills new slots without duplicating old dead enemies, loot or timers', () => {
  const old = { level: 1, hp: 100, xp: 0, gold: 777, worldStates: { valley: { mobs: [
    { type: 'wolf', hp: 0, max: 55, dead: 3, x: 500, y: 500, homeX: 500, homeY: 500, cd: 0, hit: 0 },
    { type: 'stone', hp: 0, max: 160, dead: 12, x: 610, y: 630, cd: 0, hit: 0 }
  ], drops: [{ x: 500, y: 500, value: 91 }] } } };
  const { run, saved } = createGame(old);
  assert.equal(run('mobs.length'), 301); assert.equal(run('mobs.filter(m=>m.hp<=0).length'), 2);
  assert.equal(run('mobs.find(m=>m.hp<=0&&m.type==="wolf").dead'), 3);
  assert.equal(run('mobs.find(m=>m.hp<=0&&m.type==="stone").dead'), 12);
  assert.equal(run('drops.length'), 1); assert.equal(run('drops[0].value'), 91); assert.equal(run('p.gold'), 777);
  run('save();'); const reload = createGame(readSavedProfile(saved));
  assert.equal(reload.run('mobs.length'), 301); assert.equal(reload.run('mobs.filter(m=>m.hp<=0).length'), 2); assert.equal(reload.run('drops.length'), 1);
});

test('new spawn layouts and variant identities persist while transient taunts reset on reload', () => {
  const { run, saved } = createGame();
  run('let rare=mobs.find(m=>m.rareSlot);rare.hp=rare.max/2;rare.taunt=15;rare.engaged=15;let id=rare.spawnId,health=rare.hp,variant=rare.variant;save();');
  const reload = createGame(readSavedProfile(saved));
  assert.equal(reload.run(`mobs.find(m=>m.spawnId==='${run('id')}').hp`), run('health'));
  assert.equal(reload.run(`mobs.find(m=>m.spawnId==='${run('id')}').variant`), run('variant'));
  assert.equal(reload.run(`mobs.find(m=>m.spawnId==='${run('id')}').taunt`), 0);
});

test('enemies route around sanctuary and protected attacks cannot farm from inside it', () => {
  const { run } = createGame();
  run('let walker={x:safeZone().x-200,y:safeZone().y};let closest=10000;for(let i=0;i<150;i++){walkEnemy(walker,safeZone().x+200,safeZone().y,120,.05);closest=Math.min(closest,Math.hypot(walker.x-safeZone().x,walker.y-safeZone().y));}');
  assert(run('closest>=SPAWN_RULES.sanctuaryRadius')); assert(run('walker.x>safeZone().x'));
  run('running=true;p.classId="sura";p.schools.sura="black";let mp=p.mp;'); assert.equal(run('castSkill(0)'), false); assert.equal(run('p.mp'), run('mp'));
  run('p.classId="shaman";p.schools.shaman="healing";p.hp=10;'); assert.equal(run('castSkill(3)'), true); assert(run('p.hp>10'));
});

test('large packs can be simulated without unbounded spawning or breaking the rift snapshot', () => {
  const { run, saved } = createGame();
  run('running=true;p.level=35;p.career.materials.keys=3;loadMap("temple");let normal=mobs[0].max;loadMap("town",true);p.x=NPCS.dungeonMaster.x;p.y=NPCS.dungeonMaster.y;enterRift();let count=mobs.length;for(const m of mobs){m.hp=0;m.dead=0;}for(let i=0;i<100;i++)update(.05);save();');
  assert.equal(run('mobs.length'), run('count')); assert.equal(run('mobs.length'), 421);
  assert(run('mobs.every(m=>m.riftId===p.career.endgame.run.id)'));
  const reload = createGame(readSavedProfile(saved));
  reload.run('running=true;finishRift(false);loadMap("temple");'); assert.equal(reload.run('mobs[0].max'), run('normal'));
});

test('an already active sparse 0.4 expedition remains intact until its normal map is upgraded on exit', () => {
  const { run, saved } = createGame();
  run('running=true;p.level=35;p.career.materials.keys=3;loadMap("temple");loadMap("town",true);p.x=NPCS.dungeonMaster.x;p.y=NPCS.dungeonMaster.y;enterRift();p.career.endgame.run.kills=7;save();');
  const old = readSavedProfile(saved);
  function sparse(state) {
    delete state.spawnSchema;
    state.mobs = [...state.mobs.filter(m => m.type === 'wolf').slice(0, 24), ...state.mobs.filter(m => m.type === 'stone').slice(0, 3), state.mobs.find(m => m.type === 'boss')];
    for (const m of state.mobs) for (const key of ['spawnId', 'spawnPointId', 'spawnSlot', 'variant', 'rareSlot']) delete m[key];
  }
  sparse(old.worldStates.temple); sparse(old.career.normalTemple);
  old.worldStates.temple.mobs[0].hp = 0; old.worldStates.temple.mobs[0].dead = 3;
  old.career.normalTemple.drops = [{ x: 300, y: 300, value: 123 }];
  const reload = createGame(old);
  assert.equal(reload.run('legacyRiftLayout'), true); assert.equal(reload.run('mobs.length'), 28);
  assert.equal(reload.run('p.career.endgame.run.kills'), 7); assert.equal(reload.run('mobs[0].hp'), 0);
  reload.run('running=true;updateEnemySpawns(3.1,true);'); assert.equal(reload.run('mobs[0].hp'), reload.run('mobs[0].max'));
  reload.run('finishRift(false);loadMap("temple");');
  assert.equal(reload.run('legacyRiftLayout'), false); assert.equal(reload.run('mobs.length'), 421);
  assert.equal(reload.run('drops[0].value'), 123);
});

