const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,readSavedAccount}=require('./helpers/game.cjs');
function ready(){const g=createGame();g.run('running=true;loadMap("town",true);p.x=NPCS.dungeonMaster.x;p.y=NPCS.dungeonMaster.y;p.level=99;p.gold=100000;p.career.materials.keys=100;p.hp=maxHP();p.mp=maxMP();');return g;}
function unlock(run){run('for(const m of mobs.filter(m=>!m.dungeonBoss))hit(m,1e9,"arcane",true);dungeonUnlocked();travelCombat.time=0;');}
test('three dungeons and three difficulties have distinct enemies, mechanics, scaling and dedicated map',()=>{
 const {run}=ready();for(const id of ['crypt','frost','abyss'])for(const difficulty of ['normal','hard','mythic']){
 assert(run(`enterDungeon('${id}','${difficulty}')`));assert.equal(run('p.mapId'),'dungeon');assert.equal(run('SIZE'),1800);assert.equal(run('mobs.filter(m=>m.dungeonSeal).length'),3);assert.equal(run('mobs.filter(m=>m.dungeonBoss).length'),1);assert.equal(run('mobs.filter(m=>m.dungeonRole==="guard").length'),run(`DUNGEONS.${id}.count`));assert(run('mobs.find(m=>m.dungeonBoss).max>mobs.find(m=>m.dungeonRole==="guard").max*10'));run('validateCharacterAccount(accountWithActiveSnapshot());');assert(run('finishDungeon()'));assert.equal(run('p.mapId'),'town');
 }
 assert(run('DUNGEONS.crypt.skin!==DUNGEONS.frost.skin&&DUNGEONS.frost.skin!==DUNGEONS.abyss.skin'));
});
test('entry gates and missing resources never charge currency or modify the map',()=>{
 const {run}=ready();for(const setup of ['p.level=1;','p.gold=0;','p.career.materials.keys=0;','travelCombat.time=2;','p.hp=0;']){run('p.level=99;p.gold=100000;p.career.materials.keys=100;travelCombat.time=0;p.hp=maxHP();'+setup+'var before=JSON.stringify(p);');assert(!run('enterDungeon("abyss","mythic")'));assert.equal(run('JSON.stringify(p)'),run('before'));}
 assert(!run('enterDungeon("constructor")'));assert(!run('enterDungeon("crypt","constructor")'));
});
test('boss is shielded until every original guard and seal is destroyed; killed units never respawn',()=>{
 const {run}=ready();assert(run('enterDungeon("crypt")'));run('var boss=mobs.find(m=>m.dungeonBoss),hp=boss.hp;');assert.equal(run('hit(boss,999999)'),0);assert.equal(run('boss.hp'),run('hp'));
 run('for(const m of mobs.filter(m=>m.dungeonRole==="guard"))hit(m,1e9,"arcane",true);');assert.equal(run('hit(boss,999999)'),0);
 unlock(run);assert(run('dungeonUnlocked()'));run('updateEnemySpawns(100,true);');assert(run('mobs.filter(m=>!m.dungeonBoss).every(m=>m.hp===0)'));assert(run('hit(boss,10,"physical",true)>0'));
});
test('travel and legacy expeditions cannot overlap a dungeon',()=>{
 const {run}=ready();assert(run('enterDungeon("crypt")'));assert(!run('loadMap("valley")'));assert(!run('enterRift()'));assert(!run('enterDungeon("frost")'));assert(run('finishDungeon()'));assert(run('enterRift()'));assert(!run('enterDungeon("crypt")'));assert(run('finishRift(false)'));
});
test('normal overworld snapshots are preserved and uncollected dungeon drops move to town exactly once',()=>{
 const {run}=ready();run('loadMap("valley",true);mobs[0].hp=1;snapshotMap();var saved=JSON.stringify(p.worldStates.valley);loadMap("town",true);p.x=NPCS.dungeonMaster.x;p.y=NPCS.dungeonMaster.y;enterDungeon("crypt");spawnGroundDrop({kind:"gear",item:generateEquipmentItem("weapon",1,20)},p);var id=drops[0].id;');assert(run('finishDungeon()'));assert.equal(run('JSON.stringify(p.worldStates.valley)'),run('saved'));assert.equal(run('drops.filter(d=>d.id===id).length'),1);assert(!run('finishDungeon()'));run('save();loadMap("valley",true);');assert.equal(run('mobs[0].hp'),1);
});
test('each boss announces a real avoidable attack, honors safe zone and uses distinct geometry',()=>{
 const shapes=[];for(const id of ['crypt','frost','abyss']){const {run}=ready();run(`enterDungeon('${id}');`);unlock(run);run('p.x=900;p.y=700;var boss=mobs.find(m=>m.dungeonBoss);boss.cd=0;updateDungeonBoss(boss,.01,false);var plan=JSON.stringify(boss.attackPlan),hp=p.hp;');shapes.push(run('boss.attackPlan.kind'));assert(run('boss.attackPlan.delay>=1'));run('updateDungeonBoss(boss,.5,false);');assert.equal(run('p.hp'),run('hp'));
 run('var shape=boss.attackPlan;if(shape.kind==="circle"){p.x=shape.x;p.y=shape.y;}else if(shape.kind==="line"){p.x=shape.x+Math.cos(shape.angle)*100;p.y=shape.y+Math.sin(shape.angle)*100;}else{p.x=shape.x+200;p.y=shape.y;}updateDungeonBoss(boss,2,false);');assert(run('p.hp<hp'));run('boss.cd=0;updateDungeonBoss(boss,.01,true);');assert.equal(run('boss.attackPlan'),null);
 }assert.deepEqual(shapes,['circle','line','ring']);
});
test('moving out of a telegraph prevents damage and frost fields change actual speed',()=>{
 const {run}=ready();run('enterDungeon("frost");');unlock(run);run('p.x=900;p.y=700;var boss=mobs.find(m=>m.dungeonBoss);boss.cd=0;updateDungeonBoss(boss,.01,false);p.x=1600;p.y=1400;var hp=p.hp;updateDungeonBoss(boss,2,false);');assert.equal(run('p.hp'),run('hp'));
 run('var speed=speedValue();makeDungeonHazard("frost",p.x,p.y,1,"physical");updateDungeon(1.5,false);');assert.equal(run('speedValue()'),run('speed*.65'));run('p.x=200;p.y=1400;');assert.equal(run('speedValue()'),run('speed'));
});
test('phase adds are bounded and reset after death without duplicate spawn identities',()=>{
 const {run}=ready();run('enterDungeon("abyss","mythic");');unlock(run);run('p.x=900;p.y=700;var boss=mobs.find(m=>m.dungeonBoss);boss.hp=boss.max*.2;updateDungeonBoss(boss,.01,false);updateDungeonBoss(boss,.01,false);');assert.equal(run('mobs.filter(m=>m.dungeonRole==="add").length'),4);run('death();');assert.equal(run('boss.hp'),run('boss.max'));assert.equal(run('mobs.filter(m=>m.dungeonRole==="add").length'),0);run('boss.hp=boss.max*.2;updateDungeonBoss(boss,.01,false);');assert.equal(run('new Set(mobs.map(m=>m.spawnId)).size'),run('mobs.length'));run('validateCharacterAccount(accountWithActiveSnapshot());');
});
test('boss unique rewards and completion counters are paid once and preserve generated affixes',()=>{
 const {run}=ready();run('enterDungeon("crypt");');unlock(run);run('var boss=mobs.find(m=>m.dungeonBoss),keyCount=p.career.materials.keys;hit(boss,1e9,"arcane",true);var gear=drops.find(d=>d.item?.uniqueId);validateCharacterItem(gear.item);var before=JSON.stringify(p.career.dungeons),count=drops.length;hit(boss,1e9);');assert(run('dungeonRun().cleared'));assert.equal(run('gear.item.uniqueId'),'crypt');assert.equal(run('p.career.materials.keys'),run('keyCount+1'));assert.equal(run('drops.length'),run('count'));assert.equal(run('JSON.stringify(p.career.dungeons)'),run('before'));assert.equal(run('p.career.dungeons.clears["crypt:normal"]'),1);run('validateCharacterAccount(accountWithActiveSnapshot());');
});
test('endgame hard and mythic have genuine Mythic chances and bounded bad-luck protection',()=>{
 for(const difficulty of ['hard','mythic']){const {run}=ready();run(`enterDungeon('abyss','${difficulty}');p.career.dungeons.pity['abyss:${difficulty}']=11;rand=()=>.999;`);unlock(run);run('var boss=mobs.find(m=>m.dungeonBoss);hit(boss,1e9,"arcane",true);');assert(run('drops.some(d=>d.item?.rarity===5)'));assert.equal(run(`p.career.dungeons.pity['abyss:${difficulty}']`),0);assert(run('drops.some(d=>d.item?.uniqueId==="abyss")'));
 }
 const {run}=ready();run('enterDungeon("abyss","mythic");rand=()=>0;');unlock(run);run('hit(mobs.find(m=>m.dungeonBoss),1e9,"arcane",true);');assert(run('drops.some(d=>d.item?.rarity===5)'));
});
test('failed endgame rolls increase pity, normal mode grants Legendary without Mythic',()=>{
 const {run}=ready();run('enterDungeon("abyss","hard");rand=()=>.999;');unlock(run);run('hit(mobs.find(m=>m.dungeonBoss),1e9,"arcane",true);');assert.equal(run('p.career.dungeons.pity["abyss:hard"]'),1);assert(!run('drops.some(d=>d.item?.rarity===5)'));assert(run('drops.some(d=>d.item?.rarity===4)'));
});
test('active dungeon, damage, telegraphs, hazards and dead units survive reload without respawn',()=>{
 const {run,saved}=ready();run('enterDungeon("frost","hard");');unlock(run);run('p.x=900;p.y=700;var boss=mobs.find(m=>m.dungeonBoss);hit(boss,100);boss.cd=0;updateDungeonBoss(boss,.01,false);makeDungeonHazard("frost",100,200,10,"physical");save();var hp=boss.hp;');const next=createGame(null,'grindoria-save-v1',Object.fromEntries(saved));assert.equal(next.run('p.mapId'),'dungeon');assert.equal(next.run('mobs.find(m=>m.dungeonBoss).hp'),run('hp'));assert(next.run('mobs.find(m=>m.dungeonBoss).attackPlan'));assert.equal(next.run('dungeonRun().hazards.length'),1);assert(next.run('mobs.filter(m=>m.dungeonRole==="guard").every(m=>m.hp===0)'));next.run('validateCharacterAccount(accountWithActiveSnapshot());');
});
test('hazards pause with panels, remain finite outside hit zones and do not hurt sanctuary',()=>{
 const {run}=ready();run('enterDungeon("crypt");makeDungeonHazard("circle",100,100,100,"poison");paused=true;update(2);');assert.equal(run('dungeonRun().time'),0);run('paused=false;updateDungeon(2,true);validateCharacterAccount(accountWithActiveSnapshot());');assert.equal(run('p.hp'),run('maxHP()'));run('updateDungeon(5,true);');assert.equal(run('dungeonRun().hazards.length'),0);
});
test('malformed runs, reward states, unique IDs and populations fail transactional import',()=>{
 const {run}=ready();run('enterDungeon("crypt");var backup=exportCharacters();');for(const bad of ['r.dungeon="unknown"','r.cleared=true','r.hazards=[{}]','data.worldStates.dungeon.mobs.pop()','data.worldStates.dungeon.mobs[0].dungeonRunId=999'])assert.throws(()=>run('var doc=JSON.parse(backup),data=doc.account.profiles[doc.account.selectedId].data,r=data.career.dungeons.run;'+bad+';prepareCharacterImport(JSON.stringify(doc));'),/Neplatná záloha/);
 run('var item=generateEquipmentItem("weapon",1,20);item.uniqueId="unknown";');assert.throws(()=>run('validateCharacterItem(item)'),/Neplatná záloha/);
});
test('older profiles migrate and characters keep independent runs, clears and pity',()=>{
 const {run,saved}=ready();run('save();');const old=readSavedAccount(saved);delete old.profiles[old.selectedId].data.career.dungeons;const migrated=createGame(null,'grindoria-save-v1',{'grindoria-characters-v1':old});assert.equal(migrated.run('p.career.dungeons.serial'),0);
 run('enterDungeon("crypt");var first=characterStore.activeId;returnToCharacters();var other=createCharacter("Vyprava","ninja");playCharacter(other);');assert.equal(run('dungeonRun()'),null);run('returnToCharacters();playCharacter(first);');assert.equal(run('dungeonRun().dungeon'),'crypt');
});
test('all new models, grounds, telegraphs and dungeon panels render with real configuration',()=>{
 const {run,elements}=ready();run('interactNPC("dungeonMaster");dungeonPanel();');assert.match(elements.get('modalcontent').innerHTML,/Priepasť/);assert.match(elements.get('modalcontent').innerHTML,/12/);for(const id of ['crypt','frost','abyss']){run(`enterDungeon('${id}');draw();dungeonPanel();`);assert.match(elements.get('modalcontent').innerHTML,/Pečate|pečate/);assert(run('finishDungeon()'));}
});

test('completed dungeons can be repeated with new identities and independent fresh loot',()=>{
 const {run}=ready();run('enterDungeon("crypt");var firstId=dungeonRun().id;');unlock(run);run('hit(mobs.find(m=>m.dungeonBoss),1e9,"arcane",true);finishDungeon();travelCombat.time=0;enterDungeon("crypt");');assert(run('dungeonRun().id>firstId'));assert(run('mobs.every(m=>m.hp===m.max)'));assert.equal(run('p.career.dungeons.clears["crypt:normal"]'),1);unlock(run);run('hit(mobs.find(m=>m.dungeonBoss),1e9,"arcane",true);finishDungeon();');assert.equal(run('p.career.dungeons.clears["crypt:normal"]'),2);assert.equal(run('drops.filter(d=>d.item?.uniqueId==="crypt").length'),2);run('validateCharacterAccount(accountWithActiveSnapshot());');
});
