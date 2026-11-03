const test = require('node:test'), assert = require('node:assert/strict');
const { createGame, readSavedProfile } = require('./helpers/game.cjs');
function arena(run) { run('running=true;paused=false;p.x=400;p.y=1400;cam.x=p.x;cam.y=p.y;p.hp=maxHP();p.mp=maxMP();attackCD=0;castPose=0;spellCD.fill(0);keysClear();face=0;resetCombatFlow();combatAssist.focused=true;combatAssist.timer=0;combatAssist.nextSkill=0;mobs.forEach(m=>{m.hp=0;m.dead=1000;});var foe=mobs.find(m=>m.type==="wolf");Object.assign(foe,{x:450,y:1400,homeX:450,homeY:1400,hp:10000,max:10000,engaged:0,taunt:0});'); }

test('all six hotbar skills restore canvas focus and Space attacks even if a game button remains focused',()=>{
  const {run,elements,listeners}=createGame();let focuses=0;elements.get('game').focus=()=>focuses++;
  for(let i=0;i<6;i++){
    arena(run);elements.get(i?'skill'+(i+1):'skill').onclick();assert.equal(focuses,i+1);
    run('var health=foe.hp;attackCD=0;');let prevented=false;
    listeners.get('keydown')({key:' ',target:{tagName:'BUTTON'},preventDefault(){prevented=true;}});
    assert(prevented);assert.equal(run('keys[" "]'),true);run('update(.05);');assert(run('foe.hp<health'));
    listeners.get('keyup')({key:' '});assert.equal(run('keys[" "]'),false);
  }
});

test('text editing and paused dialog buttons retain native keyboard handling',()=>{
  const {run,listeners}=createGame();arena(run);
  for(const target of [{tagName:'INPUT'},{tagName:'TEXTAREA'},{tagName:'SELECT'},{tagName:'DIV',isContentEditable:true}]){
    let prevented=false;listeners.get('keydown')({key:' ',target,preventDefault(){prevented=true;}});assert.equal(prevented,false);assert(!run('keys[" "]'));
    listeners.get('keydown')({key:'q',target,preventDefault(){}});assert.equal(run('spellCD[0]'),0);
  }
  run('paused=true;');let prevented=false;listeners.get('keydown')({key:' ',target:{tagName:'BUTTON'},preventDefault(){prevented=true;}});assert.equal(prevented,false);
});

test('auto aim follows cursor while idle and faces nearest enemy only when attacking',()=>{
  const {run,elements}=createGame();arena(run);run('foe.x=350;var far=mobs[1];Object.assign(far,{x:600,y:1400,hp:1000});combatAim.inside=true;combatAim.clientX=900;combatAim.clientY=350;');
  elements.get('auto-aim').onclick();run('updatePlayerControl(.5);');assert(Math.abs(run('face'))<1e-8);
  assert.equal(run('target'),null);assert.equal(run('p.x'),400);assert.equal(run('p.y'),1400);assert.equal(run('foe.hp'),10000);
  assert.equal(run('p.combatAssist.autoSpell'),false);assert.equal(elements.get('auto-aim').attributes['aria-pressed'],'true');
  run('attack();');assert(Math.abs(run('face')-Math.PI)<1e-8);assert(run('foe.hp<10000'));assert.equal(run('far.hp'),1000);
});

test('manual targets override assistance and dead or distant enemies are never retained',()=>{
  const {run}=createGame();arena(run);run('foe.x=350;p.combatAssist.autoAim=true;var far=mobs[1];Object.assign(far,{x:600,y:1400,hp:1000});selectCombatTarget(far);updateFacing();');
  assert.equal(run('face'),0);assert.equal(run('aimEnemy(300)===far'),true);
  run('clearCombatTarget();foe.hp=0;updateFacing();');assert.equal(run('assistedAimEnemy(500,true)===far'),true);
  run('far.hp=0;var stone=mobs.find(m=>m.type==="stone");Object.assign(stone,{x:901,y:1400,hp:1000});');assert.equal(run('assistedAimEnemy()'),null);
  run('stone.x=899;');assert.equal(run('assistedAimEnemy(500,true)===stone'),true);
});

test('autospell waits for a marked engaged target even with auto aim enabled',()=>{
  const {run,elements}=createGame();arena(run);run('foe.x=350;p.classId="sura";p.schools.sura="black";p.mp=maxMP();');
  elements.get('auto-spell').onclick();run('updateAutoSpell(.05);');assert.equal(run('shots.length'),0);assert.equal(run('p.combatAssist.autoAim'),false);
  elements.get('auto-aim').onclick();run('updateAutoSpell(.05);');assert.equal(run('shots.length'),0);run('selectCombatTarget(foe,true);updateAutoSpell(.05);');assert.equal(run('shots.length'),1);assert.equal(run('shots[0].target===foe'),true);
  assert.equal(run('p.mp'),run('maxMP()-school().skills[0][3]'));assert(run('spellCD[0]>0'));run('for(let i=0;i<10;i++)updateShots(.05);');assert(run('foe.hp<10000'));
});

test('automatic casts respect pacing, mana, active buffs and healing thresholds',()=>{
  const {run}=createGame();arena(run);run('p.combatAssist.autoSpell=true;selectCombatTarget(foe,true);castPose=0;updateAutoSpell(.05);var mana=p.mp;');
  assert.equal(run('spellCD.filter(x=>x>0).length'),1);run('for(let i=0;i<15;i++){updateCombat(.05);updateAutoSpell(.05);}');assert.equal(run('spellCD.filter(x=>x>0).length'),1);
  run('p.mp=0;castPose=0;combatAssist.timer=0;var message=$("toast").textContent;updateAutoSpell(1);');assert.equal(run('p.mp'),0);assert.equal(run('$("toast").textContent'),run('message'));
  run('spellCD.fill(10);spellCD[1]=0;p.mp=maxMP();buffs.aura=100;updateAutoSpell(1);');assert.equal(run('p.mp'),run('maxMP()'));
  run('p.classId="shaman";p.schools.shaman="healing";p.hp=1;p.mp=maxMP();spellCD.fill(0);castPose=0;combatAssist.timer=0;updateAutoSpell(1);');assert(run('p.hp>1'));assert(run('spellCD[3]>0'));
});

test('assistance pauses before start, in sanctuary, during dialogs, death, blur and hidden tabs',()=>{
  for(const condition of ['running=false','paused=true','p.hp=0','p.x=1000;p.y=1050','combatAssist.focused=false','document.hidden=true']){
    const {run}=createGame();arena(run);run('p.combatAssist={autoAim:true,autoSpell:true};'+condition+';updateAutoSpell(1);');assert.equal(run('spellCD.some(x=>x>0)'),false,condition);assert.equal(run('assistedAimEnemy()'),null,condition);
  }
  const {run,listeners}=createGame();arena(run);run('p.combatAssist={autoAim:true,autoSpell:true};');listeners.get('blur')();run('updateAutoSpell(1);');assert.equal(run('spellCD[0]'),0);
  listeners.get('focus')();run('updateAutoSpell(.05);');assert.equal(run('spellCD[0]'),0);run('selectCombatTarget(foe,true);updateAutoSpell(.05);');assert(run('spellCD[0]>0'));
});

test('toggle preferences persist independently, and Escape stops automatic combat immediately',()=>{
  const {run,elements,saved,listeners}=createGame();arena(run);elements.get('auto-aim').onclick();
  const restored=createGame(readSavedProfile(saved));assert.equal(restored.run('p.combatAssist.autoAim'),true);assert.equal(restored.run('p.combatAssist.autoSpell'),false);
  elements.get('auto-spell').onclick();listeners.get('keydown')({key:'Escape',preventDefault(){}});assert.equal(run('p.combatAssist.autoAim'),false);assert.equal(run('p.combatAssist.autoSpell'),false);
  run('updateAutoSpell(1);');assert.equal(run('spellCD[0]'),0);assert.equal(elements.get('auto-spell').attributes['aria-pressed'],'false');
  assert.equal(run('toggleCombatAssist("invalid")'),false);
});
