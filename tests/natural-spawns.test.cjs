const test=require('node:test'),assert=require('node:assert/strict');
const { createGame, readSavedProfile }=require('./helpers/game.cjs');

test('all maps use irregular separated spawn points instead of repeated rows and columns',()=>{
  const {run}=createGame();
  for(const id of ['valley','desert','snow','temple','suterland']){
    run('loadMap("'+id+'",true);var points=spawnPoints.filter(p=>p.kind!=="boss");');
    assert.equal(run('new Set(points.map(p=>p.x.toFixed(3))).size'),run('points.length'));
    assert.equal(run('new Set(points.map(p=>p.y.toFixed(3))).size'),run('points.length'));
    assert(run('points.every(p=>{const a=FARM_AREAS.find(a=>a.id===p.area);return p.x>=a.x1+50&&p.x<=a.x2-50&&p.y>=a.y1+50&&p.y<=a.y2-50&&Math.hypot(p.x-1000,p.y-1050)>=305;})'));
    assert(run('points.every((p,i)=>points.every((q,j)=>i===j||p.area!==q.area||Math.hypot(p.x-q.x,p.y-q.y)>=89.99))'));
  }
});

test('Metin respawns relocate inside their level region with separation, preserving slot and level',()=>{
  const {run}=createGame();run('loadMap("suterland",true);let stone=mobs.find(m=>m.level===50),id=stone.spawnId,kind=stone.metinType,area=FARM_AREAS.find(a=>a.id===stone.area),locations=[];for(let i=0;i<20;i++){stone.hp=0;respawnEnemy(stone);locations.push([stone.x,stone.y]);if(stone.spawnId!==id||stone.level!==50||stone.metinType!==kind||stone.x<area.x1||stone.x>area.x2||stone.y<area.y1||stone.y>area.y2||isSanctuary(stone))throw Error("Invalid relocated stone");}');
    assert.equal(run('new Set(locations.map(p=>p.join(":"))).size'),20);
    assert.equal(run('mobs.filter(m=>m.type==="stone").length'),99);
});

test('layout migration preserves damage, dead timers, loot and guards; migrated locations then persist',()=>{
  const {run,saved}=createGame();run('running=true;let stone=mobs.find(m=>m.type==="stone");stone.hp=Math.floor(stone.max/2);spawnMetinGuards(stone);let guard=mobs.find(m=>m.metinParentId);guard.hp=20;let dead=mobs[0];dead.hp=0;dead.dead=3;spawnGroundDrop({kind:"gear",item:{slot:"weapon",name:"Meč",bonus:1}},{x:400,y:400});save();');
  const profile=readSavedProfile(saved),state=profile.worldStates.valley;delete state.layoutSchema;
  const old=state.mobs.find(m=>m.type==='stone');old.x=old.homeX=200;old.y=old.homeY=1300;
  const migrated=createGame(profile);assert.equal(migrated.run('mobs[0].hp'),0);assert.equal(migrated.run('mobs[0].dead'),3);
  assert.equal(migrated.run('mobs.find(m=>m.type==="stone").hp'),old.hp);assert.notEqual(migrated.run('mobs.find(m=>m.type==="stone").x'),200);
  assert.equal(migrated.run('mobs.find(m=>m.metinParentId).hp'),20);assert.equal(migrated.run('drops.length'),1);
  migrated.run('save();');const again=createGame(readSavedProfile(migrated.saved));
  assert.equal(again.run('mobs.find(m=>m.type==="stone").x'),migrated.run('mobs.find(m=>m.type==="stone").x'));
  assert.equal(again.run('p.worldStates.valley.layoutSchema'),2);
});
