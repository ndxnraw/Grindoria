const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedProfile } = require('./helpers/game.cjs');

test('moving across loot never opens details; only resting on one item for 550 ms shows its tooltip', () => {
  const { run, elements } = createGame();
  run('running=true;p.x=400;p.y=400;cam.x=400;cam.y=400;let drop=spawnGroundDrop({kind:"gear",item:{slot:"weapon",name:"Meč",bonus:2}},p);Object.assign(drop,{x:400,y:400,launchX:400,launchY:400,fallAge:.65});setLootPointer({clientX:600,clientY:333});');
  assert.equal(elements.get('loot-tooltip').hidden, true); assert.equal(run('hoveredLootId'), null);
  for(let i=0;i<20;i++)run('setLootPointer({clientX:595+(i%2)*10,clientY:333});updateLootHover(.05);'.replace('i%2',String(i%2)));
  assert.equal(elements.get('loot-tooltip').hidden, true);
  run('setLootPointer({clientX:600,clientY:333});updateLootHover(.54);'); assert.equal(elements.get('loot-tooltip').hidden, true);
  run('updateLootHover(.02);'); assert.equal(elements.get('loot-tooltip').hidden, false); assert.equal(run('hoveredLootId'), run('drop.id'));
  run('setLootPointer({clientX:605,clientY:333});'); assert.equal(elements.get('loot-tooltip').hidden, true);
  assert.equal(run('pickNearbyGroundDrops()'), 1);
});

test('all unpicked loot expires, with extra time for epic gear and relics, without awarding anything', () => {
  const { run } = createGame();
  run('running=true;p.x=1000;p.y=1160;let now=1000000;Date.now=()=>now;let source={x:400,y:400};for(let payload of [{kind:"gold",count:50},{kind:"supply",supplyId:"potions",count:1},{kind:"gear",item:{slot:"weapon",name:"Meč",rarity:0}},{kind:"gear",item:{slot:"armor",name:"Epické",rarity:2}},{kind:"relic",relicId:"valley",count:1}])spawnGroundDrop(payload,source);let before=JSON.stringify({gold:p.gold,potions:p.potions,bag:p.bag,collection:p.career.collection});now+=180000;updateGroundLoot(.05);');
  assert.equal(run('drops.length'), 2); assert(run('drops.every(d=>d.kind==="relic"||d.item.rarity===2)'));
  run('now+=420000;updateGroundLoot(.05);'); assert.equal(run('drops.length'), 0);
  assert.equal(run('JSON.stringify({gold:p.gold,potions:p.potions,bag:p.bag,collection:p.career.collection})'), run('before'));
});

test('expiry survives save, travel and reload; legacy loot gets one finite lifetime and expired gear cannot be clicked', () => {
  const { run, saved } = createGame();
  run('running=true;let drop=spawnGroundDrop({kind:"gear",item:{slot:"weapon",name:"Meč"}},p);drop.expiresAt=Date.now()+60000;save();');
  const stamp=run('drop.expiresAt'), reloaded=createGame(readSavedProfile(saved));
  assert.equal(reloaded.run('drops[0].expiresAt'),stamp);
  reloaded.run('running=true;loadMap("desert");loadMap("valley");'); assert.equal(reloaded.run('drops[0].expiresAt'),stamp);
  const profile=readSavedProfile(saved);profile.worldStates.valley.drops[0].expiresAt=1;
  assert.equal(createGame(profile).run('drops.length'),0);
  run('drop.expiresAt=1;drop.fallAge=.65;');assert.equal(run('pickUpGroundDrop(drop.id)'),false);assert.equal(run('p.bag.length'),0);
  run('let migrated=hydrateGroundDrops([{x:400,y:400,value:20}]);let again=hydrateGroundDrops(migrated);');
  assert(run('Number.isFinite(migrated[0].expiresAt)'));assert.equal(run('again[0].expiresAt'),run('migrated[0].expiresAt'));
});

test('ordinary gear drops are 3 percent, elites 20 percent, while rare enemies and bosses retain rewards', () => {
  const { run } = createGame();
  for(const [variant,chance] of [['normal',.03],['elite',.2]]){
    run('drops.length=0;var sample={type:"wolf",variant:"'+variant+'",level:1,x:400,y:400};');
    run('rand=()=>'+chance+';dropFarmEquipment(sample);');assert.equal(run('drops.length'),0);
    run('rand=()=>'+(chance-.00001)+';dropFarmEquipment(sample);');assert.equal(run('drops.length'),1);
  }
  run('rand=()=>.99;dropFarmEquipment({...sample,variant:"rare"});dropFarmEquipment({...sample,type:"boss"});');assert.equal(run('drops.length'),3);
});

test('expired loot is pruned from inactive map snapshots and stored temple loot',()=>{
  const {run}=createGame();run('p.worldStates.desert={mobs:[],drops:[{kind:"gold",count:2,x:400,y:400,expiresAt:1}]};p.career.normalTemple={drops:[{kind:"gear",item:{slot:"weapon"},expiresAt:1}]};save();');
  assert.equal(run('p.worldStates.desert.drops.length'),0);assert.equal(run('p.career.normalTemple.drops.length'),0);
});
