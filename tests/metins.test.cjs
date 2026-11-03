const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedProfile } = require('./helpers/game.cjs');

test('Šuterland contains exactly one protected Metin for every level 1–99 and no ambient enemies', () => {
  const { run } = createGame();
  run('running=true;loadMap("suterland");let stones=[...mobs].sort((a,b)=>a.level-b.level);');
  assert.equal(run('mobs.length'), 99); assert(run('mobs.every(m=>m.type==="stone")'));
  assert.equal(run('spawnPoints.length'), 99); assert.equal(run('new Set(mobs.map(m=>m.spawnId)).size'), 99);
  assert(run('stones.every((m,i)=>m.level===i+1&&m.metinType===metinTypeForLevel(i+1))'));
  assert(run('stones.every(m=>!isSanctuary(m)&&Math.hypot(m.x-1000,m.y-1050)>=SPAWN_RULES.spawnClearance)'));
  assert.equal(run('new Set(stones.map(m=>m.metinType)).size'), 8);
  run('for(let i=0;i<100;i++)updateMetins(.05,false);draw();');
  assert.equal(run('mobs.length'), 99);
  assert.deepEqual(Array.from(run('FARM_AREAS.map(a=>farmAreaLevelRange(a).join("–"))')), ['1–25','26–50','51–75','76–99']);
});

test('normal maps keep eight stones with local types, and all eight models render independently', () => {
  const { run } = createGame();
  for (const id of ['valley','desert','snow','temple']) {
    run(`loadMap('${id}',true);`);
    assert.equal(run('mobs.filter(m=>m.type==="stone").length'), 8);
    assert.equal(run('new Set(mobs.filter(m=>m.type==="stone").map(m=>m.metinType)).size'), 2);
    assert(run('mobs.filter(m=>m.type==="stone").every(m=>m.metinSchema===METIN_RULES.schema&&m.max>0&&m.metinResistance>0)'));
  }
  assert.equal(run('new Set(Object.values(METIN_TYPES).map(t=>t.model)).size'), 8);
  run('for(const spec of Object.values(METIN_TYPES))drawMetinModel(spec.model,spec.color,spec.glow);');
});

test('Metin HP, armor and resistance scale with level and actual damage and life steal honor resistance', () => {
  const { run } = createGame();
  run('loadMap("suterland",true);let stones=[...mobs].sort((a,b)=>a.level-b.level);');
  assert(run('stones.every((m,i)=>!i||m.max>stones[i-1].max&&m.metinArmor>=stones[i-1].metinArmor&&m.metinResistance>=stones[i-1].metinResistance)'));
  assert(run('metinDamage(stones[98],100)<metinDamage(stones[0],100)'));
  run('let stone=stones[60],before=stone.hp,expected=metinDamage(stone,100),dealt=hit(stone,100);');
  assert.equal(run('dealt'), run('expected')); assert.equal(run('before-stone.hp'), run('dealt'));
  assert.equal(run('metinDamage(stone,1)'), 1);
  run('p.hp=1;buffs.enchanted=20;rand=()=>.99;let old=stone.hp;hurtMob(stone,1);let actual=old-stone.hp;');
  assert(Math.abs(run('p.hp')-(1+run('actual')*.15))<1e-8);
});

test('attacking summons frequent matching-level aggressive waves that move and hurt the player', () => {
  const { run } = createGame();
  run('running=true;loadMap("suterland",true);let stone=mobs.find(m=>m.level===50);p.level=50;p.x=stone.x-65;p.y=stone.y;p.hp=100000;let health=p.hp;hit(stone,1);updateMetins(.19,false);');
  assert.equal(run('mobs.filter(m=>m.metinParentId).length'), 0);
  run('updateMetins(.02,false);let first=mobs.filter(m=>m.metinParentId);let distances=first.map(m=>Math.hypot(m.x-p.x,m.y-p.y));');
  assert.equal(run('first.length'), 4);
  assert(run('first.every(m=>m.skin==="yeti"&&m.level>=49&&m.level<=51&&m.engaged>0&&m.metinParentId===stone.spawnId)'));
  run('for(let i=0;i<100;i++){if(i%20===0)hit(stone,1);updateMetins(.05,false);updateEnemySpawns(.05,false);}');
  assert(run('first.some((m,i)=>Math.hypot(m.x-p.x,m.y-p.y)<distances[i])'));
  assert(run('p.hp<health'));
  assert.equal(run('mobs.filter(m=>m.metinParentId&&m.hp>0).length'), 8);
  assert.equal(run('mobs.filter(m=>m.type==="stone").length'), 99);
});

test('waves stop after death or combat timeout and respect pause, sanctuary and stealth', () => {
  for (const mode of ['dead','timeout','paused','safe','stealth']) {
    const { run } = createGame();
    run('running=true;let stone=mobs.find(m=>m.type==="stone");p.x=stone.x;p.y=stone.y;hit(stone,1);');
    if(mode==='dead')run('hit(stone,999999);');
    if(mode==='timeout')run('stone.metinCombat=0;');
    if(mode==='paused')run('paused=true;');
    if(mode==='stealth')run('buffs.stealth=20;');
    run(`updateMetins(1,${mode==='safe'});`);
    assert.equal(run('mobs.filter(m=>m.metinParentId).length'), 0, mode);
  }
});

test('clicking the visible stone body attacks it and activates its waves', () => {
  const { run, listeners } = createGame();
  run('running=true;let stone=mobs.find(m=>m.type==="stone");p.x=stone.x-60;p.y=stone.y;cam.x=p.x;cam.y=p.y;let at=screen(stone.x,stone.y),before=stone.hp;');
  listeners.get('game:pointerdown')({clientX:run('at.x'),clientY:run('at.y-70'),button:0});
  assert(run('stone.hp<before')); assert(run('stone.metinCombat>0'));
});

test('guard caps bound population and expiry grants no rewards; killed guards never respawn', () => {
  const { run } = createGame();
  run('running=true;loadMap("suterland",true);let stones=mobs.filter(m=>m.level>=65);for(let wave=0;wave<5;wave++)for(const s of stones)spawnMetinGuards(s);');
  assert.equal(run('mobs.filter(m=>m.metinParentId&&m.hp>0).length'), 60);
  assert(run('mobs.filter(s=>s.type==="stone").every(s=>mobs.filter(g=>g.metinParentId===s.spawnId&&g.hp>0).length<=8)'));
  run('let guard=mobs.find(m=>m.metinParentId);hit(guard,99999);let xp=p.xp,dropCount=drops.length;updateEnemySpawns(2,false);');
  assert.equal(run('guard.hp'), 0);
  run('updateMetins(46,false);'); assert.equal(run('mobs.length'), 99);
  assert.equal(run('p.xp'), run('xp')); assert.equal(run('drops.length'), run('dropCount'));
});

test('every Metin pool covers Yang, materials, books, alchemy, upgrade stones, gear and rare relics on the ground', () => {
  const { run } = createGame();
  assert.equal(run('new Set(Object.values(METIN_TYPES).map(t=>JSON.stringify(t.loot))).size'), 8);
  for (const id of Object.keys(run('METIN_TYPES'))) {
    run(`drops.length=0;rand=()=>0;var s={type:'stone',metinType:'${id}',level:METIN_TYPES['${id}'].levels[0],x:400,y:400};p.level=s.level;dropMetinLoot(s);`);
    assert(run('drops.some(d=>d.kind==="gold"&&d.currencyName==="Yang"&&d.count>0)'));
    for (const material of ['ore','books','essence','dust','upgradeStones']) assert(run(`drops.some(d=>d.supplyId==='material:${material}'&&d.count>0)`), id+': '+material);
    assert(run('drops.some(d=>d.kind==="gear"&&METIN_TYPES[s.metinType].loot.slots.includes(d.item.slot)&&d.item.requiredLevel===s.level)'));
    assert(run('drops.some(d=>d.kind==="relic"&&d.relicId===METIN_TYPES[s.metinType].loot.relic)'));
    assert(run('drops.every(d=>d.fallAge===0)')); assert.equal(run('p.bag.length'),0);
  }
});

test('drop chances differ by type, weak stones cannot farm advancement loot and deaths do not duplicate rewards', () => {
  const { run } = createGame();
  run('rand=()=>.1;p.level=1;let low={type:"stone",metinType:"fracture",level:1,x:400,y:400};dropMetinLoot(low);');
  assert(!run('drops.some(d=>d.supplyId==="material:upgradeStones")'));
  run('drops.length=0;p.level=99;dropMetinLoot({...low,metinType:"doom",level:99});');
  assert(run('drops.some(d=>d.supplyId==="material:upgradeStones")'));
  run('drops.length=0;dropMetinLoot(low);'); assert.equal(run('drops.length'),1); assert.equal(run('drops[0].kind'),'gold');
  run('p.level=1;drops.length=0;rand=()=>.999;let stone=mobs.find(m=>m.type==="stone");stone.level=3;stone.metinType="fracture";hit(stone,999999);let count=drops.length;hit(stone,999999);');
  assert.equal(run('drops.length'),run('count')); assert(!run('drops.some(d=>d.supplyId==="material:books"||d.supplyId==="material:dust")'));
});

test('new upgrade stones have a real forge cost from +4 and old material balances migrate intact', () => {
  const { run, saved } = createGame();
  run('p.gold=10000;p.career.materials.ore=1000;p.equipped.weapon={name:"Meč",slot:"weapon",bonus:10,enhance:3};');
  assert.equal(run('enhanceEquipment("weapon")'),false); assert.equal(run('p.gold'),10000); assert.equal(run('p.career.materials.ore'),1000);
  run('addMaterial("upgradeStones",1);'); assert.equal(run('enhanceEquipment("weapon")'),true);
  assert.equal(run('p.equipped.weapon.enhance'),4); assert.equal(run('p.career.materials.upgradeStones'),0);
  run('save();'); const profile=readSavedProfile(saved); delete profile.career.materials.upgradeStones;
  const reload=createGame(profile); assert.equal(reload.run('p.career.materials.upgradeStones'),0); assert.equal(reload.run('p.career.materials.ore'),run('p.career.materials.ore'));
});

test('active Metins, guards and ground loot persist without multiplying their identities', () => {
  const { run, saved } = createGame();
  run('running=true;loadMap("suterland",true);let stone=mobs.find(m=>m.level===35);p.x=stone.x-70;p.y=stone.y;hit(stone,100);updateMetins(.21,false);let id=stone.spawnId,health=stone.hp,cooldown=stone.metinWaveTimer;spawnGroundDrop({kind:"gold",count:50},stone);save();');
  const reload=createGame(readSavedProfile(saved));
  assert.equal(reload.run('p.mapId'),'suterland'); assert.equal(reload.run('mobs.filter(m=>m.type==="stone").length'),99);
  assert.equal(reload.run(`mobs.find(m=>m.spawnId==='${run('id')}').hp`),run('health'));
  assert.equal(reload.run(`mobs.find(m=>m.spawnId==='${run('id')}').metinWaveTimer`),run('cooldown'));
  assert.equal(reload.run('mobs.filter(m=>m.metinParentId).length'),3);
  assert.equal(reload.run('new Set(mobs.map(m=>m.spawnId)).size'),reload.run('mobs.length'));
  assert.equal(reload.run('drops.length'),1);
});

test('old stones retain HP percentage, death timers and loot while gaining new types and defenses', () => {
  const { run, saved } = createGame(); run('save();'); const old=readSavedProfile(saved);
  const stones=old.worldStates.valley.mobs.filter(m=>m.type==='stone');
  for(const s of stones)for(const key of Object.keys(s))if(key.startsWith('metin'))delete s[key];
  Object.assign(stones[0],{max:160,hp:80}); Object.assign(stones[1],{max:160,hp:0,dead:7});
  old.worldStates.valley.drops=[{x:400,y:400,value:50}]; const reload=createGame(old);
  assert.equal(reload.run('mobs.length'),157); assert.equal(reload.run('mobs.filter(m=>m.type==="stone")[1].dead'),7);
  assert.equal(reload.run('mobs.filter(m=>m.type==="stone")[1].hp'),0);
  assert(Math.abs(reload.run('mobs.filter(m=>m.type==="stone")[0].hp/mobs.filter(m=>m.type==="stone")[0].max')-.5)<.005);
  assert(reload.run('mobs.filter(m=>m.type==="stone").every(m=>m.metinType&&m.metinResistance>0)'));
  assert.equal(reload.run('drops[0].count'),50);
});

test('the Atlas and travel menu expose Šuterland and every type-specific loot chance', () => {
  const { run, elements } = createGame(); run('running=true;travelMenu();');
  assert.match(elements.get('modalcontent').innerHTML,/Šuterland/); assert.match(elements.get('modalcontent').innerHTML,/99 Metinov/);
  elements.get('metinAtlas').onclick(); const html=elements.get('modalcontent').innerHTML;
  assert.equal(run('metinPercent(.025)'), '2,5 %');
  for(const name of ['Metin praskliny','Metin skazy','Kamene vylepšenia','Yang','Vzácna relikvia'])assert(html.includes(name));
});
