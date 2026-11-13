const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame}=require('./helpers/game.cjs');

test('sourced areas spawn their own species at their recorded levels with recorded EXP',()=>{
 const {run}=createGame();
 assert.equal(run('METIN_WORLD_ROWS.length'),45);
 assert(run(`METIN_WORLD_ROWS.every(([id])=>{
   loadMap(id,true);
   const population=mobs.filter(m=>m.monsterId!==undefined);
   return population.every(m=>MAPS[id].roster.includes(m.monsterId)&&
     METIN_MONSTER_ROWS[m.monsterId][1]===m.level&&METIN_MONSTER_ROWS[m.monsterId][0]===m.name)&&
     MAPS[id].roster.every(id=>population.some(m=>m.monsterId===id));
 })`));
 run('loadMap("yongan",true);p.level=1;p.xp=0;var dog=mobs.find(m=>m.name==="Divoký pes");');
 assert.equal(run('enemyXP(dog)'),15);
 run('hit(dog,1e9);');
 assert.equal(run('p.xp'),15);
 run('respawnEnemy(dog);');
 assert.equal(run('enemyXP(dog)'),15);
 run('var stone=mobs.find(m=>m.name==="Metin smutku");spawnMetinGuards(stone);');
 assert(run('mobs.filter(m=>m.metinParentId===stone.spawnId).every(m=>WORLD_METIN_GUARDS[stone.name].includes(m.name)&&m.level===METIN_MONSTER_ROWS[m.monsterId][1])'));
});

test('EXP quarter points, skill points, stacking and the lock persist',()=>{
 const {run,saved}=createGame();
 run('p.level=1;p.xp=0;p.points=0;experience(75);');
 assert.equal(run('p.points'),1);
 run('experience(150);');
 assert.equal(run('p.points'),3);
 run('experience(75);');
 assert.equal(run('p.level'),2);
 assert.equal(run('p.skillPoints'),1);
 run('running=true;loadMap("yongan",true);p.career.materials.xpRing=1;p.career.materials.xpLootRing=1;useInventorySupply("material:xpRing");useInventorySupply("material:xpLootRing");');
 assert.equal(run('activeExperienceMultiplier()'),2.25);
 assert.equal(run('enemyXP(mobs.find(m=>m.name==="Divoký pes"))'),33);
 run('p.xpLocked=true;save();');
 const reload=createEmptyGame(Object.fromEntries(saved));assert(reload.run('playCharacter()'));
 assert.equal(reload.run('activeExperienceMultiplier()'),2.25);
 assert.equal(reload.run('enemyXP(mobs[0])'),0);
 reload.run('experience(99999);');assert.equal(reload.run('p.xp'),0);
});
