const test=require('node:test'),assert=require('node:assert/strict');
const { createGame, readSavedProfile }=require('./helpers/game.cjs');

function arena(run){run('running=true;paused=false;p.x=400;p.y=1400;cam.x=p.x;cam.y=p.y;p.hp=100000;face=0;attackCD=0;castPose=0;combatAim.inside=false;resetCombatFlow();mobs.forEach(m=>{m.hp=0;m.dead=1000;m.dot=null;m.dots=[];});let foe=mobs.find(m=>m.type==="wolf");Object.assign(foe,{x:700,y:1400,homeX:700,homeY:1400,hp:10000,max:10000,skin:"wolf",resistances:{physical:0,piercing:0,fire:0,poison:0,dark:0,lightning:0,arcane:0},engaged:0,taunt:0,cd:2});');}

test('empty terrain clicks cancel selection and walk to the clicked point without attacking',()=>{
  const {run,listeners}=createGame();arena(run);run('foe.hp=0;let x=p.x,y=p.y;');
  listeners.get('game:pointerdown')({clientX:850,clientY:350,button:0});
  assert.equal(run('target'),null);assert.equal(run('attackCD'),0);assert.equal(run('effects.length'),0);
  run('for(let i=0;i<30;i++)update(.05);');assert(run('p.x>x'));assert(run('Math.abs(p.x-(x+250))<2'));assert.equal(run('p.y'),run('y'));
});

test('a selected moving enemy is followed at its live position and attacked repeatedly in range',()=>{
  const {run,listeners}=createGame();arena(run);
  listeners.get('game:pointerdown')({clientX:900,clientY:333,button:0});assert.equal(run('target===foe'),true);listeners.get('game:pointerdown')({clientX:900,clientY:333,button:0});listeners.get('game:dblclick')({clientX:900,clientY:333,button:0});
  run('foe.x=850;foe.y=1500;let before=Math.hypot(foe.x-p.x,foe.y-p.y);updatePlayerControl(.3);');
  assert(run('p.x>400&&p.y>1400'));assert(run('Math.hypot(foe.x-p.x,foe.y-p.y)<before'));
  run('for(let i=0;i<180;i++)update(.05);');
  assert(run('foe.hp<9900'));assert(run('Math.hypot(foe.x-p.x,foe.y-p.y)<=BATTLE.meleeRange'));
  assert.equal(run('target===foe'),true);
});

test('target death stops following and respawn never silently reacquires the same object',()=>{
  const {run}=createGame();arena(run);run('selectCombatTarget(foe);hit(foe,999999);let x=p.x,y=p.y;');
  assert.equal(run('target'),null);run('respawnEnemy(foe);for(let i=0;i<10;i++)updatePlayerControl(.05);');
  assert.equal(run('target'),null);assert.equal(run('p.x'),run('x'));assert.equal(run('p.y'),run('y'));
});

test('keyboard movement, Escape and blur cancel automated following',()=>{
  const {run,listeners}=createGame();arena(run);run('selectCombatTarget(foe);');
  listeners.get('keydown')({key:'w',repeat:false,preventDefault(){}});run('updatePlayerControl(.1);');
  assert.equal(run('target'),null);assert(run('p.y<1400'));
  run('keysClear();selectCombatTarget(foe);');listeners.get('keydown')({key:'Escape',repeat:false,preventDefault(){}});assert.equal(run('target'),null);
  run('selectCombatTarget(foe);keys.w=true;');listeners.get('blur')();assert.equal(run('target'),null);assert.equal(run('keys.w'),false);
});

test('cursor facing keeps the forward reach beyond the close cleave while strafing',()=>{
  const {run,listeners}=createGame();arena(run);
  run('foe.x=480;foe.homeX=480;let back=mobs.filter(m=>m.type==="wolf")[1];Object.assign(back,{hp:1000,max:1000,x:320,y:1400,skin:"wolf"});rand=()=>.99;');
  listeners.get('game:pointermove')({clientX:800,clientY:350});run('attack();let health=foe.hp;');
  assert(run('foe.hp<10000'));assert.equal(run('back.hp'),1000);
  listeners.get('game:pointermove')({clientX:200,clientY:350});run('attackCD=0;attack();');
  assert(run('back.hp<1000'));assert.equal(run('foe.hp'),run('health'));assert(run('Math.cos(face)<-.9'));
  listeners.get('game:pointermove')({clientX:800,clientY:350});run('keys.w=true;updatePlayerControl(.1);');
  assert(run('p.y<1400&&Math.cos(face)>.9'));
});

test('archers fire aimed ballistic arrows without a marked target and do not seek enemies behind',()=>{
  const {run,listeners}=createGame();arena(run);
  run('p.classId="ninja";p.schools.ninja="archery";foe.x=600;foe.homeX=600;let back=mobs.filter(m=>m.type==="wolf")[1];Object.assign(back,{hp:1000,max:1000,x:350,y:1400,skin:"wolf"});');
  listeners.get('game:pointerdown')({clientX:1050,clientY:350,button:0});
  listeners.get('keydown')({key:' ',preventDefault(){}});run('update(.01);');assert.equal(run('target'),null);assert.equal(run('shots[0].target'),null);assert(run('shots[0].vx>.99'));
  run('for(let i=0;i<10;i++){updateCombat(.05);drawEffects();}');assert(run('foe.hp<10000'));assert.equal(run('back.hp'),1000);
});

test('directional skills stay in the aiming direction while radial skills retain their tactical full circle',()=>{
  const {run}=createGame();arena(run);
  run('p.schools.warrior="mental";foe.x=450;let back=mobs.filter(m=>m.type==="wolf")[1];Object.assign(back,{hp:1000,max:1000,x:350,y:1400,skin:"wolf"});p.mp=maxMP();castSkill(0);');
  assert(run('foe.hp<10000'));assert.equal(run('back.hp'),1000);
  run('p.schools.warrior="body";spellCD.fill(0);p.mp=maxMP();castSkill(0);');assert(run('back.hp<1000'));
});

test('all seven types apply resistances and weaknesses to enemies and equipment protects the player',()=>{
  const {run}=createGame();arena(run);
  for(const type of Object.keys(run('DAMAGE_TYPES'))){
    run(`foe.hp=1000;foe.resistances={'${type}':.5};hit(foe,100,'${type}');`);assert.equal(run('foe.hp'),950,type);
    run(`foe.hp=1000;foe.resistances={'${type}':-.25};hit(foe,100,'${type}');`);assert.equal(run('foe.hp'),875,type);
  }
  run('p.equipped.armor={slot:"armor",bonus:0,stats:{fireResist:.5}};p.hp=1000;takeDamage(100,{skin:"demon"},"fire");');assert.equal(run('p.hp'),950);
  run('p.hp=1000;takeDamage(100,{skin:"wolf"},"physical");');assert.equal(run('p.hp'),900);
  assert.equal(run('signedItemStat("fireResist",.1)'),'+10 %');
});

test('school passives unlock at actual level gates and affect mana, damage, critical chance and defense',()=>{
  const {run}=createGame();arena(run);
  for(const [level,rank]of [[1,0],[9,0],[10,1],[25,2],[50,3],[75,4],[99,4]]){run(`p.level=${level};`);assert.equal(run('passiveRank()'),rank);}
  run('p.level=10;p.classId="sura";p.schools.sura="weapon";let before=maxMP();p.schools.sura="black";');assert.equal(run('maxMP()'),run('before')+15);
  run('p.classId="warrior";p.schools.warrior="mental";p.hp=1000;takeDamage(100,null,"physical");');assert.equal(run('p.hp'),906);
  run('p.classId="shaman";p.schools.shaman="healing";rand=()=>.99;foe.hp=10000;hurtMob(foe,1,true,null,{type:"fire"});let ordinary=10000-foe.hp;p.schools.shaman="dragon";foe.hp=10000;hurtMob(foe,1,true,null,{type:"fire"});');assert(run('10000-foe.hp>ordinary'));
  run('p.classId="ninja";p.schools.ninja="archery";let crit=criticalChance();p.schools.ninja="blade";');assert(run('criticalChance()>crit'));
});

test('combos increase real damage, survive failed casts, expire, and can strengthen healing',()=>{
  const baseline=createGame();arena(baseline.run);baseline.run('foe.x=450;p.level=10;rand=()=>.99;p.mp=maxMP();buffs.aura=12;castSkill(0);');const normal=baseline.run('10000-foe.hp');
  const {run}=createGame();arena(run);run('foe.x=450;p.level=10;rand=()=>.99;p.mp=maxMP();castSkill(1);p.mp=0;');
  assert.equal(run('castSkill(0)'),false);assert.equal(run('combatFlow.lastKey'),'body:1');
  run('p.mp=maxMP();castSkill(0);');assert(run('10000-foe.hp>0')&&run('10000-foe.hp')>normal);assert.equal(run('combatFlow.name'),'Búrka čepelí');
  run('resetCombatFlow();spellCD.fill(0);p.mp=maxMP();castSkill(1);updateCombatFlow(4.1);spellCD[0]=0;castSkill(0);');assert.equal(run('combatFlow.flash'),0);
  const healed=createGame();arena(healed.run);healed.run('p.classId="shaman";p.schools.shaman="healing";p.level=25;p.hp=1;p.mp=maxMP();castSkill(3);');
  run('resetCombatFlow();p.classId="shaman";p.schools.shaman="healing";p.level=25;p.hp=1;p.mp=maxMP();spellCD.fill(0);castSkill(4);castSkill(3);');assert(run('p.hp')>healed.run('p.hp'));
});

test('Bojový rytmus requires actual basic hits and is consumed only by a successful offensive skill',()=>{
  const {run}=createGame();arena(run);run('p.level=10;foe.x=450;rand=()=>.99;for(let i=0;i<3;i++){attackCD=0;attack();}');assert(run('combatFlow.rhythm>0'));
  run('p.mp=maxMP();castSkill(1);');assert(run('combatFlow.rhythm>0'));
  run('p.mp=0;');assert.equal(run('castSkill(0)'),false);assert(run('combatFlow.rhythm>0'));
  run('p.mp=maxMP();castSkill(0);');assert.equal(run('combatFlow.rhythm'),0);
});

test('poison and fire coexist, same-type effects refresh, and persistent states do not share mutable arrays',()=>{
  const {run,saved}=createGame();arena(run);run('foe.skin="wolf";foe.resistances={poison:.15,fire:-.1};applyDamageOverTime(foe,"poison",9);applyDamageOverTime(foe,"fire",9);applyDamageOverTime(foe,"poison",14);applyDamageOverTime(foe,"poison",9);');
  assert.equal(run('foe.dots.length'),2);assert.equal(run('foe.dots.find(d=>d.kind==="poison").power'),14);
  run('let before=foe.hp;updateCombat(1);');assert.equal(run('before-foe.hp'),22);
  run('save();let id=foe.spawnId,savedTime=p.worldStates.valley.mobs.find(m=>m.spawnId===id).dots[0].time;foe.dots[0].time=1;');
  assert.equal(run('p.worldStates.valley.mobs.find(m=>m.spawnId===id).dots[0].time'),run('savedTime'));
  const reload=createGame(readSavedProfile(saved));assert.equal(reload.run(`mobs.find(m=>m.spawnId==='${run('id')}').dots.length`),2);assert.equal(reload.run('target'),null);
});

test('48 active skills emit distinct animations and still enforce their mana and cooldown',()=>{
  const {run}=createGame();arena(run);const seen=new Set();
  for(const id of Object.keys(run('SCHOOLS')))for(let i=0;i<6;i++){
    run(`resetCombatFlow();p.classId=SCHOOLS['${id}'].classId;p.schools[p.classId]='${id}';p.x=400;p.y=1400;face=0;foe.x=450;foe.y=1400;foe.hp=100000;foe.max=100000;p.hp=maxHP();p.mp=maxMP();spellCD.fill(0);effects.length=0;`);
    const before=run('p.mp');assert.equal(run(`castSkill(${i})`),true,id+':'+i);assert.equal(run('p.mp'),before-run(`school().skills[${i}][3]`));assert.equal(run(`castSkill(${i})`),false);
    const key=run('effects.find(e=>e.style==="skillSigil").ability');seen.add(key);assert.equal(key,id+':'+i);run('drawBattleEffects();');
  }
  assert.equal(seen.size,48);
});

test('selected magical targets take priority and homing projectiles differ from ballistic arrows',()=>{
  const {run}=createGame();arena(run);run('p.classId="sura";p.schools.sura="black";let near=mobs.filter(m=>m.type==="wolf")[1];Object.assign(near,{hp:1000,max:1000,x:450,y:1400,skin:"wolf"});foe.x=600;selectCombatTarget(foe);p.mp=maxMP();castSkill(0);');
  assert.equal(run('shots[0].target===foe'),true);run('for(let i=0;i<15;i++)updateCombat(.05);');assert(run('foe.hp<10000'));assert.equal(run('near.hp'),1000);
});

test('combat UI explains actual passives, damage types, combo sequences and the selected target',()=>{
  const {run,elements}=createGame();arena(run);run('selectCombatTarget(foe);updateCombatHUD();');
  assert.equal(elements.get('target-panel').hidden,false);assert.match(elements.get('target-panel').innerHTML,/OZNAČENÝ CIEĽ/);
  run('spellbook();');assert.match(elements.get('modalcontent').innerHTML,/Bojový rytmus/);assert.match(elements.get('modalcontent').innerHTML,/Búrka čepelí/);
  run('help();');assert.match(elements.get('modalcontent').innerHTML,/Automatický boj a bojové pravidlá/);assert.match(elements.get('modalcontent').innerHTML,/Kritický zásah/);
});
