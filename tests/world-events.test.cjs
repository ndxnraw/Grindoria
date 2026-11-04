const test=require('node:test'),assert=require('node:assert/strict');
const {createGame,createEmptyGame,readSavedProfile,readSavedAccount}=require('./helpers/game.cjs');
function ready(map='valley'){const g=createGame();g.run('running=true;loadMap("'+map+'",true);');return g;}
function start(g,type){assert(g.run('startWorldEvent("'+type+'")'));}

test('only overworld combat maps schedule events; town, dungeon and rift keep their original populations',()=>{
 const g=ready();g.run('loadMap("town",true);');assert.equal(g.run('worldEventState'),null);assert(!g.run('startWorldEvent("boss")'));g.run('p.level=35;p.gold=10000;p.career.materials.keys=10;enterDungeon("crypt");');assert.equal(g.run('worldEventState'),null);assert(!g.run('startWorldEvent("patrol")'));g.run('finishDungeon();enterRift();');assert.equal(g.run('worldEventState'),null);assert(!g.run('startWorldEvent("boss")'));
});

test('initial delay and subsequent scheduling use active map time, preserve pause and cannot start while dead or inactive',()=>{
 const g=ready();assert.equal(g.run('worldEventState.nextCheck'),90);g.run('updateWorldEvents(20);');assert.equal(g.run('worldEventState.nextCheck'),70);for(const setup of ['paused=true;','running=false;','p.hp=0;']){g.run('running=true;paused=false;p.hp=100;'+setup+'updateWorldEvents(20);');assert.equal(g.run('worldEventState.nextCheck'),70);assert(!g.run('startWorldEvent("patrol")'));}g.run('paused=false;running=true;p.hp=100;var random=worldEventRandom,queue=[0,.99];worldEventRandom=()=>queue.shift()??.5;updateWorldEvents(70);worldEventRandom=random;');assert.equal(g.run('worldEventState.active'),null);assert.equal(g.run('worldEventState.nextCheck'),120);
});

test('low probability rolls select distinct rare events while most checks can remain quiet',()=>{
 for(const [roll,type]of [[.1,'patrol'],[.25,'invasion'],[.36,'bounty'],[.44,'boss'],[.47,'metin'],[.49,'ruins'],[.50,'convoy'],[.9,null]]){const g=ready();g.run('var queue=[0,'+roll+'];worldEventRandom=()=>queue.shift()??.5;worldEventState.nextCheck=0;updateWorldEvents(.01);');assert.equal(g.run('worldEventState.active?.type??null'),type);}
 const g=ready();assert(g.run('WORLD_EVENTS.convoy.chance<WORLD_EVENTS.ruins.chance&&WORLD_EVENTS.ruins.chance<WORLD_EVENTS.metin.chance&&WORLD_EVENTS.boss.chance<WORLD_EVENTS.patrol.chance'));assert(g.run('Object.values(WORLD_EVENTS).reduce((s,e)=>s+e.chance,0)<1'));
});

test('event groups use independent non-grid positions, a shared group of at most five, and no passive aggro',()=>{
 const g=ready();start(g,'convoy');g.run('var event=worldEventState.active,pack=mobs.filter(m=>m.worldEventId===event.id),hp=p.hp;');assert.equal(g.run('pack.length'),5);assert.equal(g.run('new Set(pack.map(m=>m.spawnId)).size'),5);assert.equal(g.run('new Set(pack.map(m=>m.x+":"+m.y)).size'),5);assert.equal(g.run('new Set(pack.map(m=>m.name)).size'),5);assert(g.run('pack.every(m=>!isSanctuary(m)&&m.noRespawn&&!m.engaged&&!m.taunt&&m.x>=45&&m.x<=SIZE-45)'));assert(g.run('pack.some(m=>m.skin==="scorpion")&&pack.some(m=>m.skin==="demon")'));g.run('hit(pack[0],1);');assert.equal(g.run('pack.filter(m=>m.engaged>0).length'),5);assert(!g.run('startWorldEvent("boss")'));
});

test('rare bosses are stronger, named correctly, and both ordinary and event bosses really attack',()=>{
 const g=ready();start(g,'boss');g.run('var bosses=mobs.filter(m=>m.type==="boss"),rare=bosses.find(m=>m.worldEventId),normal=bosses.find(m=>!m.worldEventId);p.x=900;p.y=1400;p.hp=10000;bosses.forEach((b,i)=>Object.assign(b,{x:p.x+(i?70:-70),y:p.y,cd:0,windup:0}));updateBoss(.01,false);');assert.equal(g.run('bosses.length'),2);assert(g.run('rare.max>normal.max&&rare.level>=normal.level&&rare.level<=map().levelMax'));assert.equal(g.run('enemyName(rare)'),g.run('rare.name'));assert(g.run('bosses.every(b=>b.windup>0)'));g.run('updateBoss(1.1,false);');assert(g.run('bosses.every(b=>b.cd>0&&b.windup<=0)'));assert(g.run('p.hp<10000'));
});

test('Šuterland remains Metin-only, with rare Metin waves and higher HP rather than free-roaming groups',()=>{
 const g=ready('suterland');assert(!g.run('startWorldEvent("boss")'));assert(!g.run('startWorldEvent("convoy")'));start(g,'metin');g.run('var stone=mobs.find(m=>m.worldEventId);p.x=stone.x-60;p.y=stone.y;hit(stone,1);updateMetins(.11,false);');assert(g.run('stone.rareMetin&&stone.type==="stone"&&stone.max>metinStats(stone.level,stone.metinType).hp'));assert(g.run('mobs.some(m=>m.metinParentId===stone.spawnId)'));assert(g.run('mobs.every(m=>m.type==="stone"||m.metinParentId)'));assert.equal(g.run('enemyName(stone)'),g.run('stone.name'));
});

test('completion grants bonus materials and ground equipment once, leaving normal manual and automatic pickup rules intact',()=>{
 const g=ready('temple');start(g,'boss');g.run('var foe=mobs.find(m=>m.worldEventId);p.level=foe.level;hit(foe,1e9,"arcane",true);var gold=p.gold,ore=p.career.materials.ore,count=drops.length;');assert.equal(g.run('worldEventState.active'),null);assert.equal(g.run('p.career.worldEvents.completed.boss'),1);assert(g.run('p.career.materials.ore>=12'));assert(g.run('drops.some(d=>d.kind==="gear")'));assert(!g.run('drops.some(d=>d.kind==="supply"||d.kind==="gold")'));g.run('hit(foe,1e9);');assert.equal(g.run('p.gold'),g.run('gold'));assert.equal(g.run('p.career.materials.ore'),g.run('ore'));assert.equal(g.run('drops.length'),g.run('count'));assert.equal(g.run('p.career.worldEvents.completed.boss'),1);
});

test('weak events never generate advancement materials or bonus gear from high-level farming of easy maps',()=>{
 const g=ready();start(g,'patrol');g.run('p.level=99;var pack=mobs.filter(m=>m.worldEventId);for(const m of pack)hit(m,1e9,"arcane",true);');assert.equal(g.run('p.career.materials.upgradeStones'),0);assert.equal(g.run('p.career.worldEvents.completed.patrol'),1);assert(g.run('p.gold>0'));
});

test('expired event mobs and their Metin guards vanish without deaths, loot, EXP, respawn or stale target chasing',()=>{
 const g=ready('suterland');start(g,'metin');g.run('var stone=mobs.find(m=>m.worldEventId);spawnMetinGuards(stone);selectCombatTarget(stone,true);var kills=p.kills,xp=p.xp,gold=p.gold,count=drops.length;worldEventState.active.remaining=.01;updateWorldEvents(.02);');assert.equal(g.run('worldEventState.active'),null);assert(!g.run('mobs.some(m=>m.worldEventId||m.metinParentId===stone.spawnId)'));assert.equal(g.run('target'),null);assert.equal(g.run('p.kills'),g.run('kills'));assert.equal(g.run('p.xp'),g.run('xp'));assert.equal(g.run('p.gold'),g.run('gold'));assert.equal(g.run('drops.length'),g.run('count'));g.run('hit(stone,1e9);updateEnemySpawns(100,true);');assert.equal(g.run('p.gold'),g.run('gold'));assert.equal(g.run('mobs.filter(m=>m.type==="stone").length'),99);
});

test('hidden ruins reveal only nearby, reward an actual visit once, and remain recorded after the event',()=>{
 const g=ready();start(g,'ruins');g.run('var e=worldEventState.active;');assert.equal(g.run('e.revealed'),false);g.run('p.x=e.x+300;p.y=e.y;updateWorldEvents(.01);');assert(g.run('e.revealed'));assert(g.run('worldEventState.active!==null'));g.run('p.x=e.x;p.y=e.y;updateWorldEvents(.01);');assert.equal(g.run('worldEventState.active'),null);assert.equal(g.run('p.discovery.eventPlaces.valley'),1);assert.equal(g.run('p.career.worldEvents.completed.ruins'),1);g.run('var gold=p.gold;updateWorldEvents(.01);');assert.equal(g.run('p.gold'),g.run('gold'));
});

test('material events add finite per-kill bonuses only for eligible free monsters, and expiration has no idle payout',()=>{
 const g=ready();start(g,'bounty');g.run('worldEventRandom=()=>0;var m=mobs[0];p.level=m.level;hit(m,1e9,"arcane",true);');assert.equal(g.run('worldEventState.active.kills'),1);assert(g.run('p.career.materials.ore>=1&&p.career.materials.upgradeStones>=1'));g.run('p.level=99;hit(mobs[1],1e9,"arcane",true);');assert.equal(g.run('worldEventState.active.kills'),1);g.run('var gold=p.gold,ore=p.career.materials.ore;worldEventState.active.remaining=0;updateWorldEvents(.01);');assert.equal(g.run('p.gold'),g.run('gold'));assert.equal(g.run('p.career.materials.ore'),g.run('ore'));assert.equal(g.run('p.career.worldEvents.completed.bounty'),1);
 const idle=ready();start(idle,'bounty');idle.run('worldEventState.active.remaining=0;updateWorldEvents(.01);');assert.equal(idle.run('p.gold'),0);assert.equal(idle.run('p.career.worldEvents.completed.bounty'),undefined);
});

test('partially defeated event groups and random state survive reload with exact IDs, HP, progress and remaining time',()=>{
 const g=ready();start(g,'invasion');g.run('var group=mobs.filter(m=>m.worldEventId);p.level=group[0].level;hit(group[0],1e9,"arcane",true);hit(group[1],1);updateWorldEvents(12);save();var state=worldEventSnapshot(),members=JSON.stringify(mobs.filter(m=>m.worldEventId).map(m=>[m.spawnId,m.hp]));');const n=createEmptyGame({'grindoria-characters-v1':g.saved.get('grindoria-characters-v1')});assert(n.run('playCharacter()'));assert.equal(n.run('JSON.stringify(mobs.filter(m=>m.worldEventId).map(m=>[m.spawnId,m.hp]))'),g.run('members'));assert.equal(n.run('worldEventState.active.remaining'),g.run('state.active.remaining'));assert.equal(n.run('worldEventState.active.kills'),1);assert.equal(n.run('worldEventState.seed'),g.run('state.seed'));assert.equal(n.run('new Set(mobs.map(m=>m.spawnId)).size'),n.run('mobs.length'));
});

test('event Metin guards restore once and continue using their original generation and parent identities',()=>{
 const g=ready('suterland');start(g,'metin');g.run('var stone=mobs.find(m=>m.worldEventId);spawnMetinGuards(stone);save();var count=mobs.filter(m=>m.metinParentId===stone.spawnId).length;');const n=createEmptyGame({'grindoria-characters-v1':g.saved.get('grindoria-characters-v1')});assert(n.run('playCharacter()'));assert.equal(n.run('mobs.filter(m=>m.metinParentId===worldEventState.active.id+":0").length'),g.run('count'));assert.equal(n.run('new Set(mobs.map(m=>m.spawnId)).size'),n.run('mobs.length'));n.run('save();');assert(n.run('exportCharacters().length>0'));
});

test('travel freezes other maps and does not reroll events or reset their scheduler on return',()=>{
 const g=ready();start(g,'patrol');g.run('updateWorldEvents(15);var id=worldEventState.active.id,time=worldEventState.active.remaining,seedValue=worldEventState.seed;loadMap("desert");updateWorldEvents(10);loadMap("valley");');assert.equal(g.run('worldEventState.active.id'),g.run('id'));assert.equal(g.run('worldEventState.active.remaining'),g.run('time'));assert.equal(g.run('worldEventState.seed'),g.run('seedValue'));assert.equal(g.run('mobs.filter(m=>m.worldEventId===id).length'),5);
});

test('rift snapshots suspend ambient events without erasing or scaling their ordinary-map population',()=>{
 const g=ready('temple');start(g,'boss');g.run('p.level=35;p.career.materials.keys=3;var id=worldEventState.active.id,hp=mobs.find(m=>m.worldEventId).max;');assert(g.run('enterRift()'));assert.equal(g.run('worldEventState'),null);assert(!g.run('mobs.some(m=>m.worldEventId)'));assert(g.run('p.career.normalTemple.events.active.id===id'));g.run('finishRift(false);loadMap("temple");');assert.equal(g.run('worldEventState.active.id'),g.run('id'));assert.equal(g.run('mobs.find(m=>m.worldEventId).max'),g.run('hp'));
});

test('event state, discovery and history are isolated between characters and survive complete backup import',()=>{
 const {run,saved}=createEmptyGame();run('var a=createCharacter("Prvy","warrior"),b=createCharacter("Druhy","warrior");playCharacter(a);loadMap("valley");startWorldEvent("ruins");p.x=worldEventState.active.x;p.y=worldEventState.active.y;updateWorldEvents(.01);startWorldEvent("patrol");var id=worldEventState.active.id;returnToCharacters();playCharacter(b);');assert.equal(run('worldEventState'),null);assert.equal(run('p.career.worldEvents.serial'),0);assert.equal(run('Object.keys(p.discovery.eventPlaces).length'),0);run('returnToCharacters();playCharacter(a);var backup=exportCharacters();');assert.equal(run('worldEventState.active.id'),run('id'));assert.equal(run('p.discovery.eventPlaces.valley'),1);const n=createEmptyGame();n.run('importCharacterBackup(prepareCharacterImport('+JSON.stringify(run('backup'))+'),"add");playCharacter();');assert.equal(n.run('worldEventState.active.id'),run('id'));assert.equal(n.run('p.discovery.eventPlaces.valley'),1);
});

test('legacy profiles and exports migrate without changing world contents or inventing historical events',()=>{
 const g=ready();g.run('save();');const doc=JSON.parse(g.run('exportCharacters()')),id=doc.account.selectedId;delete doc.account.profiles[id].data.career.worldEvents;delete doc.account.profiles[id].data.discovery.eventPlaces;for(const state of Object.values(doc.account.profiles[id].data.worldStates))delete state.events;const n=createEmptyGame();n.run('importCharacterBackup(prepareCharacterImport('+JSON.stringify(JSON.stringify(doc))+'),"add");playCharacter();');assert.equal(n.run('p.career.worldEvents.serial'),0);assert.equal(n.run('Object.keys(p.career.worldEvents.completed).length'),0);assert.equal(n.run('worldEventState.nextCheck'),90);assert.equal(n.run('mobs.length'),g.run('mobs.length'));
});

test('malformed event imports reject unknown types, IDs, clocks, populations, map mismatches and discovery counts atomically',()=>{
 const g=ready();start(g,'patrol');g.run('save();');const doc=JSON.parse(g.run('exportCharacters()')),id=doc.account.selectedId;
 for(const mutate of [d=>d.worldStates.valley.events.active.type='fake',d=>d.worldStates.valley.events.seed=-1,d=>d.worldStates.valley.events.active.remaining=9999,d=>d.worldStates.valley.events.mapId='snow',d=>d.career.worldEvents.serial=0,d=>d.discovery.eventPlaces.valley=-1,d=>d.worldStates.valley.mobs.find(m=>m.worldEventId).noRespawn=false,d=>d.worldStates.valley.mobs.pop()]){const bad=JSON.parse(JSON.stringify(doc));mutate(bad.account.profiles[id].data);const before=g.saved.get('grindoria-characters-v1');assert.throws(()=>g.run('prepareCharacterImport('+JSON.stringify(JSON.stringify(bad))+')'));assert.equal(g.saved.get('grindoria-characters-v1'),before);}
});

test('repeated events remain bounded and leave ordinary spawn identities and population intact',()=>{
 const g=ready();g.run('var normal=mobs.length,ids=mobs.map(m=>m.spawnId).join("|");');for(let i=0;i<30;i++){start(g,['patrol','boss','metin','convoy'][i%4]);assert(g.run('mobs.length<=normal+5'));g.run('worldEventState.active.remaining=.01;updateWorldEvents(.02);validateCharacterAccount(accountWithActiveSnapshot());');assert.equal(g.run('mobs.length'),g.run('normal'));assert.equal(g.run('mobs.map(m=>m.spawnId).join("|")'),g.run('ids'));}
});

test('HUD, journal and event details expose functional objectives, duration, rare chances and actual enemy names',()=>{
 const g=ready();start(g,'boss');g.run('updateHUD();draw();');assert.equal(g.elements.get('world-event-status').hidden,false);g.elements.get('world-event-status').onclick();assert.equal(g.run('panelState.key'),'career:events');for(const text of ['Prastarý strážca','Poraz vzácneho','3,5 %','1 %','Čas udalostí','Objavené ruiny'])assert(g.elements.get('modalcontent').innerHTML.includes(text),text);g.run('closeModal();journal();');g.elements.get('journalEvents').onclick();assert.equal(g.run('panelState.key'),'career:events');
});
