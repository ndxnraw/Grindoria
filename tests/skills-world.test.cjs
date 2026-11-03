const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const source=require('./helpers/source.cjs').runtimeSource();
const { createGame: setup }=require('./helpers/game.cjs');
const {run,saved}=setup({level:5,hp:150,xp:20,gold:333,potions:7,weapon:2,kills:25,stones:3,claimed:true});
assert.equal(run('p.gold'),333);assert.equal(run('p.points'),12);assert.equal(run('p.classId'),'warrior');assert.equal(run('p.mapId'),'valley');assert.equal(run('p.mp'),140);assert.equal(run('p.schools.sura'),'weapon');assert.equal(run('Object.keys(SCHOOLS).length'),8);assert.equal(run('Object.values(SCHOOLS).reduce((n,s)=>n+s.skills.length,0)'),48);
run('running=true;paused=false;p.hp=maxHP();');
// Every skill can execute, consume mana once and obey its own cooldown.
for(const id of run('Object.keys(SCHOOLS)'))for(let i=0;i<6;i++){
 run(`p.classId=SCHOOLS['${id}'].classId;p.schools[p.classId]='${id}';p.hp=maxHP();p.mp=maxMP();spellCD.fill(0);Object.keys(buffs).forEach(k=>delete buffs[k]);shots.length=0;effects.length=0;resetCombatFlow();face=0;p.x=500;p.y=500;mobs.forEach(m=>{m.hp=0;m.dot=null;m.dots=[];});mobs[0].hp=100000;mobs[0].max=100000;mobs[0].x=550;mobs[0].y=500;`);
 const before=run('p.mp');assert.equal(run(`castSkill(${i})`),true,`${id}/${i}`);assert.equal(run('p.mp'),before-run(`school().skills[${i}][3]`));assert.ok(run(`spellCD[${i}]>0`));assert.equal(run(`castSkill(${i})`),false);run('updateCombat(.05);draw();');
}
run('p.classId="sura";p.schools.sura="weapon";p.hp=20;p.mp=maxMP();spellCD.fill(0);Object.keys(buffs).forEach(k=>delete buffs[k]);castSkill(2);');assert.equal(run('active("enchanted")'),true);const beforeHP=run('p.hp');run('hurtMob(mobs[0],1);');assert.ok(run('p.hp')>beforeHP);
run('p.mp=0;spellCD.fill(0);');assert.equal(run('castSkill(0)'),false);assert.equal(run('spellCD[0]'),0);
run('p.mp=maxMP();p.x=50;p.y=50;mobs.forEach(m=>m.hp=0);p.schools.sura="black";');const noTargetMP=run('p.mp');assert.equal(run('castSkill(0)'),true);assert.equal(run('p.mp'),noTargetMP-run('school().skills[0][3]'));assert.equal(run('shots.at(-1).target'),null);
run('travelCombat.time=0;clearCombatTarget();p.x=map().entry.x;p.y=map().entry.y;');for(const id of ['valley','desert','snow','temple']){assert.equal(run(`loadMap('${id}')`),true);assert.equal(run('p.mapId'),id);assert.equal(run('mobs.filter(m=>m.type==="wolf").length'),run('map().count'));assert.equal(run('mobs[0].skin'),run('map().skin'));run('draw();');}
run('p.x=500;p.y=500;travelCombat.time=1;');assert.equal(run('loadMap("valley")'),false);assert.equal(run('p.mapId'),'temple');
// Preserve dead mobs and their remaining timer when traveling away and back.
run('travelCombat.time=0;loadMap("desert");mobs[0].hp=1;hit(mobs[0],10);');assert.equal(run('mobs[0].dead'),8);run('travelCombat.time=0;mobs.forEach(m=>m.engaged=0);loadMap("snow");loadMap("desert");');assert.equal(run('mobs[0].hp'),0);assert.equal(run('mobs[0].dead'),8);run('update(2);');assert.equal(run('mobs[0].hp'),0);run('update(6.1);');assert.equal(run('mobs[0].hp'),run('mobs[0].max'));
run('let stone=mobs.find(m=>m.type==="stone"),boss=mobs.find(m=>m.type==="boss");hit(stone,99999);hit(boss,99999);');assert.equal(run('stone.dead'),18);assert.equal(run('boss.dead'),40);
// Stun prevents attacks, poison ticks and projectiles resolve damage.
run('p.x=400;p.y=400;p.hp=maxHP();Object.keys(buffs).forEach(k=>delete buffs[k]);mobs.forEach(m=>m.hp=0);let enemy=mobs[0];enemy.hp=1000;enemy.max=1000;enemy.dot=null;enemy.dots=[];enemy.x=410;enemy.y=400;enemy.cd=0;enemy.stun=2;');const safeHP=run('p.hp');run('update(.1);');assert.equal(run('p.hp'),safeHP);
const poisonDamage=run('resolveEnemyDamage(enemy,9,"poison")');run('enemy.dot={time:6,tick:.1,power:9,kind:"poison"};updateCombat(.2);');assert.equal(run('enemy.hp'),1000-poisonDamage);
run('enemy.dot=null;shoot(enemy,1,"darkBolt");');const shotHP=run('enemy.hp');for(let i=0;i<10;i++)run('updateCombat(.1);');assert.ok(run('enemy.hp')<shotHP);assert.equal(run('shots.length'),0);
// This legacy regression deliberately simulates all vocations in one VM; seed its final state as an old single-profile save.
run('snapshotMap();');const stored=run('copyCharacterData(p)');assert.equal(stored.mapId,'desert');assert.ok(stored.worldStates.temple);const reload=setup(stored);assert.equal(reload.run('p.mapId'),'desert');assert.equal(reload.run('p.classId'),'sura');assert.equal(reload.run('p.schools.sura'),'black');assert.equal(reload.run('mobs.find(m=>m.type==="boss").dead'),run('boss.dead'));
console.log('PASS: old-save migration, 48 skill casts and cooldowns, mana guards, Sura life steal, 4 maps/rendering, travel safety, map-state preservation, 8/18/40-second respawn, stun, poison, projectiles, save reload');
